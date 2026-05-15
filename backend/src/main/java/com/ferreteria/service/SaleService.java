package com.ferreteria.service;

import com.ferreteria.dto.SaleItemDTO;
import com.ferreteria.dto.SaleRequestDTO;
import com.ferreteria.model.*;
import com.ferreteria.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final StockMovementRepository stockMovementRepository;

    private static final BigDecimal IGV_RATE = new BigDecimal("0.18");

    @Transactional
    public Sale createSale(SaleRequestDTO request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId()).orElse(null);
        }

        User user = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Sale sale = Sale.builder()
                .customer(customer)
                .employee(employee)
                .createdByUser(user)
                .series(request.getSeries())
                .documentType(request.getDocumentType())
                .paymentMethod(request.getPaymentMethod())
                .soldAt(OffsetDateTime.now())
                .clientNameSnapshot(customer.getName())
                .clientDocTypeSnapshot(customer.getDocType())
                .clientDocNumberSnapshot(customer.getDocNumber())
                .sellerNameSnapshot(employee != null ? employee.getName() : "SISTEMA")
                .discountPct(request.getDiscountPct() != null ? request.getDiscountPct() : BigDecimal.ZERO)
                .note(request.getNote())
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleItemDTO itemDTO : request.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemDTO.getProductId()));

            if (product.getStock().compareTo(itemDTO.getQty()) < 0) {
                throw new RuntimeException("Stock insuficiente para: " + product.getName());
            }

            // Create Sale Item
            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .barcodeSnapshot(product.getBarcode())
                    .supplierId(product.getSupplier().getId())
                    .supplierNameSnapshot(product.getSupplierNameSnapshot())
                    .categorySnapshot(product.getCategory())
                    .unitSnapshot(product.getUnit())
                    .qty(itemDTO.getQty())
                    .price(itemDTO.getPrice())
                    .cost(product.getCost())
                    .build();

            sale.getItems().add(saleItem);
            
            BigDecimal itemTotal = itemDTO.getQty().multiply(itemDTO.getPrice());
            subtotal = subtotal.add(itemTotal);

            // Update Stock
            BigDecimal stockBefore = product.getStock();
            product.setStock(stockBefore.subtract(itemDTO.getQty()));
            productRepository.save(product);

            // Register Stock Movement
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .createdByUser(user)
                    .movementType("venta")
                    .sourceModule("ventas")
                    .delta(itemDTO.getQty().negate())
                    .unitSnapshot(product.getUnit())
                    .stockBefore(stockBefore)
                    .stockAfter(product.getStock())
                    .productNameSnapshot(product.getName())
                    .detail("Venta Serie " + sale.getSeries())
                    .build();
            stockMovementRepository.save(movement);
        }

        // Calculations
        BigDecimal igv = subtotal.multiply(IGV_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(igv).setScale(2, RoundingMode.HALF_UP);

        sale.setSubtotal(subtotal);
        sale.setIgv(igv);
        sale.setTotal(total);

        return saleRepository.save(sale);
    }
}
