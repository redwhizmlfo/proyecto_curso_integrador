package com.ferreteria.service;

import com.ferreteria.dto.ProductRequestDTO;
import com.ferreteria.model.Product;
import com.ferreteria.model.Supplier;
import com.ferreteria.repository.ProductRepository;
import com.ferreteria.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Transactional
    public Product createProduct(ProductRequestDTO request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        Product product = Product.builder()
                .name(request.getName())
                .barcode(request.getBarcode())
                .category(request.getCategory())
                .unit(request.getUnit())
                .description(request.getDescription())
                .cost(request.getCost())
                .price(request.getPrice())
                .stock(request.getStock())
                .minStock(request.getMinStock())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .supplier(supplier)
                .supplierNameSnapshot(supplier.getName())
                .build();

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID id, ProductRequestDTO request) {
        Product p = getProductById(id);

        p.setBarcode(request.getBarcode());
        p.setName(request.getName());
        p.setCategory(request.getCategory());
        p.setUnit(request.getUnit());
        p.setCost(request.getCost());
        p.setPrice(request.getPrice());
        p.setStock(request.getStock());
        p.setMinStock(request.getMinStock());
        
        if (request.getImageUrl() != null) {
            p.setImageUrl(request.getImageUrl());
        }

        if (request.getSupplierId() != null && !p.getSupplier().getId().equals(request.getSupplierId())) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
            p.setSupplier(supplier);
            p.setSupplierNameSnapshot(supplier.getName());
        }

        return productRepository.save(p);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = getProductById(id);
        product.setActive(false); // Baja lógica
        productRepository.save(product);
    }
}
