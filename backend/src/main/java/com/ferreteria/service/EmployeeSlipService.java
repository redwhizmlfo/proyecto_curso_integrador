package com.ferreteria.service;

import com.ferreteria.dto.EmployeeSlipRequestDTO;
import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.EmployeeSlipRepository;
import com.ferreteria.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeSlipService {
    
    private final EmployeeSlipRepository employeeSlipRepo;
    private final EmployeeRepository employeeRepo;
    private final UserRepository userRepo;
    
    public List<EmployeeSlip> getAll() {
        return this.employeeSlipRepo.findAll();
    }
    
    public EmployeeSlip getEmployeeSlipById(UUID id) {
        return this.employeeSlipRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Boleta de empleado no encontrada"));
    }     
    
    
    @Transactional
    public EmployeeSlip createEmployeeSlip(EmployeeSlipRequestDTO request) {
        Employee e = this.employeeRepo.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        
        User creator = this.userRepo.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("Usuario creador no encontrado"));
        
        BigDecimal total = request.getWorkedDays().multiply(request.getPayPerDay());
        
        // Generar un número de boleta único:
        String uniqueSlipNumber = UUID.randomUUID().toString();
        
        EmployeeSlip slip = EmployeeSlip.builder()
                .employee(e)
                .createdByUser(creator)
                .slipNumber(uniqueSlipNumber)
                .periodLabel(request.getPeriodLabel())
                .totalAmount(total)
                .workedDaysSnapshot(request.getWorkedDays())
                .payPerDaySnapshot(request.getPayPerDay())
                .employeeNameSnapshot(e.getName())
                .employeeDniSnapshot(e.getDni())
                .employeeRoleSnapshot(e.getRole())
                .usernameSnapshot(creator.getUsername())
                .build();
        
        return this.employeeSlipRepo.save(slip);
    }
    
}
