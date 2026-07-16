package com.ferreteria.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class InventoryBoxResponseDTO {
    private UUID id;
    private String name;
    private String brandId;
    private String brandName;
    private String status;
    private String origin;
    private String dateRegistered;
    private List<Map<String, Object>> items;
}
