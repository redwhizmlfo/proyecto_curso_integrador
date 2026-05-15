package com.ferreteria.repository;

import com.ferreteria.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
}
