package com.ferreteria.controller;

import com.ferreteria.dto.LossRequestDTO;
import com.ferreteria.model.Loss;
import com.ferreteria.service.LossService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/losses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LossController {

    private final LossService lossService;

    @PostMapping
    public ResponseEntity<Loss> registerLoss(@RequestBody LossRequestDTO request) {
        try {
            Loss loss = lossService.registerLoss(
                request.getProductId(),
                request.getUserId(),
                request.getQty(),
                request.getReason(),
                request.getResponsible()
            );
            return ResponseEntity.ok(loss);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/revert")
    public ResponseEntity<Loss> revertLoss(@PathVariable UUID id, @RequestParam UUID userId) {
        try {
            Loss loss = lossService.revertLoss(id, userId);
            return ResponseEntity.ok(loss);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
