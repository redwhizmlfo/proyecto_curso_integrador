package com.ferreteria.service;

import com.ferreteria.dto.EmployeeRequestDTO;
import com.ferreteria.model.Employee;
import com.ferreteria.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final InputSanitizationService inputSanitizationService;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(UUID id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
    }

    @Transactional
    public Employee createEmployee(EmployeeRequestDTO request) {
        Employee employee = Employee.builder()
                .initials(inputSanitizationService.requiredText(request.getInitials(), "initials"))
                .name(inputSanitizationService.requiredText(request.getName(), "name"))
                .role(inputSanitizationService.requiredText(request.getRole(), "role"))
                .dni(inputSanitizationService.requiredText(request.getDni(), "dni"))
                .payPerDay(request.getPayPerDay() != null ? request.getPayPerDay() : BigDecimal.ZERO)
                .workedDays(BigDecimal.ZERO)
                .isActive(true)
                .canMarkExit(false)
                .build();
        return employeeRepository.save(employee);
    }

    @Transactional
    public Employee updateEmployee(UUID id, EmployeeRequestDTO request) {
        Employee employee = getEmployeeById(id);
        employee.setInitials(inputSanitizationService.requiredText(request.getInitials(), "initials"));
        employee.setName(inputSanitizationService.requiredText(request.getName(), "name"));
        employee.setRole(inputSanitizationService.requiredText(request.getRole(), "role"));
        employee.setDni(inputSanitizationService.requiredText(request.getDni(), "dni"));
        if (request.getPayPerDay() != null) {
            employee.setPayPerDay(request.getPayPerDay());
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }
}
