package com.ferreteria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
public class SalesWorkflowDocumentRequestDTO {
    @NotBlank
    private String docNumber;
    private String orderNumber;
    private OffsetDateTime date;
    @NotNull
    private Map<String, Object> customer;
    @NotEmpty
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
    @NotNull
    private BigDecimal total;
    private BigDecimal discountPct;
    private BigDecimal discountAmount;
    private String status;
    private String originAddress;
    private String destinationAddress;
}
