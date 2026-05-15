package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class LossRequestDTO {
    private UUID productId;
    private UUID userId;
    private BigDecimal qty;
    private String reason;
    private String responsible;
}
