package com.ferreteria.controller;

import com.ferreteria.dto.InventoryBoxRequestDTO;
import com.ferreteria.dto.InventoryBoxResponseDTO;
import com.ferreteria.dto.InventoryMovementsResponseDTO;
import com.ferreteria.service.InventoryBoxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventory-boxes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryBoxController {

    private final InventoryBoxService service;

    @GetMapping
    public ResponseEntity<InventoryMovementsResponseDTO> getMovements() {
        return ResponseEntity.ok(service.getMovements());
    }

    @PostMapping
    public ResponseEntity<InventoryBoxResponseDTO> create(@Valid @RequestBody InventoryBoxRequestDTO request) {
        return new ResponseEntity<>(service.createBox(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/release")
    public ResponseEntity<InventoryMovementsResponseDTO> release(@PathVariable UUID id) {
        return ResponseEntity.ok(service.releaseBox(id));
    }
}
