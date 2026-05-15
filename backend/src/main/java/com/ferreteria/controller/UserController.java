package com.ferreteria.controller;

import com.ferreteria.dto.UserRequestDTO;
import com.ferreteria.model.User;
import com.ferreteria.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<User> create(@RequestBody UserRequestDTO request) {
        return new ResponseEntity<>(userService.createUser(request), HttpStatus.CREATED);
    }
}
