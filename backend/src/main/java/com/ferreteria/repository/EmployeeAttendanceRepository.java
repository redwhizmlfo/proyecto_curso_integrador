package com.ferreteria.repository;

import com.ferreteria.model.EmployeeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.time.LocalDate;
import java.util.Optional;

public interface EmployeeAttendanceRepository extends JpaRepository<EmployeeAttendance, UUID> {
    Optional<EmployeeAttendance> findByEmployeeIdAndWorkDate(UUID employeeId, LocalDate workDate);
}
