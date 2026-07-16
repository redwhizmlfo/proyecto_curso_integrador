package com.ferreteria.controller;

import com.ferreteria.model.Categoria;
import com.ferreteria.model.Marca;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.dto.PosCatalogProductDTO;
import com.ferreteria.repository.CategoriaRepository;
import com.ferreteria.repository.MarcaRepository;
import com.ferreteria.repository.ProductoModeloRepository;
import com.ferreteria.repository.ProductoImagenRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/modelos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductoModeloController {

    private final ProductoModeloRepository productoModeloRepository;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final ProductoImagenRepository productoImagenRepository;

    @GetMapping
    public ResponseEntity<List<ProductoModelo>> getAll() {
        return ResponseEntity.ok(productoModeloRepository.findAll());
    }

    @GetMapping("/pos-catalog")
    public ResponseEntity<List<PosCatalogProductDTO>> getPosCatalog() {
        List<PosCatalogProductDTO> catalog = productoModeloRepository.findAll().stream()
                .map(model -> new PosCatalogProductDTO(
                        model.getId(),
                        buildPosProductName(model),
                        model.getMarca() != null ? model.getMarca().getNombreMarca() : null,
                        model.getCodigoModelo(),
                        model.getSku(),
                        model.getPrecio(),
                        model.getStock(),
                        resolveFirstImageUrl(model)
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(catalog);
    }

    private String resolveFirstImageUrl(ProductoModelo model) {
        return productoImagenRepository.findByProductoModeloId(model.getId()).stream()
                .findFirst()
                .map(image -> image.getUrlImagen())
                .orElse(null);
    }

    private String buildPosProductName(ProductoModelo model) {
        String brandName = model.getMarca() != null ? model.getMarca().getNombreMarca() : "";
        String modelName = model.getModelo() != null ? model.getModelo() : "";
        return (brandName + " " + modelName).trim();
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
