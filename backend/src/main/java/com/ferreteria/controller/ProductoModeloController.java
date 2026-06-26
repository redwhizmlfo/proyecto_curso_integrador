package com.ferreteria.controller;

import com.ferreteria.model.Categoria;
import com.ferreteria.model.Marca;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.repository.CategoriaRepository;
import com.ferreteria.repository.MarcaRepository;
import com.ferreteria.repository.ProductoModeloRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/modelos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoModeloController {

    private final ProductoModeloRepository productoModeloRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;

    @GetMapping
    public ResponseEntity<List<ProductoModelo>> getAll() {
        return ResponseEntity.ok(productoModeloRepository.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductoModelo>> search(@RequestParam String query) {
        return ResponseEntity.ok(productoModeloRepository.search(query));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ModeloRequestDTO request) {
        try {
            Categoria categoria = categoriaRepository.findById(request.getId_categoria())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            Marca marca = marcaRepository.findById(request.getId_marca())
                    .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

            ProductoModelo modeloObj = ProductoModelo.builder()
                    .codigoModelo(request.getCodigoModelo())
                    .modelo(request.getModelo())
                    .sku(request.getSku())
                    .precio(request.getPrecio())
                    .stock(request.getStock())
                    .categoria(categoria)
                    .marca(marca)
                    .build();

            return new ResponseEntity<>(productoModeloRepository.save(modeloObj), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ModeloRequestDTO request) {
        try {
            ProductoModelo existing = productoModeloRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Modelo no encontrado"));

            Categoria categoria = categoriaRepository.findById(request.getId_categoria())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            Marca marca = marcaRepository.findById(request.getId_marca())
                    .orElseThrow(() -> new RuntimeException("Marca no encontrada"));

            existing.setCodigoModelo(request.getCodigoModelo());
            existing.setModelo(request.getModelo());
            existing.setSku(request.getSku());
            existing.setPrecio(request.getPrecio());
            existing.setStock(request.getStock());
            existing.setCategoria(categoria);
            existing.setMarca(marca);

            return ResponseEntity.ok(productoModeloRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productoModeloRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ModeloRequestDTO {
        private String codigoModelo;
        private String modelo;
        private String sku;
        private BigDecimal precio;
        private Integer stock;
        private UUID id_categoria;
        private UUID id_marca;
    }
}
