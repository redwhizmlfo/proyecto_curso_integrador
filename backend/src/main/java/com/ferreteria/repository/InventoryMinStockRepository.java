package com.ferreteria.repository;

import com.ferreteria.model.InventoryMinStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InventoryMinStockRepository extends JpaRepository<InventoryMinStock, UUID> {
}
