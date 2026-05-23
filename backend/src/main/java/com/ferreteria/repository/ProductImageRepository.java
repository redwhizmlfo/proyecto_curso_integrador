package com.ferreteria.repository;

import com.ferreteria.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findByProductIdOrderBySortOrderAsc(UUID productId);
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(UUID productId);
    List<ProductImage> findByProductId(UUID productId);
}
