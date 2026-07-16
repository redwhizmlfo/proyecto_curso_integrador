package com.ferreteria.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryMinStockRequestDTO {
    @NotNull
    @Min(0)
    private Integer minStock;
}
