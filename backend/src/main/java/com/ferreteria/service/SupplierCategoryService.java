package com.ferreteria.service;

import com.ferreteria.dto.SupplierCategoryRequestDTO;
import com.ferreteria.model.Supplier;
import com.ferreteria.model.SupplierCategory;
import com.ferreteria.repository.SupplierCategoryRepository;
import com.ferreteria.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierCategoryService {

    private final SupplierCategoryRepository supplierCategoryRepository;
    private final SupplierRepository supplierRepository;

    public List<SupplierCategory> getCategoriesBySupplier(UUID supplierId) {
        return supplierCategoryRepository.findBySupplierIdOrderBySortOrderAsc(supplierId);
    }

    @Transactional
    public SupplierCategory addCategory(SupplierCategoryRequestDTO request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        if (supplierCategoryRepository.findBySupplierIdAndCategoryNameIgnoreCase(
                supplier.getId(), request.getCategoryName()).isPresent()) {
            throw new RuntimeException("El proveedor ya tiene asignada la categoría: " + request.getCategoryName());
        }

        SupplierCategory category = SupplierCategory.builder()
                .supplier(supplier)
                .categoryName(request.getCategoryName())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1)
                .build();

        return supplierCategoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        SupplierCategory category = supplierCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría de proveedor no encontrada"));
        supplierCategoryRepository.delete(category);
    }
}
