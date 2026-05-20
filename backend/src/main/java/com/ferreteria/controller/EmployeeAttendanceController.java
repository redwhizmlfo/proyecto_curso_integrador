package com.ferreteria.controller;

import com.ferreteria.dto.AttendanceRequestDTO;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.service.EmployeeAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeAttendanceController {

    private final EmployeeAttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<List<EmployeeAttendance>> getAll() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeAttendance>> getByEmployee(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(employeeId));
    }

    @PostMapping("/entry")
    public ResponseEntity<?> markEntry(@RequestBody AttendanceRequestDTO request) {
        try {
            EmployeeAttendance attendance = attendanceService.markEntry(
                    request.getEmployeeId(), request.getMarkedByUserId()
            );
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/exit")
    public ResponseEntity<?> markExit(@RequestBody AttendanceRequestDTO request) {
        try {
            EmployeeAttendance attendance = attendanceService.markExit(
                    request.getEmployeeId(), request.getMarkedByUserId()
            );
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/absence")
    public ResponseEntity<?> registerAbsence(@RequestBody AttendanceRequestDTO request) {
        try {
            EmployeeAttendance attendance = attendanceService.registerAbsence(
                    request.getEmployeeId(), request.getMarkedByUserId(), request.getWorkDate()
            );
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
