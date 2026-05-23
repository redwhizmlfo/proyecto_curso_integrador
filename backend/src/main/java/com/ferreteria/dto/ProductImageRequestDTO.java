package com.ferreteria.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ProductImageRequestDTO {
    private UUID productId;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean isPrimary;
}
