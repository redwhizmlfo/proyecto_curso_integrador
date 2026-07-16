package com.ferreteria.controller;

import com.ferreteria.model.ProductoImagen;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.repository.ProductoImagenRepository;
import com.ferreteria.repository.ProductoModeloRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/imagenes-modelos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoImagenController {

    private final ProductoImagenRepository productoImagenRepository;
    private final ProductoModeloRepository productoModeloRepository;

    @GetMapping
    public ResponseEntity<List<ProductoImagen>> getAll() {
        return ResponseEntity.ok(productoImagenRepository.findAll());
    }

    @GetMapping("/modelo/{modelId}")
    public ResponseEntity<List<ProductoImagen>> getByModelId(@PathVariable UUID modelId) {
        return ResponseEntity.ok(productoImagenRepository.findByProductoModeloId(modelId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ImagenRequestDTO request) {
        try {
            ProductoModelo modelo = productoModeloRepository.findById(request.getModelId())
                    .orElseThrow(() -> new RuntimeException("Modelo no encontrado"));

            ProductoImagen img = ProductoImagen.builder()
                    .productoModelo(modelo)
                    .urlImagen(request.getImageUrl())
                    .build();

            return new ResponseEntity<>(productoImagenRepository.save(img), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/modelo/{modelId}")
    public ResponseEntity<Void> deleteByModelId(@PathVariable UUID modelId) {
        List<ProductoImagen> imgs = productoImagenRepository.findByProductoModeloId(modelId);
        productoImagenRepository.deleteAll(imgs);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ImagenRequestDTO {
        private UUID id_producto_modelo;
        private UUID idProductoModelo;
        private String url_imagen;
        private String urlImagen;

        public UUID getModelId() {
            return id_producto_modelo != null ? id_producto_modelo : idProductoModelo;
        }

        public String getImageUrl() {
            return url_imagen != null ? url_imagen : urlImagen;
        }
    }
}
