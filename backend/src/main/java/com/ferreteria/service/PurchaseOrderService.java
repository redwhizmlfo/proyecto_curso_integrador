package com.ferreteria.service;

import com.ferreteria.dto.PurchaseOrderItemReqDTO;
import com.ferreteria.dto.PurchaseOrderReqDTO;
import com.ferreteria.model.*;
import com.ferreteria.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final StockMovementRepository stockMovementRepository;

    public List<PurchaseOrder> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public PurchaseOrder createOrder(PurchaseOrderReqDTO request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
                
        User user = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("Usuario creador no encontrado"));

        PurchaseOrder order = PurchaseOrder.builder()
                .supplier(supplier)
                .createdByUser(user)
                .supplierNameSnapshot(supplier.getName())
                .status("pendiente")
                .priority(request.getPriority() != null ? request.getPriority() : "media")
                .note(request.getNote())
                .items(new ArrayList<>())
                .totalUnits(BigDecimal.ZERO)
                .totalLines(request.getItems().size())
                .build();

        BigDecimal totalUnits = BigDecimal.ZERO;

        for (PurchaseOrderItemReqDTO itemDto : request.getItems()) {
            Product p = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            
            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order)
                    .product(p)
                    .productNameSnapshot(p.getName())
                    .categorySnapshot(p.getCategory())
                    .unitSnapshot(p.getUnit())
                    .qty(itemDto.getQty())
                    .build();
            
            order.getItems().add(item);
            totalUnits = totalUnits.add(itemDto.getQty());
        }
        
        order.setTotalUnits(totalUnits);
        return orderRepository.save(order);
    }

    @Transactional
    public PurchaseOrder receiveOrder(UUID orderId, UUID receivedByUserId) {
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
                
        if ("recibido".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Este pedido ya ha sido recibido.");
        }
        
        User user = userRepository.findById(receivedByUserId)
                .orElseThrow(() -> new RuntimeException("Usuario receptor no encontrado"));

        order.setStatus("recibido");
        order.setReceivedByUser(user);
        order.setReceivedAt(OffsetDateTime.now());

        // Update Stock!
        for (PurchaseOrderItem item : order.getItems()) {
            Product p = item.getProduct();
            BigDecimal stockBefore = p.getStock();
            p.setStock(stockBefore.add(item.getQty()));
            productRepository.save(p);

            StockMovement movement = StockMovement.builder()
                    .product(p)
                    .createdByUser(user)
                    .movementType("compra")
                    .sourceModule("compras")
                    .delta(item.getQty())
                    .unitSnapshot(p.getUnit())
                    .stockBefore(stockBefore)
                    .stockAfter(p.getStock())
                    .productNameSnapshot(p.getName())
                    .detail("Recepción de Pedido #" + order.getId().toString().substring(0, 8))
                    .build();
            stockMovementRepository.save(movement);
        }

        return orderRepository.save(order);
    }
}
