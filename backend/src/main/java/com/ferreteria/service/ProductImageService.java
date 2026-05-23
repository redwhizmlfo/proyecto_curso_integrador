package com.ferreteria.service;

import com.ferreteria.dto.ProductImageRequestDTO;
import com.ferreteria.model.Product;
import com.ferreteria.model.ProductImage;
import com.ferreteria.repository.ProductImageRepository;
import com.ferreteria.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    public List<ProductImage> getImagesByProduct(UUID productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
    }

    @Transactional
    public ProductImage addImage(ProductImageRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        boolean isPrimary = request.getIsPrimary() != null && request.getIsPrimary();

        if (isPrimary) {
            Optional<ProductImage> currentPrimaryOpt = productImageRepository.findByProductIdAndIsPrimaryTrue(product.getId());
            if (currentPrimaryOpt.isPresent()) {
                ProductImage currentPrimary = currentPrimaryOpt.get();
                currentPrimary.setPrimary(false);
                productImageRepository.save(currentPrimary);
            }
        }

        ProductImage productImage = ProductImage.builder()
                .product(product)
                .imageUrl(request.getImageUrl())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 1)
                .isPrimary(isPrimary)
                .build();

        return productImageRepository.save(productImage);
    }

    @Transactional
    public ProductImage setPrimaryImage(UUID imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Imagen de producto no encontrada"));

        if (image.isPrimary()) {
            return image;
        }

        Optional<ProductImage> currentPrimaryOpt = productImageRepository.findByProductIdAndIsPrimaryTrue(image.getProduct().getId());
        if (currentPrimaryOpt.isPresent()) {
            ProductImage currentPrimary = currentPrimaryOpt.get();
            if (!currentPrimary.getId().equals(imageId)) {
                currentPrimary.setPrimary(false);
                productImageRepository.save(currentPrimary);
            }
        }

        image.setPrimary(true);
        return productImageRepository.save(image);
    }

    @Transactional
    public void deleteImage(UUID imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Imagen de producto no encontrada"));
        UUID productId = image.getProduct().getId();
        boolean wasPrimary = image.isPrimary();

        productImageRepository.delete(image);

        if (wasPrimary) {
            List<ProductImage> remaining = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
            if (!remaining.isEmpty()) {
                ProductImage newPrimary = remaining.get(0);
                newPrimary.setPrimary(true);
                productImageRepository.save(newPrimary);
            }
        }
    }
}
