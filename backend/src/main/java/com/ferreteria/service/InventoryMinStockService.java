package com.ferreteria.service;

import com.ferreteria.model.InventoryMinStock;
import com.ferreteria.repository.InventoryMinStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryMinStockService {

    private final InventoryMinStockRepository repository;

    public Map<UUID, Integer> getAll() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(InventoryMinStock::getProductModelId, InventoryMinStock::getMinStock));
    }

    @Transactional
    public Map<UUID, Integer> save(UUID productModelId, Integer minStock) {
        InventoryMinStock config = repository.findById(productModelId)
                .orElse(InventoryMinStock.builder().productModelId(productModelId).build());
        config.setMinStock(minStock);
        repository.save(config);
        return getAll();
    }
}
