package com.ferreteria.repository;

import com.ferreteria.model.StockMovement;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    // Esta consulta obtiene el último stock registrado de un producto específico.
    // Selecciona el campo stockAfter de la entidad StockMovement.    
    // WHERE sm.product.id = :productId → filtramos por el producto cuyo ID se pasa como parámetro.
    // ORDER BY sm.occurredAt DESC → ordenamos los movimientos por fecha/hora en orden descendente (el más reciente primero).
    // Optional<BigDecimal> → devuelve el stockAfter más reciente, o vacío si no hay movimientos.
    @Query("SELECT sm.stockAfter FROM StockMovement sm WHERE sm.productId = :productId ORDER BY sm.occurredAt DESC LIMIT 1")
    Optional<BigDecimal> findLastStockByProductId(@Param("productId") UUID productId);

}
