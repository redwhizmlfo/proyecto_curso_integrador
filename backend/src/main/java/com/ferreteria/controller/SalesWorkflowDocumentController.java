package com.ferreteria.controller;

import com.ferreteria.dto.SalesWorkflowDocumentRequestDTO;
import com.ferreteria.dto.SalesWorkflowDocumentResponseDTO;
import com.ferreteria.dto.SalesWorkflowStatusRequestDTO;
import com.ferreteria.service.SalesWorkflowDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sales-workflow")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesWorkflowDocumentController {

    private final SalesWorkflowDocumentService service;

    @GetMapping("/quotations")
    public ResponseEntity<List<SalesWorkflowDocumentResponseDTO>> getQuotations() {
        return ResponseEntity.ok(service.getQuotations());
    }

    @PostMapping("/quotations")
    public ResponseEntity<SalesWorkflowDocumentResponseDTO> createQuotation(
            @Valid @RequestBody SalesWorkflowDocumentRequestDTO request
    ) {
        return new ResponseEntity<>(service.createQuotation(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/quotations/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable UUID id) {
        service.delete(id, "quotation");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<SalesWorkflowDocumentResponseDTO>> getOrders() {
        return ResponseEntity.ok(service.getOrders());
    }

    @PostMapping("/orders")
    public ResponseEntity<SalesWorkflowDocumentResponseDTO> createOrder(
            @Valid @RequestBody SalesWorkflowDocumentRequestDTO request
    ) {
        return new ResponseEntity<>(service.createOrder(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID id) {
        service.delete(id, "order");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/orders/{id}/dispatch")
    public ResponseEntity<SalesWorkflowDocumentResponseDTO> dispatchOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(service.createDispatchFromOrder(id));
    }

    @GetMapping("/dispatches")
    public ResponseEntity<List<SalesWorkflowDocumentResponseDTO>> getDispatches() {
        return ResponseEntity.ok(service.getDispatches());
    }

    @PutMapping("/dispatches/{id}/status")
    public ResponseEntity<SalesWorkflowDocumentResponseDTO> updateDispatchStatus(
            @PathVariable UUID id,
            @Valid @RequestBody SalesWorkflowStatusRequestDTO request
    ) {
        return ResponseEntity.ok(service.updateDispatchStatus(id, request.getStatus()));
    }

    @DeleteMapping("/dispatches/{id}")
    public ResponseEntity<Void> deleteDispatch(@PathVariable UUID id) {
        service.delete(id, "dispatch");
        return ResponseEntity.noContent().build();
    }
}
