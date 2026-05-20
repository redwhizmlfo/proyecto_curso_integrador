package com.ferreteria.service;

import com.ferreteria.dto.CustomerRequestDTO;
import com.ferreteria.model.Customer;
import com.ferreteria.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Transactional
    public Customer createCustomer(CustomerRequestDTO request) {
        Customer customer = Customer.builder()
                .name(request.getName())
                .docType(request.getDocType())
                .docNumber(request.getDocNumber())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .preferredDiscount(request.getPreferredDiscount() != null ? request.getPreferredDiscount() : BigDecimal.ZERO)
                .build();
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(UUID id, CustomerRequestDTO request) {
        Customer customer = getCustomerById(id);
        customer.setName(request.getName());
        customer.setDocType(request.getDocType());
        customer.setDocNumber(request.getDocNumber());
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setPreferredDiscount(request.getPreferredDiscount() != null ? request.getPreferredDiscount() : BigDecimal.ZERO);
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
}
