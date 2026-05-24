package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SaleItemDTO {
    private String productId;
    private BigDecimal qty;
    private BigDecimal price; // Price at the time of sale
}
