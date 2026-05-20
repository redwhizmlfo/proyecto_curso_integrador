package com.ferreteria.controller;

import com.ferreteria.dto.SupplierCategoryRequestDTO;
import com.ferreteria.model.SupplierCategory;
import com.ferreteria.service.SupplierCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/supplier-categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierCategoryController {

    private final SupplierCategoryService supplierCategoryService;

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<SupplierCategory>> getBySupplier(@PathVariable UUID supplierId) {
        return ResponseEntity.ok(supplierCategoryService.getCategoriesBySupplier(supplierId));
    }

    @PostMapping
    public ResponseEntity<?> addCategory(@RequestBody SupplierCategoryRequestDTO request) {
        try {
            SupplierCategory category = supplierCategoryService.addCategory(request);
            return new ResponseEntity<>(category, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable UUID id) {
        try {
            supplierCategoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
