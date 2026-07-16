package com.ferreteria.repository;

import com.ferreteria.model.InventoryBoxHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InventoryBoxHistoryRepository extends JpaRepository<InventoryBoxHistory, UUID> {
    List<InventoryBoxHistory> findAllByOrderByReleasedAtDesc();
}
