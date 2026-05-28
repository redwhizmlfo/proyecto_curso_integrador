package com.ferreteria.controller;

import com.ferreteria.model.Marca;
import com.ferreteria.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarcaController {

    private final MarcaRepository marcaRepository;

    @GetMapping
    public ResponseEntity<List<Marca>> getAll() {
        return ResponseEntity.ok(marcaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Marca> create(@RequestBody Marca marca) {
        return new ResponseEntity<>(marcaRepository.save(marca), HttpStatus.CREATED);
    }
}
