package com.ferreteria.config;

import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeAttendanceRepository;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EmployeeDataInitializer implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final EmployeeAttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Update database constraint to support 'permiso' status
        try {
            entityManager.createNativeQuery("ALTER TABLE employee_attendance DROP CONSTRAINT IF EXISTS employee_attendance_status_allowed").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE employee_attendance ADD CONSTRAINT employee_attendance_status_allowed CHECK (lower(status) in ('en turno', 'asistio', 'falto', 'permiso'))").executeUpdate();
        } catch (Exception e) {
            System.err.println("Error updating check constraint in database: " + e.getMessage());
        }

        User admin = seedDefaultAdminUser();

        // 1. Seed Carlos Mendoza
        Employee carlos = seedEmployee("CM", "Carlos Mendoza", "Vendedor Cajero", "44558899", new BigDecimal("80.00"), new BigDecimal("5.0"), "en turno", true, true);
        if (carlos != null) {
            seedAttendance(carlos, admin, LocalDate.now(), OffsetDateTime.now(ZoneOffset.UTC).withHour(8).withMinute(0), null, "en turno");
            seedAttendance(carlos, admin, LocalDate.now().minusDays(1), OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).withHour(8).withMinute(0), OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).withHour(17).withMinute(0), "asistio");
            seedAttendance(carlos, admin, LocalDate.now().minusDays(2), OffsetDateTime.now(ZoneOffset.UTC).minusDays(2).withHour(8).withMinute(0), OffsetDateTime.now(ZoneOffset.UTC).minusDays(2).withHour(17).withMinute(0), "asistio");
            seedAttendance(carlos, admin, LocalDate.now().minusDays(3), null, null, "falto");
            seedAttendance(carlos, admin, LocalDate.now().minusDays(4), OffsetDateTime.now(ZoneOffset.UTC).minusDays(4).withHour(8).withMinute(0), OffsetDateTime.now(ZoneOffset.UTC).minusDays(4).withHour(17).withMinute(0), "asistio");
            seedAttendance(carlos, admin, LocalDate.now().minusDays(5), OffsetDateTime.now(ZoneOffset.UTC).minusDays(5).withHour(8).withMinute(0), OffsetDateTime.now(ZoneOffset.UTC).minusDays(5).withHour(17).withMinute(0), "asistio");
        }

        // 2. Seed Juan Pérez Almacén
        Employee juan = seedEmployee("JP", "Juan Pérez Almacén", "Encargado Almacén", "44558877", new BigDecimal("90.00"), new BigDecimal("6.0"), "asistio", true, false);
        if (juan != null) {
            seedAttendance(juan, admin, LocalDate.now(), OffsetDateTime.now(ZoneOffset.UTC).withHour(7).withMinute(55), OffsetDateTime.now(ZoneOffset.UTC).withHour(17).withMinute(0), "asistio");
            seedAttendance(juan, admin, LocalDate.now().minusDays(1), OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).withHour(7).withMinute(50), OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).withHour(17).withMinute(10), "asistio");
            seedAttendance(juan, admin, LocalDate.now().minusDays(2), OffsetDateTime.now(ZoneOffset.UTC).minusDays(2).withHour(7).withMinute(55), OffsetDateTime.now(ZoneOffset.UTC).minusDays(2).withHour(17).withMinute(0), "asistio");
            seedAttendance(juan, admin, LocalDate.now().minusDays(3), OffsetDateTime.now(ZoneOffset.UTC).minusDays(3).withHour(7).withMinute(52), OffsetDateTime.now(ZoneOffset.UTC).minusDays(3).withHour(17).withMinute(5), "asistio");
            seedAttendance(juan, admin, LocalDate.now().minusDays(4), OffsetDateTime.now(ZoneOffset.UTC).minusDays(4).withHour(7).withMinute(58), OffsetDateTime.now(ZoneOffset.UTC).minusDays(4).withHour(17).withMinute(0), "asistio");
            seedAttendance(juan, admin, LocalDate.now().minusDays(5), OffsetDateTime.now(ZoneOffset.UTC).minusDays(5).withHour(7).withMinute(55), OffsetDateTime.now(ZoneOffset.UTC).minusDays(5).withHour(17).withMinute(0), "asistio");
        }

        // 3. Seed Lucía Lima
        Employee lucia = seedEmployee("LL", "Lucía Lima", "Administradora", "44558855", new BigDecimal("120.00"), new BigDecimal("4.0"), null, false, false);
        if (lucia != null) {
            seedAttendance(lucia, admin, LocalDate.now().minusDays(1), OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).withHour(8).withMinute(2), OffsetDateTime.now(ZoneOffset.UTC).minusDays(1).withHour(18).withMinute(0), "asistio");
            seedAttendance(lucia, admin, LocalDate.now().minusDays(2), OffsetDateTime.now(ZoneOffset.UTC).minusDays(2).withHour(8).withMinute(0), OffsetDateTime.now(ZoneOffset.UTC).minusDays(2).withHour(18).withMinute(0), "asistio");
            seedAttendance(lucia, admin, LocalDate.now().minusDays(3), OffsetDateTime.now(ZoneOffset.UTC).minusDays(3).withHour(8).withMinute(10), OffsetDateTime.now(ZoneOffset.UTC).minusDays(3).withHour(18).withMinute(0), "asistio");
            seedAttendance(lucia, admin, LocalDate.now().minusDays(4), OffsetDateTime.now(ZoneOffset.UTC).minusDays(4).withHour(8).withMinute(5), OffsetDateTime.now(ZoneOffset.UTC).minusDays(4).withHour(18).withMinute(0), "asistio");
        }
    }

    private User seedDefaultAdminUser() {
        Employee adminEmployee = seedEmployee(
                "ADM",
                "Admin User",
                "GERENTE",
                "00000000",
                new BigDecimal("100.00"),
                BigDecimal.ZERO,
                null,
                false,
                false
        );

        User admin = userRepository.findByUsername("admin")
                .orElseGet(() -> User.builder()
                        .employee(adminEmployee)
                        .username("admin")
                        .role("ADMIN")
                        .status("active")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .isActive(true)
                        .build());

        admin.setEmployee(adminEmployee);
        admin.setRole("ADMIN");
        admin.setStatus("active");
        admin.setActive(true);
        if (admin.getPasswordHash() == null || !passwordEncoder.matches("admin123", admin.getPasswordHash())) {
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
        }

        return userRepository.save(admin);
    }

    private Employee seedEmployee(
            String initials,
            String name,
            String role,
            String dni,
            BigDecimal payPerDay,
            BigDecimal workedDays,
            String todayStatus,
            Boolean attendanceToday,
            boolean canMarkExit
    ) {
        Optional<Employee> existing = employeeRepository.findAll().stream()
                .filter(e -> e.getDni().equals(dni))
                .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        Employee employee = Employee.builder()
                .initials(initials)
                .name(name)
                .role(role)
                .dni(dni)
                .payPerDay(payPerDay)
                .workedDays(workedDays)
                .todayStatus(todayStatus)
                .attendanceToday(attendanceToday)
                .canMarkExit(canMarkExit)
                .isActive(true)
                .build();

        return employeeRepository.save(employee);
    }

    private void seedAttendance(
            Employee employee,
            User user,
            LocalDate date,
            OffsetDateTime entry,
            OffsetDateTime exit,
            String status
    ) {
        if (attendanceRepository.findByEmployeeIdAndWorkDate(employee.getId(), date).isPresent()) {
            return;
        }

        EmployeeAttendance attendance = EmployeeAttendance.builder()
                .employee(employee)
                .markedByUser(user)
                .workDate(date)
                .entryAt(entry)
                .exitAt(exit)
                .status(status)
                .build();

        attendanceRepository.save(attendance);
    }
}
