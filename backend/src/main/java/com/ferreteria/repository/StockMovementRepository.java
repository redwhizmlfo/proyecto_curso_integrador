package com.ferreteria.repository;

import com.ferreteria.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    // Para obtener el último movimiento por producto (usado en cálculo de stockBefore):
    Optional<StockMovement> findTopByProductIdOrderByOccurredAtDesc(UUID productId);
    // Para historial/reporte de movimientos ordenados:
    List<StockMovement> findByProductIdOrderByOccurredAtDesc(UUID productId);
}
