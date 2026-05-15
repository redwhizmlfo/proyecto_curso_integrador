package com.ferreteria.repository;

import com.ferreteria.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByCategory(String category);
    List<Product> findByIsActiveTrue();
}
