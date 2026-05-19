package com.ferreteria.controller;

import com.ferreteria.dto.StockMovementRequestDTO;
import com.ferreteria.model.StockMovement;
import com.ferreteria.service.StockMovementService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-movement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockMovementController {
    
    private final StockMovementService service;
    
    @GetMapping
    public ResponseEntity<List<StockMovement>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
    
    // Pendiente evaluara si getById debe usar un DTO para no exponer datos de Product o User al frontend.
    @GetMapping
    public ResponseEntity<StockMovement> getById(UUID id) {
        return ResponseEntity.ok(service.getStockMovementById(id));
    }
    
    @PostMapping
    public ResponseEntity<StockMovement> create(@RequestBody StockMovementRequestDTO request) {
        return new ResponseEntity<>(service.createStockMovement(request), HttpStatus.CREATED);
    }
}
