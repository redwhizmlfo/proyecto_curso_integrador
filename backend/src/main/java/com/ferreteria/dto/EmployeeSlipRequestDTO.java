package com.ferreteria.dto;

import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSlipRequestDTO {
    private UUID employeeId;
    private UUID createdByUserId;
    private String periodLabel;
    private BigDecimal workedDays;
    private BigDecimal payPerDay;    
}
