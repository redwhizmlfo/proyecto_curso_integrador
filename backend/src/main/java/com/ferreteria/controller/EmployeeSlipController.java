package com.ferreteria.controller;

import com.ferreteria.dto.EmployeeSlipRequestDTO;
import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.service.EmployeeSlipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/slips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeSlipController {

    private final EmployeeSlipService slipService;

    @GetMapping
    public ResponseEntity<List<EmployeeSlip>> getAll() {
        return ResponseEntity.ok(slipService.getAllSlips());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeSlip> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(slipService.getSlipById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeSlip>> getByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(slipService.getSlipsByEmployee(employeeId));
    }

    @PostMapping
    public ResponseEntity<?> generateSlip(@RequestBody EmployeeSlipRequestDTO request) {
        try {
            EmployeeSlip slip = slipService.generateSlip(request);
            return ResponseEntity.ok(slip);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
