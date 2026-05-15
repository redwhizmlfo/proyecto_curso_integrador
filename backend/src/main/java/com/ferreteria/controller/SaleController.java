package com.ferreteria.controller;

import com.ferreteria.dto.SaleRequestDTO;
import com.ferreteria.model.Sale;
import com.ferreteria.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;
    private final com.ferreteria.repository.SaleRepository saleRepository;

    @GetMapping
    public ResponseEntity<java.util.List<Sale>> getAll() {
        return ResponseEntity.ok(saleRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@RequestBody SaleRequestDTO request) {
        try {
            Sale sale = saleService.createSale(request);
            return ResponseEntity.ok(sale);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
