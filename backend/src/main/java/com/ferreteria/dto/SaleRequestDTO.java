package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SaleRequestDTO {
    private UUID customerId;
    private UUID employeeId;
    private UUID createdByUserId;
    private String series;
    private String documentType;
    private String paymentMethod;
    private BigDecimal discountPct;
    private String note;
    private List<SaleItemDTO> items;
}
