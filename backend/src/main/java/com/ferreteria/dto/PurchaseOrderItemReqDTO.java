package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PurchaseOrderItemReqDTO {
    private UUID productId;
    private BigDecimal qty;
}
