package com.ferreteria.repository;

import com.ferreteria.model.InventoryBox;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryBoxRepository extends JpaRepository<InventoryBox, UUID> {
    List<InventoryBox> findAllByOrderByCreatedAtDesc();
}
