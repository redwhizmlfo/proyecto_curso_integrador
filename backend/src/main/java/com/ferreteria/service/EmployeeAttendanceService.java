package com.ferreteria.service;

import com.ferreteria.dto.EmployeeAttendanceRequestDTO;
import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeAttendanceRepository;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeAttendanceService {
    
    private final EmployeeAttendanceRepository attendanceRepo;
    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;
    
    public List<EmployeeAttendance> getAllEmployeesAttendance() {
        return this.attendanceRepo.findAll();
    }
    
    public EmployeeAttendance findByEmployeeIdAndWorkDate(UUID id, LocalDate workDate) {
        return this.attendanceRepo.findByEmployeeIdAndWorkDate(id, workDate)
                .orElseThrow(() -> new RuntimeException("Asistencia de Empleado no encontrada"));
    }
        
    @Transactional
    public EmployeeAttendance createEmployeeAttendance(EmployeeAttendanceRequestDTO dto) {
        Employee e = this.employeeRepo.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        User u = this.userRepo.findById(dto.getMarkedByUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        EmployeeAttendance attendance = EmployeeAttendance.builder()
                .employee(e)
                .markedByUser(u)
                .workDate(dto.getWorkDate())
                .entryAt(dto.getEntryAt())
                .exitAt(dto.getExitAt())
                .status(dto.getStatus())
                .build();
        
        return this.attendanceRepo.save(attendance);
    }
    
    
   
    
}
