package com.ferreteria.service;

import com.ferreteria.dto.UserRequestDTO;
import com.ferreteria.model.Employee;
import com.ferreteria.model.User;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(UserRequestDTO request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));

        User user = User.builder()
                .employee(employee)
                .username(request.getUsername())
                .role(request.getRole())
                // In a real app, hash the password using BCrypt. For now, we store plain or simple hash.
                .passwordHash(request.getPassword()) 
                .status("active")
                .isActive(true)
                .build();
        return userRepository.save(user);
    }
}
