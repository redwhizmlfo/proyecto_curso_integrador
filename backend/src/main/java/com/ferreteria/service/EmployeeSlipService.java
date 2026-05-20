package com.ferreteria.service;

import com.ferreteria.dto.EmployeeSlipRequestDTO;
import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.EmployeeSlipRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeSlipService {

    private final EmployeeSlipRepository slipRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public List<EmployeeSlip> getAllSlips() {
        return slipRepository.findAll(Sort.by(Sort.Direction.DESC, "issuedAt"));
    }

    public EmployeeSlip getSlipById(UUID id) {
        return slipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Boleta de pago no encontrada"));
    }

    public List<EmployeeSlip> getSlipsByEmployee(UUID employeeId) {
        return slipRepository.findByEmployeeIdOrderByIssuedAtDesc(employeeId);
    }

    @Transactional
    public EmployeeSlip generateSlip(EmployeeSlipRequestDTO request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        User user = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String cleanPeriod = request.getPeriodLabel().replaceAll("[^a-zA-Z0-9\\-]", "");
        String slipNumber = "BP-" + employee.getDni() + "-" + cleanPeriod;

        if (slipRepository.existsByEmployeeIdAndPeriodLabel(employee.getId(), request.getPeriodLabel())) {
            throw new RuntimeException("Ya existe una boleta generada para este empleado en el periodo: " + request.getPeriodLabel());
        }

        BigDecimal workedDays = employee.getWorkedDays();
        BigDecimal payPerDay = employee.getPayPerDay();
        BigDecimal totalAmount = workedDays.multiply(payPerDay);

        EmployeeSlip slip = EmployeeSlip.builder()
                .employee(employee)
                .createdByUser(user)
                .slipNumber(slipNumber)
                .periodLabel(request.getPeriodLabel())
                .issuedAt(OffsetDateTime.now())
                .workedDaysSnapshot(workedDays)
                .payPerDaySnapshot(payPerDay)
                .totalAmount(totalAmount)
                .employeeNameSnapshot(employee.getName())
                .employeeDniSnapshot(employee.getDni())
                .employeeRoleSnapshot(employee.getRole())
                .usernameSnapshot(user.getUsername())
                .build();

        EmployeeSlip savedSlip = slipRepository.save(slip);

        // Reset employee worked days
        employee.setWorkedDays(BigDecimal.ZERO);
        employeeRepository.save(employee);

        return savedSlip;
    }
}
