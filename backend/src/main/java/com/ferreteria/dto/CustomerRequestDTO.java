package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CustomerRequestDTO {
    private String name;
    private String docType;
    private String docNumber;
    private String phone;
    private String email;
    private String address;
    private BigDecimal preferredDiscount;
}
