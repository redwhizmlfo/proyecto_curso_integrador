package com.ferreteria.controller;

import com.ferreteria.dto.UserPermissionsDTO;
import com.ferreteria.dto.UserRequestDTO;
import com.ferreteria.model.User;
import com.ferreteria.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody UserRequestDTO request) {
        return new ResponseEntity<>(userService.createUser(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable UUID id, @Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<Set<String>> getPermissions(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserPermissions(id));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<User> updatePermissions(@PathVariable UUID id, @RequestBody UserPermissionsDTO request) {
        return ResponseEntity.ok(userService.updateUserPermissions(id, request.getPermissions()));
    }
}
