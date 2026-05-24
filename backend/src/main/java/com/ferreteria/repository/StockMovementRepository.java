package com.ferreteria.repository;

import com.ferreteria.model.StockMovement;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    // Para obtener el último movimiento:
    Optional<StockMovement> findTopByProductIdOrderByOccurredAtDesc(UUID productId);
    // Para obtener un historial o reporte de todos los movimientos ordenados:
    List<StockMovement> findByProductIdOrderByOccurredAtDesc(UUID productId);

}
