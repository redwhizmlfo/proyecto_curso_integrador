package com.ferreteria.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EmployeeRequestDTO {
    private String initials;
    private String name;
    private String role;
    private String dni;
    private BigDecimal payPerDay;
}
