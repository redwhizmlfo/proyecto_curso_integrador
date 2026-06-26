package com.ferreteria.controller;

import com.ferreteria.dto.LoginRequestDTO;
import com.ferreteria.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final JwtService service;
    
    @PostMapping("/login")
    public String login(@RequestBody LoginRequestDTO request) {
        return "Autenticaci├│n del login pendiente";
    }
}
