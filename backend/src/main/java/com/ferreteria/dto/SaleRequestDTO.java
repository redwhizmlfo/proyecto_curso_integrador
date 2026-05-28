package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SaleRequestDTO {
    private String customerId;
    private String customerDocNumber;
    private UUID employeeId;
    private UUID createdByUserId;
    private String series;
    private String documentType;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentReference;
    private String paymentEvidenceName;
    private String paymentBankName;
    private String paymentBankAccountAlias;
    private String paymentBankAccountNumber;
    private BigDecimal discountPct;
    private String note;
    private List<SaleItemDTO> items;
}
