package com.ferreteria.controller;

import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.service.EmployeeAttendanceService;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
    
    /* pendiente crear una clase EmployeeAttendanceRequestDTO para crear una instancia de EmployeeAttendance
    @PostMapping
    public ResponseEntity<EmployeeAttendance> create(@RequestBody EmployeeAttendanceRequestDTO request) {
        return new ResponseEntity<>(service.createEmployee(request), HttpStatus.CREATED);
    }
    */
    
    
}
