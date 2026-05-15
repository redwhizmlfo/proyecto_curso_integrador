package com.ferreteria.repository;

import com.ferreteria.model.EmployeeSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EmployeeSlipRepository extends JpaRepository<EmployeeSlip, UUID> {
}
