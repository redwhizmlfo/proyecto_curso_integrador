package com.ferreteria.service;

import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.repository.EmployeeAttendanceRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeAttendanceService {
    
    private final EmployeeAttendanceRepository repo;
    
    public List<EmployeeAttendance> getAllEmployeesAttendance() {
        return this.repo.findAll();
    }
    
    public EmployeeAttendance findByEmployeeIdAndWorkDate(UUID id, LocalDate workDate) {
        return this.repo.findByEmployeeIdAndWorkDate(id, workDate)
                .orElseThrow(() -> new RuntimeException("Asistencia de Empleado no encontrada"));
    }
    
    /* pendiente crear la clase EmployeeAttendanceRequestDTO para crear una instancia de EmployeeAttendance
    @Transactional
    public EmployeeAttendance createEmployeeAttendance() {
        
        
    }
    */
    
   
    
}
