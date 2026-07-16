package com.ferreteria.dto;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class UserPermissionsDTO {
    private Set<String> permissions = new HashSet<>();
}
