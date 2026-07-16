package com.ferreteria.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class InventoryBoxHistoryResponseDTO {
    private UUID id;
    private String boxName;
    private String brandName;
    private String dateReleased;
    private List<Map<String, Object>> items;
}
