package com.ferreteria.controller;

import com.ferreteria.dto.EmployeeSlipRequestDTO;
import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.service.EmployeeSlipService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee-slip")
@RequiredArgsConstructor
public class EmployeeSlipController {
    
    private final EmployeeSlipService service;
    
    @GetMapping
    public ResponseEntity<List<EmployeeSlip>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSlip> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(this.service.getEmployeeSlipById(id));
    }

    
    @PostMapping
    public ResponseEntity<EmployeeSlip> create(@RequestBody EmployeeSlipRequestDTO request) {
        return new ResponseEntity<>(this.service.createEmployeeSlip(request), HttpStatus.CREATED);
    }
    
}
