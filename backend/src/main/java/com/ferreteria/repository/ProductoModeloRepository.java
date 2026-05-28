package com.ferreteria.repository;

import com.ferreteria.model.ProductoModelo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface ProductoModeloRepository extends JpaRepository<ProductoModelo, UUID> {

    @Query("SELECT p FROM ProductoModelo p WHERE " +
           "LOWER(p.modelo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.codigoModelo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.categoria.nombreCategoria) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.marca.nombreMarca) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ProductoModelo> search(@Param("query") String query);
}
