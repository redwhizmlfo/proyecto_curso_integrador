package com.ferreteria.repository;

import com.ferreteria.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MarcaRepository extends JpaRepository<Marca, UUID> {
    List<Marca> findAllByNombreMarcaIgnoreCase(String nombreMarca);
}
