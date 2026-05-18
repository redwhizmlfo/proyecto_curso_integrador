package com.ferreteria.service;

import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.repository.EmployeeSlipRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeSlipService {
    
    private final EmployeeSlipRepository repo;
    
    public List<EmployeeSlip> getAll() {
        return this.repo.findAll();
    }
    
    public EmployeeSlip getEmployeeSlipById(UUID id) {
        return this.repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Boleta de empleado no encontrada"));
    }     
    
    /* pendiente crear la clase EmployeeSlipRequestDTO para guardar una instancia de EmployeeSlip.
    @Transactional
    public EmployeeSlip createEmployeeSlip(EmployeeSlipRequestDTO request) {
                
    }
    */
}
