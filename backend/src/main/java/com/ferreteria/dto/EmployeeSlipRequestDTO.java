package com.ferreteria.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class EmployeeSlipRequestDTO {
    private UUID employeeId;
    private UUID createdByUserId;
    private String periodLabel;
}
