package com.ferreteria.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferreteria.dto.InventoryBoxHistoryResponseDTO;
import com.ferreteria.dto.InventoryBoxRequestDTO;
import com.ferreteria.dto.InventoryBoxResponseDTO;
import com.ferreteria.dto.InventoryMovementsResponseDTO;
import com.ferreteria.model.InventoryBox;
import com.ferreteria.model.InventoryBoxHistory;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.repository.InventoryBoxHistoryRepository;
import com.ferreteria.repository.InventoryBoxRepository;
import com.ferreteria.repository.ProductoModeloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryBoxService {

    private static final ZoneId LIMA_ZONE = ZoneId.of("America/Lima");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy hh:mm a");

    private final InventoryBoxRepository boxRepository;
    private final InventoryBoxHistoryRepository historyRepository;
    private final ProductoModeloRepository productoModeloRepository;
    private final ObjectMapper objectMapper;

    public InventoryMovementsResponseDTO getMovements() {
        return InventoryMovementsResponseDTO.builder()
                .boxes(boxRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toBoxResponse).toList())
                .history(historyRepository.findAllByOrderByReleasedAtDesc().stream().map(this::toHistoryResponse).toList())
                .build();
    }

    @Transactional
    public InventoryBoxResponseDTO createBox(InventoryBoxRequestDTO request) {
        InventoryBox box = InventoryBox.builder()
                .name(request.getName().trim())
                .brandId(request.getBrandId())
                .brandName(request.getBrandName())
                .status("SELLADA")
                .origin(request.getOrigin() != null && !request.getOrigin().isBlank()
                        ? request.getOrigin()
                        : "Almacen de Entrada")
                .itemsJson(writeItems(request.getItems()))
                .build();
        return toBoxResponse(boxRepository.save(box));
    }

    @Transactional
    public InventoryMovementsResponseDTO releaseBox(UUID boxId) {
        InventoryBox box = boxRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
        if (!"SELLADA".equalsIgnoreCase(box.getStatus())) {
            throw new RuntimeException("La caja ya fue liberada.");
        }

        List<Map<String, Object>> items = readItems(box.getItemsJson());
        for (Map<String, Object> item : items) {
            ProductoModelo model = findModel(item);
            int qty = asQuantity(item.get("qty"));
            model.setStock(model.getStock() + qty);
            productoModeloRepository.save(model);
        }

        box.setStatus("LIBERADA");
        boxRepository.save(box);

        historyRepository.save(InventoryBoxHistory.builder()
                .boxName(box.getName())
                .brandName(box.getBrandName())
                .itemsJson(box.getItemsJson())
                .build());

        return getMovements();
    }

    private ProductoModelo findModel(Map<String, Object> item) {
        Object modelId = item.get("modelId");
        if (modelId == null || String.valueOf(modelId).isBlank()) {
            throw new RuntimeException("Un item de la caja no tiene modelo asociado.");
        }
        return productoModeloRepository.findById(UUID.fromString(String.valueOf(modelId)))
                .orElseThrow(() -> new RuntimeException("Modelo no encontrado para liberar stock."));
    }

    private int asQuantity(Object value) {
        if (value == null) {
            throw new RuntimeException("Un item de la caja no tiene cantidad.");
        }
        int qty = new BigDecimal(String.valueOf(value)).intValue();
        if (qty <= 0) {
            throw new RuntimeException("La cantidad de liberacion debe ser mayor a cero.");
        }
        return qty;
    }

    private InventoryBoxResponseDTO toBoxResponse(InventoryBox box) {
        return InventoryBoxResponseDTO.builder()
                .id(box.getId())
                .name(box.getName())
                .brandId(box.getBrandId())
                .brandName(box.getBrandName())
                .status(box.getStatus())
                .origin(box.getOrigin())
                .dateRegistered(box.getCreatedAt() != null ? DATE_FORMAT.format(box.getCreatedAt().atZoneSameInstant(LIMA_ZONE)) : "")
                .items(readItems(box.getItemsJson()))
                .build();
    }

    private InventoryBoxHistoryResponseDTO toHistoryResponse(InventoryBoxHistory history) {
        return InventoryBoxHistoryResponseDTO.builder()
                .id(history.getId())
                .boxName(history.getBoxName())
                .brandName(history.getBrandName())
                .dateReleased(history.getReleasedAt() != null ? DATE_TIME_FORMAT.format(history.getReleasedAt().atZoneSameInstant(LIMA_ZONE)) : "")
                .items(readItems(history.getItemsJson()))
                .build();
    }

    private String writeItems(List<Map<String, Object>> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            throw new RuntimeException("No se pudieron registrar los items de la caja.");
        }
    }

    private List<Map<String, Object>> readItems(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("No se pudieron leer los items de la caja.");
        }
    }
}
