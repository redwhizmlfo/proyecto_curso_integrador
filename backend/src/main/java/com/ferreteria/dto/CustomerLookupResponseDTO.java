package com.ferreteria.dto;

import com.ferreteria.model.Customer;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CustomerLookupResponseDTO {
    private UUID id;
    private String name;
    private String docType;
    private String docNumber;
    private String phone;
    private String email;
    private String address;
    private BigDecimal preferredDiscount;
    private String status;
    private String condition;
    private String source;
    private boolean created;

    public static CustomerLookupResponseDTO fromCustomer(Customer customer, String source, boolean created) {
        return CustomerLookupResponseDTO.builder()
                .id(customer.getId())
                .name(customer.getName())
                .docType(customer.getDocType())
                .docNumber(customer.getDocNumber())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .preferredDiscount(customer.getPreferredDiscount())
                .status("VALIDADO")
                .condition(customer.getDocType().equalsIgnoreCase("RUC") ? "ACTIVO" : "HABIDO")
                .source(source)
                .created(created)
                .build();
    }
}
