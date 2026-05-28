package com.ferreteria.service;

import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeAttendanceRepository;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeAttendanceService {

    private final EmployeeAttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public List<EmployeeAttendance> getAllAttendance() {
        return attendanceRepository.findAll(Sort.by(Sort.Direction.DESC, "workDate"));
    }

    public List<EmployeeAttendance> getAttendanceByEmployee(UUID employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByWorkDateDesc(employeeId);
    }

    @Transactional
    public EmployeeAttendance markEntry(UUID employeeId, UUID markedByUserId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        User user = userRepository.findById(markedByUserId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        LocalDate today = LocalDate.now();
        Optional<EmployeeAttendance> existingOpt = attendanceRepository.findByEmployeeIdAndWorkDate(employeeId, today);
        if (existingOpt.isPresent()) {
            throw new RuntimeException("Ya se registró entrada o asistencia para el día de hoy");
        }

        EmployeeAttendance attendance = EmployeeAttendance.builder()
                .employee(employee)
                .markedByUser(user)
                .workDate(today)
                .entryAt(OffsetDateTime.now())
                .status("en turno")
                .build();

        employee.setTodayStatus("en turno");
        employee.setAttendanceToday(true);
        employee.setCanMarkExit(true);
        employeeRepository.save(employee);

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public EmployeeAttendance markExit(UUID employeeId, UUID markedByUserId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        User user = userRepository.findById(markedByUserId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        LocalDate today = LocalDate.now();
        EmployeeAttendance attendance = attendanceRepository.findByEmployeeIdAndWorkDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No se encontró un registro de entrada para el día de hoy"));

        if (!"en turno".equalsIgnoreCase(attendance.getStatus())) {
            throw new RuntimeException("No se puede registrar salida: la asistencia no está en estado 'en turno'");
        }

        attendance.setExitAt(OffsetDateTime.now());
        attendance.setStatus("asistio");
        attendance.setMarkedByUser(user);

        employee.setTodayStatus("asistio");
        employee.setCanMarkExit(false);
        employee.setWorkedDays(employee.getWorkedDays().add(BigDecimal.ONE));
        employeeRepository.save(employee);

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public EmployeeAttendance registerAbsence(UUID employeeId, UUID markedByUserId, LocalDate workDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        User user = userRepository.findById(markedByUserId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (workDate == null) {
            workDate = LocalDate.now();
        }

        Optional<EmployeeAttendance> existingOpt = attendanceRepository.findByEmployeeIdAndWorkDate(employeeId, workDate);
        EmployeeAttendance attendance;

        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            if ("asistio".equalsIgnoreCase(attendance.getStatus()) || "en turno".equalsIgnoreCase(attendance.getStatus())) {
                throw new RuntimeException("No se puede registrar falta: ya existe asistencia registrada para esta fecha");
            }
            attendance.setStatus("falto");
            attendance.setMarkedByUser(user);
            attendance.setEntryAt(null);
            attendance.setExitAt(null);
        } else {
            attendance = EmployeeAttendance.builder()
                    .employee(employee)
                    .markedByUser(user)
                    .workDate(workDate)
                    .status("falto")
                    .build();
        }

        if (workDate.equals(LocalDate.now())) {
            employee.setTodayStatus("falto");
            employee.setAttendanceToday(false);
            employee.setCanMarkExit(false);
            employeeRepository.save(employee);
        }

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public EmployeeAttendance registerPermission(UUID employeeId, UUID markedByUserId, LocalDate workDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
        User user = userRepository.findById(markedByUserId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (workDate == null) {
            workDate = LocalDate.now();
        }

        Optional<EmployeeAttendance> existingOpt = attendanceRepository.findByEmployeeIdAndWorkDate(employeeId, workDate);
        EmployeeAttendance attendance;

        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            if ("asistio".equalsIgnoreCase(attendance.getStatus()) || "en turno".equalsIgnoreCase(attendance.getStatus())) {
                throw new RuntimeException("No se puede registrar permiso: ya existe asistencia registrada para esta fecha");
            }
            attendance.setStatus("permiso");
            attendance.setMarkedByUser(user);
            attendance.setEntryAt(null);
            attendance.setExitAt(null);
        } else {
            attendance = EmployeeAttendance.builder()
                    .employee(employee)
                    .markedByUser(user)
                    .workDate(workDate)
                    .status("permiso")
                    .build();
        }

        if (workDate.equals(LocalDate.now())) {
            employee.setTodayStatus("permiso");
            employee.setAttendanceToday(false);
            employee.setCanMarkExit(false);
            employeeRepository.save(employee);
        }

        return attendanceRepository.save(attendance);
    }
}
