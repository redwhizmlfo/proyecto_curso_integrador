package com.ferreteria.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class SalesWorkflowDocumentResponseDTO {
    private UUID id;
    private String docNumber;
    private String orderNumber;
    private OffsetDateTime date;
    private Map<String, Object> customer;
    private List<Map<String, Object>> items;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentReference;
    private String paymentEvidenceName;
    private String paymentBankName;
    private String paymentBankAccountAlias;
    private String paymentBankAccountNumber;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;
    private BigDecimal discountPct;
    private BigDecimal discountAmount;
    private String status;
    private String originAddress;
    private String destinationAddress;
}
