package com.ferreteria.repository;

import com.ferreteria.model.EmployeeAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.time.LocalDate;
import java.util.Optional;

import java.util.List;

public interface EmployeeAttendanceRepository extends JpaRepository<EmployeeAttendance, UUID> {
    Optional<EmployeeAttendance> findByEmployeeIdAndWorkDate(UUID employeeId, LocalDate workDate);
    List<EmployeeAttendance> findByEmployeeIdOrderByWorkDateDesc(UUID employeeId);
}
