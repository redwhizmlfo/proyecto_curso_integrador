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
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    
    private final StockMovementRepository stockMovementRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    
    public List<StockMovement> getAll() {
        return this.stockMovementRepo.findAll();
    }
    
    public StockMovement getStockMovementById(UUID id) {
        return this.stockMovementRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento de stock no encontrada"));
    
    }
    
    @Transactional
    public StockMovement createStockMovement(StockMovementRequestDTO request) {
        Product p = this.productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        User u = this.userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Obtener el último stock registrado: stockBefore → Cantidad de producto que había antes del movimiento.        
        BigDecimal stockBefore = this.stockMovementRepo.findLastStockByProductId(p.getId())
                .orElse(BigDecimal.ZERO);
        
        // Cantidad de producto que queda después del movimiento: stockAfter = stockBefore + delta
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
                .occurredAt(OffsetDateTime.now()) // Fecha/hora actual con offset
                .build();
        
        return this.stockMovementRepo.save(sm);

    }
}
