package com.ferreteria.service;

import com.ferreteria.dto.StockMovementRequestDTO;
import com.ferreteria.model.Product;
import com.ferreteria.model.StockMovement;
import com.ferreteria.model.User;
import com.ferreteria.repository.ProductRepository;
import com.ferreteria.repository.StockMovementRepository;
import com.ferreteria.repository.UserRepository;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public List<StockMovement> getAllStockMovements() {
        return stockMovementRepository.findAll(Sort.by(Sort.Direction.DESC, "occurredAt"));
    }

    public List<StockMovement> getAll() {
        return stockMovementRepository.findAll();
    }

    public StockMovement getStockMovementById(UUID id) {
        return stockMovementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento de stock no encontrado"));
    }

    public List<StockMovement> getStockMovementsByProduct(UUID productId) {
        return stockMovementRepository.findByProductIdOrderByOccurredAtDesc(productId);
    }

    @Transactional
    public StockMovement createStockMovement(StockMovementRequestDTO request) {
        Product p = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        User u = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Usamos el método del repo que devuelve el último movimiento:
        Optional<StockMovement> lastMovementOption = stockMovementRepository
                .findTopByProductIdOrderByOccurredAtDesc(p.getId());
        // Si existe el movimiento, tomamos su stockAfter, sino asumimos que es cero:
        BigDecimal stockBefore = lastMovementOption
                .map(StockMovement::getStockAfter)
                .orElse(BigDecimal.ZERO);

        // stockAfter = stockBefore + delta
        BigDecimal stockAfter = stockBefore.add(request.getDelta());

        StockMovement sm = StockMovement.builder()
                .product(p)
                .createdByUser(u)
                .movementType(request.getMovementType())
                .sourceModule(request.getSourceModule())
                .reasonCode(request.getReasonCode())
                .delta(request.getDelta())
                .unitSnapshot(p.getUnit())
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .detail(request.getDetail())
                .productNameSnapshot(p.getName())
                .occurredAt(OffsetDateTime.now())
                .build();

        return stockMovementRepository.save(sm);
    }
}
