package com.ferreteria.service;

import com.ferreteria.dto.UserRequestDTO;
import com.ferreteria.model.Employee;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final InputSanitizationService inputSanitizationService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(UserRequestDTO request) {
        if (request.getEmployeeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El empleado es obligatorio");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contrasena es obligatoria");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empleado no encontrado"));

        userRepository.findByEmployeeId(employee.getId()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El empleado ya tiene una cuenta de usuario");
        });

        String username = inputSanitizationService.requiredText(request.getUsername(), "usuario");
        userRepository.findByUsername(username).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
        });

        User user = User.builder()
                .employee(employee)
                .username(username)
                .role(normalizeRole(request.getRole()))
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(normalizeStatus(request.getStatus()))
                .isActive(request.getActive() == null || request.getActive())
                .build();
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, UserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String username = inputSanitizationService.requiredText(request.getUsername(), "usuario");
            userRepository.findByUsername(username)
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya existe");
                    });
            user.setUsername(username);
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(normalizeRole(request.getRole()));
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(normalizeStatus(request.getStatus()));
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Set<String> getUserPermissions(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return user.getModulePermissions();
    }

    @Transactional
    public User updateUserPermissions(UUID id, Set<String> permissions) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.getModulePermissions().clear();
        if (permissions != null) {
            permissions.stream()
                    .map(permission -> inputSanitizationService.optionalText(permission, "permiso"))
                    .filter(permission -> permission != null && !permission.isBlank())
                    .map(String::trim)
                    .forEach(user.getModulePermissions()::add);
        }
        return userRepository.save(user);
    }

    private String normalizeRole(String role) {
        String cleanRole = inputSanitizationService.requiredText(role, "rol").toUpperCase(Locale.ROOT);
        if (!cleanRole.matches("[A-Z_:-]{3,80}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol contiene caracteres no permitidos");
        }
        return cleanRole;
    }

    private String normalizeStatus(String status) {
        String cleanStatus = status == null || status.isBlank()
                ? "active"
                : inputSanitizationService.requiredText(status, "estado").toLowerCase(Locale.ROOT);
        if (!Set.of("active", "inactive", "blocked").contains(cleanStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El estado debe ser active, inactive o blocked");
        }
        return cleanStatus;
    }
}
