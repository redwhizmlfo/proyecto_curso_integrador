package com.ferreteria.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class PurchaseOrderReqDTO {
    private UUID supplierId;
    private UUID createdByUserId;
    private String priority;
    private String note;
    private List<PurchaseOrderItemReqDTO> items;
}
