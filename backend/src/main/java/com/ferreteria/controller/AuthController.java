package com.ferreteria.controller;

import com.ferreteria.dto.LoginRequestDTO;
import com.ferreteria.model.User;
import com.ferreteria.repository.UserRepository;
import com.ferreteria.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final JwtService service;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequestDTO request) {
        User user = findActiveUser(request.getUsername());

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }

        user.setLastAccessAt(OffsetDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok(sessionResponse(user, service.generateToken(user.getUsername())));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }

        User user = findActiveUser(authentication.getName());
        return ResponseEntity.ok(sessionResponse(user, null));
    }

    private User findActiveUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas"));

        if (!user.isActive() || !"active".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo o bloqueado");
        }

        return user;
    }

    private Map<String, Object> sessionResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        if (token != null) {
            response.put("token", token);
        }
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("employeeId", user.getEmployee() == null ? null : user.getEmployee().getId());
        response.put("permissions", user.getModulePermissions());
        return response;
    }
}
