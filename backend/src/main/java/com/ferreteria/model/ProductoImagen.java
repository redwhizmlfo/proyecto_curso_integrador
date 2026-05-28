package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "productos_imagenes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoImagen {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto_modelo", nullable = false)
    private ProductoModelo productoModelo;

    @NotBlank
    @Column(name = "url_imagen", nullable = false, length = 1000)
    private String urlImagen;
}
