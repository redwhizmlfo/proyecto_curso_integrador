package com.ferreteria.repository;

import com.ferreteria.model.Loss;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface LossRepository extends JpaRepository<Loss, UUID> {
}
