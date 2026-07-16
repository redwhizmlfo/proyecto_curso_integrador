package com.ferreteria.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SalesWorkflowStatusRequestDTO {
    @NotBlank
    private String status;
}
