package com.ferreteria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UserRequestDTO {
    private UUID employeeId;

    @NotBlank(message = "El usuario es obligatorio")
    @Size(max = 80, message = "El usuario no debe superar 80 caracteres")
    private String username;

    @NotBlank(message = "El rol es obligatorio")
    @Size(max = 80, message = "El rol no debe superar 80 caracteres")
    private String role;

    @Size(min = 6, max = 120, message = "La contrasena debe tener entre 6 y 120 caracteres")
    private String password;

    @Size(max = 32, message = "El estado no debe superar 32 caracteres")
    private String status;

    private Boolean active;
}
