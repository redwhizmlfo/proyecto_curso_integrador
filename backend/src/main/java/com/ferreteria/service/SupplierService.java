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
                .name(request.getName())
                .ruc(request.getRuc())
                .contact(request.getContact())
                .phone(request.getPhone())
                .email(request.getEmail())
                .isActive(true)
                .build();
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier updateSupplier(UUID id, SupplierRequestDTO request) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(request.getName());
        supplier.setRuc(request.getRuc());
        supplier.setContact(request.getContact());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        Supplier supplier = getSupplierById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
