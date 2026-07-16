package com.ferreteria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class InventoryBoxRequestDTO {
    @NotBlank
    private String name;
    private String brandId;
    private String brandName;
    private String origin;
    @NotEmpty
    private List<Map<String, Object>> items;
}
