package com.ferreteria.repository;

import com.ferreteria.model.SupplierCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SupplierCategoryRepository extends JpaRepository<SupplierCategory, UUID> {
    List<SupplierCategory> findBySupplierIdOrderBySortOrderAsc(UUID supplierId);
    Optional<SupplierCategory> findBySupplierIdAndCategoryNameIgnoreCase(UUID supplierId, String categoryName);
}
