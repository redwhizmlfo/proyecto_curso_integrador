package com.ferreteria.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PosCatalogProductDTO(
        UUID id,
        String name,
        String brand,
        String model,
        String sku,
        BigDecimal price,
        Integer stock,
        String imageUrl
) {}
