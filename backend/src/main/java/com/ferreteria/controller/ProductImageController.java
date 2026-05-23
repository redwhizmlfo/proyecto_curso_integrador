package com.ferreteria.controller;

import com.ferreteria.dto.ProductImageRequestDTO;
import com.ferreteria.model.ProductImage;
import com.ferreteria.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-images")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductImageController {

    private final ProductImageService productImageService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImage>> getByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(productImageService.getImagesByProduct(productId));
    }

    @PostMapping
    public ResponseEntity<?> addImage(@RequestBody ProductImageRequestDTO request) {
        try {
            ProductImage image = productImageService.addImage(request);
            return new ResponseEntity<>(image, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/primary")
    public ResponseEntity<?> setPrimary(@PathVariable UUID id) {
        try {
            ProductImage image = productImageService.setPrimaryImage(id);
            return ResponseEntity.ok(image);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        try {
            productImageService.deleteImage(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
