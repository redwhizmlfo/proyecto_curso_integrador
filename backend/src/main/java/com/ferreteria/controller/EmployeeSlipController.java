package com.ferreteria.controller;

import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.service.EmployeeSlipService;
import java.util.List;
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

    /* pendiente crear la clase EmployeeSlipRequestDTO para guardar una instancia de EmployeeSlip.
    @PostMapping
    public ResponseEntity<EmployeeSlip> create(@RequestBody EmployeeSlipRequestDTO request) {
        return new ResponseEntity<>(service.createEmployee(request), HttpStatus.CREATED);
    }
    */
}
