package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "especificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Especificacion {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto_modelo", nullable = false)
    private ProductoModelo productoModelo;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String atributo;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String valor;
}
