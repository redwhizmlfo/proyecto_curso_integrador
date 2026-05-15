package com.ferreteria.service;

import com.ferreteria.model.Loss;
import com.ferreteria.model.Product;
import com.ferreteria.model.StockMovement;
import com.ferreteria.model.User;
import com.ferreteria.repository.LossRepository;
import com.ferreteria.repository.ProductRepository;
import com.ferreteria.repository.StockMovementRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LossService {

    private final LossRepository lossRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public Loss registerLoss(UUID productId, UUID userId, BigDecimal qty, String reason, String responsible) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (product.getStock().compareTo(qty) < 0) {
            throw new RuntimeException("No hay suficiente stock para reportar esta pérdida");
        }

        BigDecimal stockBefore = product.getStock();
        product.setStock(stockBefore.subtract(qty));
        productRepository.save(product);

        // Register Stock Movement
        StockMovement movement = StockMovement.builder()
                .product(product)
                .createdByUser(user)
                .movementType("perdida")
                .sourceModule("inventario")
                .delta(qty.negate())
                .unitSnapshot(product.getUnit())
                .stockBefore(stockBefore)
                .stockAfter(product.getStock())
                .productNameSnapshot(product.getName())
                .detail("Pérdida registrada: " + reason)
                .build();
        stockMovementRepository.save(movement);

        // Create Loss
        Loss loss = Loss.builder()
                .product(product)
                .createdByUser(user)
                .productNameSnapshot(product.getName())
                .categorySnapshot(product.getCategory())
                .reason(reason)
                .qty(qty)
                .unitCostSnapshot(product.getCost())
                .lossAmount(product.getCost().multiply(qty))
                .responsibleSnapshot(responsible)
                .status("active")
                .build();

        return lossRepository.save(loss);
    }

    @Transactional
    public Loss revertLoss(UUID lossId, UUID userId) {
        Loss loss = lossRepository.findById(lossId)
                .orElseThrow(() -> new RuntimeException("Registro de pérdida no encontrado"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!"active".equalsIgnoreCase(loss.getStatus())) {
            throw new RuntimeException("Esta pérdida ya ha sido revertida o no está activa");
        }

        Product product = loss.getProduct();
        BigDecimal stockBefore = product.getStock();
        product.setStock(stockBefore.add(loss.getQty()));
        productRepository.save(product);

        // Register Stock Movement
        StockMovement movement = StockMovement.builder()
                .product(product)
                .createdByUser(user)
                .movementType("anulacion_perdida")
                .sourceModule("inventario")
                .delta(loss.getQty())
                .unitSnapshot(product.getUnit())
                .stockBefore(stockBefore)
                .stockAfter(product.getStock())
                .productNameSnapshot(product.getName())
                .detail("Reversión de pérdida ID: " + lossId)
                .build();
        stockMovementRepository.save(movement);

        // Update Loss
        loss.setStatus("reverted");
        loss.setRevertedByUser(user);
        loss.setRevertedAt(OffsetDateTime.now());

        return lossRepository.save(loss);
    }
}
