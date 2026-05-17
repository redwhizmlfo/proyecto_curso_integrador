package com.ferreteria.controller;

import com.ferreteria.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-movement")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockMovementController {
    
    private final StockMovementService service;
}
