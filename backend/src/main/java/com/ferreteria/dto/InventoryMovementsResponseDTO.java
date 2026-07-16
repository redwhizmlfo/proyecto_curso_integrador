package com.ferreteria.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class InventoryMovementsResponseDTO {
    private List<InventoryBoxResponseDTO> boxes;
    private List<InventoryBoxHistoryResponseDTO> history;
}
