package com.ferreteria.repository;

import com.ferreteria.model.EmployeeSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

import java.util.List;

public interface EmployeeSlipRepository extends JpaRepository<EmployeeSlip, UUID> {
    List<EmployeeSlip> findByEmployeeIdOrderByIssuedAtDesc(UUID employeeId);
    boolean existsByEmployeeIdAndPeriodLabel(UUID employeeId, String periodLabel);
}
