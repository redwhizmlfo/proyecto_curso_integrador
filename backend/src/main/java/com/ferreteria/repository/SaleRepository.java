package com.ferreteria.repository;

import com.ferreteria.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, UUID> {
}
