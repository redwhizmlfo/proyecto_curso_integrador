package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SaleItemDTO {
    private UUID productId;
    private BigDecimal qty;
    private BigDecimal price; // Price at the time of sale
}
