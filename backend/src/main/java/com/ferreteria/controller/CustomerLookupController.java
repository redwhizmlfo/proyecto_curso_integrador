package com.ferreteria.controller;

import com.ferreteria.dto.CustomerLookupResponseDTO;
import com.ferreteria.service.CustomerLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer-lookup")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerLookupController {

    private final CustomerLookupService customerLookupService;

    @GetMapping("/{document}")
    public ResponseEntity<CustomerLookupResponseDTO> lookup(@PathVariable String document) {
        return ResponseEntity.ok(customerLookupService.lookupAndStore(document));
    }
}
