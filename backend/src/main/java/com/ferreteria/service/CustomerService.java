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
    private final InputSanitizationService inputSanitizationService;

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
                .name(inputSanitizationService.requiredText(request.getName(), "name"))
                .docType(inputSanitizationService.requiredText(request.getDocType(), "docType"))
                .docNumber(inputSanitizationService.requiredText(request.getDocNumber(), "docNumber"))
                .phone(inputSanitizationService.optionalText(request.getPhone(), "phone"))
                .email(inputSanitizationService.optionalText(request.getEmail(), "email"))
                .address(inputSanitizationService.optionalText(request.getAddress(), "address"))
                .preferredDiscount(request.getPreferredDiscount() != null ? request.getPreferredDiscount() : BigDecimal.ZERO)
                .build();
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(UUID id, CustomerRequestDTO request) {
        Customer customer = getCustomerById(id);
        customer.setName(inputSanitizationService.requiredText(request.getName(), "name"));
        customer.setDocType(inputSanitizationService.requiredText(request.getDocType(), "docType"));
        customer.setDocNumber(inputSanitizationService.requiredText(request.getDocNumber(), "docNumber"));
        customer.setPhone(inputSanitizationService.optionalText(request.getPhone(), "phone"));
        customer.setEmail(inputSanitizationService.optionalText(request.getEmail(), "email"));
        customer.setAddress(inputSanitizationService.optionalText(request.getAddress(), "address"));
        customer.setPreferredDiscount(request.getPreferredDiscount() != null ? request.getPreferredDiscount() : BigDecimal.ZERO);
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
}
