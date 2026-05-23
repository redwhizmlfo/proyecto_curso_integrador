package com.ferreteria.service;

import com.ferreteria.dto.ProductRequestDTO;
import com.ferreteria.model.Product;
import com.ferreteria.model.StockMovement;
import com.ferreteria.model.Supplier;
import com.ferreteria.repository.ProductRepository;
import com.ferreteria.repository.StockMovementRepository;
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
    private final StockMovementRepository stockMovementRepository;

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
                .stock(request.getStock() != null ? request.getStock() : java.math.BigDecimal.ZERO)
                .minStock(request.getMinStock() != null ? request.getMinStock() : java.math.BigDecimal.ZERO)
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .supplier(supplier)
                .supplierNameSnapshot(supplier.getName())
                .build();

        Product savedProduct = productRepository.save(product);

        if (savedProduct.getStock() != null && savedProduct.getStock().compareTo(java.math.BigDecimal.ZERO) > 0) {
            StockMovement movement = StockMovement.builder()
                    .product(savedProduct)
                    .movementType("alta_producto")
                    .sourceModule("inventario")
                    .delta(savedProduct.getStock())
                    .unitSnapshot(savedProduct.getUnit())
                    .stockBefore(java.math.BigDecimal.ZERO)
                    .stockAfter(savedProduct.getStock())
                    .productNameSnapshot(savedProduct.getName())
                    .detail("Alta de producto con stock inicial")
                    .build();
            stockMovementRepository.save(movement);
        }

        return savedProduct;
    }

    @Transactional
    public Product updateProduct(UUID id, ProductRequestDTO request) {
        Product p = getProductById(id);

        java.math.BigDecimal oldStock = p.getStock();
        java.math.BigDecimal newStock = request.getStock();
        boolean stockChanged = newStock != null && oldStock.compareTo(newStock) != 0;

        p.setBarcode(request.getBarcode());
        p.setName(request.getName());
        p.setCategory(request.getCategory());
        p.setUnit(request.getUnit());
        p.setCost(request.getCost());
        p.setPrice(request.getPrice());
        if (newStock != null) {
            p.setStock(newStock);
        }
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

        Product savedProduct = productRepository.save(p);

        if (stockChanged) {
            java.math.BigDecimal delta = newStock.subtract(oldStock);
            StockMovement movement = StockMovement.builder()
                    .product(savedProduct)
                    .movementType("edicion_stock")
                    .sourceModule("inventario")
                    .delta(delta)
                    .unitSnapshot(savedProduct.getUnit())
                    .stockBefore(oldStock)
                    .stockAfter(newStock)
                    .productNameSnapshot(savedProduct.getName())
                    .detail("Edición manual de stock de " + oldStock + " a " + newStock)
                    .build();
            stockMovementRepository.save(movement);
        }

        return savedProduct;
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = getProductById(id);
        product.setActive(false); // Baja lógica
        productRepository.save(product);
    }
}
