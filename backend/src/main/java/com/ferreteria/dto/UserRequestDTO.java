package com.ferreteria.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserRequestDTO {
    private UUID employeeId;
    private String username;
    private String role;
    private String password;
}
