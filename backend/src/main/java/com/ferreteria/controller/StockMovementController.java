package com.ferreteria.controller;

import com.ferreteria.dto.StockMovementRequestDTO;
import com.ferreteria.model.StockMovement;
import com.ferreteria.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @GetMapping
    public ResponseEntity<List<StockMovement>> getAll() {
        return ResponseEntity.ok(stockMovementService.getAllStockMovements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockMovement> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(stockMovementService.getStockMovementById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockMovement>> getByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(stockMovementService.getStockMovementsByProduct(productId));
    }

    @PostMapping
    public ResponseEntity<StockMovement> create(@RequestBody StockMovementRequestDTO request) {
        return new ResponseEntity<>(stockMovementService.createStockMovement(request), HttpStatus.CREATED);
    }
}
