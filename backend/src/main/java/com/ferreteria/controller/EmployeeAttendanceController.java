package com.ferreteria.controller;

import com.ferreteria.dto.EmployeeAttendanceRequestDTO;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.service.EmployeeAttendanceService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee-attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeAttendanceController {
    
    private final EmployeeAttendanceService service;
    
    @GetMapping
    public ResponseEntity<List<EmployeeAttendance>> getAll() {
        return ResponseEntity.ok(service.getAllEmployeesAttendance());
    }
    
    @GetMapping("/{employeeId}/{workDate}")
    public EmployeeAttendance getEmployeeAndDate(
            @PathVariable UUID employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate
    ) {
        return this.service.findByEmployeeIdAndWorkDate(employeeId, workDate);
    }
        
    @PostMapping
    public ResponseEntity<EmployeeAttendance> create(@RequestBody EmployeeAttendanceRequestDTO request) {
        return new ResponseEntity<>(service.createEmployeeAttendance(request), HttpStatus.CREATED);
    }
    
    
    
}
