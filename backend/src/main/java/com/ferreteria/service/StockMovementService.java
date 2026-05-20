package com.ferreteria.service;

import com.ferreteria.model.StockMovement;
import com.ferreteria.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    public List<StockMovement> getAllStockMovements() {
        return stockMovementRepository.findAll(Sort.by(Sort.Direction.DESC, "occurredAt"));
    }

    public List<StockMovement> getStockMovementsByProduct(UUID productId) {
        return stockMovementRepository.findByProductIdOrderByOccurredAtDesc(productId);
    }
}
