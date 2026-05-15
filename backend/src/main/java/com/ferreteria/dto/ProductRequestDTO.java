package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductRequestDTO {
    private String name;
    private String barcode;
    private String category;
    private String unit;
    private String description;
    private BigDecimal cost;
    private BigDecimal price;
    private BigDecimal stock;
    private BigDecimal minStock;
    private String imageUrl;
    private UUID supplierId;
}
