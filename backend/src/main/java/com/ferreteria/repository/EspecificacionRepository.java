package com.ferreteria.repository;

import com.ferreteria.model.Especificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface EspecificacionRepository extends JpaRepository<Especificacion, UUID> {
    List<Especificacion> findByProductoModeloId(UUID productoModeloId);
}
