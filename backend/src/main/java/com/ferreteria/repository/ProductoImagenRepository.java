package com.ferreteria.repository;

import com.ferreteria.model.ProductoImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, UUID> {
    List<ProductoImagen> findByProductoModeloId(UUID productoModeloId);
}
