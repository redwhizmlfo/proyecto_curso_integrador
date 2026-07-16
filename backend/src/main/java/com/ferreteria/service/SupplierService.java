package com.ferreteria.service;

import com.ferreteria.dto.SupplierRequestDTO;
import com.ferreteria.model.Supplier;
import com.ferreteria.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final InputSanitizationService inputSanitizationService;

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(UUID id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
    }

    public Supplier getSupplierByRuc(String ruc) {
        return supplierRepository.findByRuc(ruc)
                .orElseThrow(() -> new RuntimeException("Proveedor con RUC " + ruc + " no encontrado"));
    }

    @Transactional
    public Supplier createSupplier(SupplierRequestDTO request) {
        Supplier supplier = Supplier.builder()
                .name(inputSanitizationService.requiredText(request.getName(), "name"))
                .ruc(inputSanitizationService.requiredText(request.getRuc(), "ruc"))
                .contact(inputSanitizationService.optionalText(request.getContact(), "contact"))
                .phone(inputSanitizationService.optionalText(request.getPhone(), "phone"))
                .email(inputSanitizationService.optionalText(request.getEmail(), "email"))
                .isActive(true)
                .build();
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(UUID id, SupplierRequestDTO request) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(inputSanitizationService.requiredText(request.getName(), "name"));
        supplier.setRuc(inputSanitizationService.requiredText(request.getRuc(), "ruc"));
        supplier.setContact(inputSanitizationService.optionalText(request.getContact(), "contact"));
        supplier.setPhone(inputSanitizationService.optionalText(request.getPhone(), "phone"));
        supplier.setEmail(inputSanitizationService.optionalText(request.getEmail(), "email"));
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        Supplier supplier = getSupplierById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
