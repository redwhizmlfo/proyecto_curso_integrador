package com.ferreteria.repository;

import com.ferreteria.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
}
