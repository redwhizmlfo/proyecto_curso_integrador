package com.ferreteria.controller;

import com.ferreteria.dto.PurchaseOrderReqDTO;
import com.ferreteria.model.PurchaseOrder;
import com.ferreteria.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService orderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> create(@RequestBody PurchaseOrderReqDTO request) {
        return new ResponseEntity<>(orderService.createOrder(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrder> receiveOrder(@PathVariable UUID id, @RequestParam UUID receivedBy) {
        return ResponseEntity.ok(orderService.receiveOrder(id, receivedBy));
    }
}
