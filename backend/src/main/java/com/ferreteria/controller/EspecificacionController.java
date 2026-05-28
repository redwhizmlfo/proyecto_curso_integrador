package com.ferreteria.controller;

import com.ferreteria.model.Especificacion;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.repository.EspecificacionRepository;
import com.ferreteria.repository.ProductoModeloRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/especificaciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EspecificacionController {

    private final EspecificacionRepository especificacionRepository;
    private final ProductoModeloRepository productoModeloRepository;

    @GetMapping
    public ResponseEntity<List<Especificacion>> getAll() {
        return ResponseEntity.ok(especificacionRepository.findAll());
    }

    @GetMapping("/modelo/{modelId}")
    public ResponseEntity<List<Especificacion>> getByModelId(@PathVariable UUID modelId) {
        return ResponseEntity.ok(especificacionRepository.findByProductoModeloId(modelId));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SpecRequestDTO request) {
        try {
            ProductoModelo modelo = productoModeloRepository.findById(request.getId_producto_modelo())
                    .orElseThrow(() -> new RuntimeException("Modelo no encontrado"));

            Especificacion spec = Especificacion.builder()
                    .productoModelo(modelo)
                    .atributo(request.getAtributo())
                    .valor(request.getValor())
                    .build();

            return new ResponseEntity<>(especificacionRepository.save(spec), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/modelo/{modelId}")
    public ResponseEntity<Void> deleteByModelId(@PathVariable UUID modelId) {
        List<Especificacion> specs = especificacionRepository.findByProductoModeloId(modelId);
        especificacionRepository.deleteAll(specs);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class SpecRequestDTO {
        private UUID id_producto_modelo;
        private String atributo;
        private String valor;
    }
}
