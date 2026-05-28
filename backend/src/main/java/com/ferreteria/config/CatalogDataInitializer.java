package com.ferreteria.config;

import com.ferreteria.model.*;
import com.ferreteria.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class CatalogDataInitializer implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final ProductoModeloRepository productoModeloRepository;
    private final EspecificacionRepository especificacionRepository;
    private final ProductoImagenRepository productoImagenRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only run if database is empty
        if (categoriaRepository.count() == 0) {
            // 1. Create Categories
            Categoria esmeriles = Categoria.builder().nombreCategoria("Esmeriles").build();
            Categoria taladros = Categoria.builder().nombreCategoria("Taladros").build();
            Categoria rotomartillos = Categoria.builder().nombreCategoria("Rotomartillos").build();
            categoriaRepository.saveAll(Arrays.asList(esmeriles, taladros, rotomartillos));

            // 2. Create Brands
            Marca bosch = Marca.builder().nombreMarca("Bosch").build();
            Marca makita = Marca.builder().nombreMarca("Makita").build();
            Marca dewalt = Marca.builder().nombreMarca("DeWalt").build();
            marcaRepository.saveAll(Arrays.asList(bosch, makita, dewalt));

            // 3. Create Product Models
            // GWS2200
            ProductoModelo gws2200 = ProductoModelo.builder()
                    .codigoModelo("GWS 22-180 H")
                    .modelo("GWS2200")
                    .sku("SKU-75010324")
                    .precio(new BigDecimal("349.99"))
                    .stock(80)
                    .categoria(esmeriles)
                    .marca(bosch)
                    .build();

            // GWS750
            ProductoModelo gws750 = ProductoModelo.builder()
                    .codigoModelo("GWS 7-115")
                    .modelo("GWS750")
                    .sku("SKU-72093104")
                    .precio(new BigDecimal("199.50"))
                    .stock(45)
                    .categoria(esmeriles)
                    .marca(bosch)
                    .build();

            // M0900B
            ProductoModelo m0900b = ProductoModelo.builder()
                    .codigoModelo("M0900B 540W")
                    .modelo("M0900B")
                    .sku("SKU-84102941")
                    .precio(new BigDecimal("155.00"))
                    .stock(30)
                    .categoria(esmeriles)
                    .marca(makita)
                    .build();

            productoModeloRepository.saveAll(Arrays.asList(gws2200, gws750, m0900b));

            // 4. Create Specifications
            // GWS2200
            especificacionRepository.saveAll(Arrays.asList(
                    Especificacion.builder().productoModelo(gws2200).atributo("Potencia").valor("2200 W").build(),
                    Especificacion.builder().productoModelo(gws2200).atributo("Diámetro de disco").valor("7\" (180 mm)").build(),
                    Especificacion.builder().productoModelo(gws2200).atributo("Velocidad").valor("8500 RPM").build(),
                    Especificacion.builder().productoModelo(gws2200).atributo("Peso").valor("5.2 kg").build()
            ));

            // GWS750
            especificacionRepository.saveAll(Arrays.asList(
                    Especificacion.builder().productoModelo(gws750).atributo("Potencia").valor("750 W").build(),
                    Especificacion.builder().productoModelo(gws750).atributo("Diámetro de disco").valor("4 1/2\" (115 mm)").build(),
                    Especificacion.builder().productoModelo(gws750).atributo("Velocidad").valor("11000 RPM").build(),
                    Especificacion.builder().productoModelo(gws750).atributo("Peso").valor("1.8 kg").build()
            ));

            // M0900B
            especificacionRepository.saveAll(Arrays.asList(
                    Especificacion.builder().productoModelo(m0900b).atributo("Potencia").valor("540 W").build(),
                    Especificacion.builder().productoModelo(m0900b).atributo("Velocidad").valor("12000 RPM").build(),
                    Especificacion.builder().productoModelo(m0900b).atributo("Peso").valor("1.6 kg").build()
            ));

            // 5. Create Product Images
            // GWS2200 images
            productoImagenRepository.saveAll(Arrays.asList(
                    ProductoImagen.builder().productoModelo(gws2200).urlImagen("/src/assets/esmeril_gws2200.png").build(),
                    ProductoImagen.builder().productoModelo(gws2200).urlImagen("/src/assets/taladro.png").build(),
                    ProductoImagen.builder().productoModelo(gws2200).urlImagen("/src/assets/casco.png").build()
            ));

            // GWS750 images
            productoImagenRepository.saveAll(Arrays.asList(
                    ProductoImagen.builder().productoModelo(gws750).urlImagen("/src/assets/esmeril_gws750.png").build(),
                    ProductoImagen.builder().productoModelo(gws750).urlImagen("/src/assets/taladro.png").build(),
                    ProductoImagen.builder().productoModelo(gws750).urlImagen("/src/assets/pernos.png").build()
            ));

            // M0900B images
            productoImagenRepository.saveAll(Arrays.asList(
                    ProductoImagen.builder().productoModelo(m0900b).urlImagen("/src/assets/taladro.png").build()
            ));
        }
    }
}
