package com.ferreteria.dto;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.Data;

@Data
public class StockMovementRequestDTO {
    private UUID productId;
    private UUID userId;
    private String movementType;
    private String sourceModule;
    private String reasonCode; // opcional: motivo
    private BigDecimal delta;  // la variacion que aplica el movimiento
    private String detail;
}
