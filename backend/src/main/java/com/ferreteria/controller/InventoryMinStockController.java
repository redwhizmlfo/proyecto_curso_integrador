package com.ferreteria.controller;

import com.ferreteria.dto.InventoryMinStockRequestDTO;
import com.ferreteria.service.InventoryMinStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory-min-stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryMinStockController {

    private final InventoryMinStockService service;

    @GetMapping
    public ResponseEntity<Map<UUID, Integer>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{productModelId}")
    public ResponseEntity<Map<UUID, Integer>> save(
            @PathVariable UUID productModelId,
            @Valid @RequestBody InventoryMinStockRequestDTO request
    ) {
        return ResponseEntity.ok(service.save(productModelId, request.getMinStock()));
    }
}
