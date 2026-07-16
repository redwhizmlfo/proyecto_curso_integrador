package com.ferreteria.config;

import com.ferreteria.model.Categoria;
import com.ferreteria.model.Especificacion;
import com.ferreteria.model.Marca;
import com.ferreteria.model.ProductoImagen;
import com.ferreteria.model.ProductoModelo;
import com.ferreteria.repository.CategoriaRepository;
import com.ferreteria.repository.EspecificacionRepository;
import com.ferreteria.repository.MarcaRepository;
import com.ferreteria.repository.ProductoImagenRepository;
import com.ferreteria.repository.ProductoModeloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class CatalogDataInitializer implements CommandLineRunner {

    private static final String CATALOG_IMAGE_BASE_URL =
            "https://cdn.jsdelivr.net/gh/redwhizmlfo/proyecto_curso_integrador@aea7f14d4c49a317849710ce3d1153f055fdac3e/frontend/src/assets/";

    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final ProductoModeloRepository productoModeloRepository;
    private final EspecificacionRepository especificacionRepository;
    private final ProductoImagenRepository productoImagenRepository;

    @Override
    public void run(String... args) {
        cleanupLegacyDemoModels();

        Categoria esmeriles = getOrCreateCategoria("Esmeriles");
        Categoria taladros = getOrCreateCategoria("Taladros");
        Categoria rotomartillos = getOrCreateCategoria("Rotomartillos");
        Categoria seguridad = getOrCreateCategoria("Seguridad");
        Categoria fijaciones = getOrCreateCategoria("Fijaciones");
        Categoria electricidad = getOrCreateCategoria("Electricidad");

        Marca bosch = getOrCreateMarca("Bosch");
        Marca makita = getOrCreateMarca("Makita");
        Marca dewalt = getOrCreateMarca("DeWalt");
        Marca tresM = getOrCreateMarca("3M");
        Marca prodac = getOrCreateMarca("Prodac");
        Marca schneider = getOrCreateMarca("Schneider Electric");

        seedProduct(
                "SKU-BOSCH-GWS22180H",
                "GWS 22-180 H",
                "GWS 22-180 H",
                new BigDecimal("349.99"),
                80,
                esmeriles,
                bosch,
                catalogImageUrl("esmeril_gws2200.png"),
                spec("Potencia", "2200 W"),
                spec("Disco", "7 pulg. / 180 mm"),
                spec("Velocidad", "8500 RPM")
        );

        seedProduct(
                "SKU-BOSCH-GSB18V50",
                "GSB 18V-50",
                "GSB 18V-50",
                new BigDecimal("449.00"),
                22,
                taladros,
                bosch,
                catalogImageUrl("taladro.png"),
                spec("Voltaje", "18 V"),
                spec("Motor", "Brushless"),
                spec("Torque", "50 Nm")
        );

        seedProduct(
                "SKU-BOSCH-GBH224DRE",
                "GBH 2-24 DRE",
                "GBH 2-24 DRE",
                new BigDecimal("549.90"),
                15,
                rotomartillos,
                bosch,
                catalogImageUrl("rotomartillo_bosch.png"),
                spec("Potencia", "790 W"),
                spec("Impacto", "2.7 J"),
                spec("Mandril", "SDS Plus")
        );

        seedProduct(
                "SKU-MAKITA-M0900B",
                "M0900B",
                "M0900B",
                new BigDecimal("155.00"),
                30,
                esmeriles,
                makita,
                catalogImageUrl("esmeril_gws750.png"),
                spec("Potencia", "540 W"),
                spec("Disco", "4 1/2 pulg."),
                spec("Velocidad", "12000 RPM")
        );

        seedProduct(
                "SKU-MAKITA-HP1630",
                "HP1630",
                "HP1630",
                new BigDecimal("189.90"),
                40,
                taladros,
                makita,
                catalogImageUrl("taladro.png"),
                spec("Potencia", "710 W"),
                spec("Mandril", "13 mm"),
                spec("Velocidad", "3200 RPM")
        );

        seedProduct(
                "SKU-MAKITA-GA4530",
                "GA4530",
                "GA4530",
                new BigDecimal("169.00"),
                35,
                esmeriles,
                makita,
                catalogImageUrl("esmeril_gws750.png"),
                spec("Potencia", "720 W"),
                spec("Disco", "4 1/2 pulg."),
                spec("Velocidad", "11000 RPM")
        );

        seedProduct(
                "SKU-DEWALT-DCD771C2",
                "DCD771C2",
                "DCD771C2",
                new BigDecimal("289.99"),
                25,
                taladros,
                dewalt,
                catalogImageUrl("taladro_dewalt.png"),
                spec("Voltaje", "20 V Max"),
                spec("Mandril", "1/2 pulg."),
                spec("Velocidades", "2")
        );

        seedProduct(
                "SKU-DEWALT-DWE402",
                "DWE402",
                "DWE402",
                new BigDecimal("185.00"),
                28,
                esmeriles,
                dewalt,
                catalogImageUrl("esmeril_gws750.png"),
                spec("Potencia", "11 A"),
                spec("Disco", "4 1/2 pulg."),
                spec("Velocidad", "11000 RPM")
        );

        seedProduct(
                "SKU-DEWALT-D25263K",
                "D25263K",
                "D25263K",
                new BigDecimal("489.00"),
                12,
                rotomartillos,
                dewalt,
                catalogImageUrl("rotomartillo_bosch.png"),
                spec("Potencia", "8.5 A"),
                spec("Impacto", "3.0 J"),
                spec("Mandril", "SDS Plus")
        );

        seedProduct(
                "SKU-BOSCH-GWS7115",
                "GWS 7-115",
                "GWS 7-115",
                new BigDecimal("199.50"),
                45,
                esmeriles,
                bosch,
                catalogImageUrl("esmeril_gws750.png"),
                spec("Potencia", "720 W"),
                spec("Disco", "4 1/2 pulg. / 115 mm"),
                spec("Velocidad", "11000 RPM")
        );

        seedProduct(
                "SKU-MAKITA-HR2470",
                "HR2470",
                "HR2470",
                new BigDecimal("429.00"),
                16,
                rotomartillos,
                makita,
                catalogImageUrl("rotomartillo_bosch.png"),
                spec("Potencia", "780 W"),
                spec("Impacto", "2.4 J"),
                spec("Mandril", "SDS Plus")
        );

        seedProduct(
                "SKU-DEWALT-DCD701F2",
                "DCD701F2",
                "DCD701",
                new BigDecimal("259.90"),
                30,
                taladros,
                dewalt,
                catalogImageUrl("taladro_dewalt.png"),
                spec("Voltaje", "12 V Max"),
                spec("Mandril", "3/8 pulg."),
                spec("Velocidades", "2")
        );

        seedProduct(
                "SKU-3M-H700",
                "H-700",
                "Casco de seguridad H-700",
                new BigDecimal("39.90"),
                120,
                seguridad,
                tresM,
                catalogImageUrl("casco.png"),
                spec("Material", "HDPE"),
                spec("Suspension", "4 puntos"),
                spec("Norma", "ANSI/ISEA Z89.1")
        );

        seedProduct(
                "SKU-PRODAC-PERNO-HEX-38",
                "Perno hexagonal 3/8",
                "Perno hexagonal zincado 3/8 pulg.",
                new BigDecimal("0.90"),
                1500,
                fijaciones,
                prodac,
                catalogImageUrl("pernos.png"),
                spec("Diametro", "3/8 pulg."),
                spec("Acabado", "Zincado"),
                spec("Unidad", "pieza")
        );

        seedProduct(
                "SKU-SCHNEIDER-UNICA-10A",
                "Unica 10A",
                "Interruptor simple Unica 10A",
                new BigDecimal("18.50"),
                85,
                electricidad,
                schneider,
                catalogImageUrl("interruptor.png"),
                spec("Corriente", "10 A"),
                spec("Tension", "250 V"),
                spec("Tipo", "Simple")
        );
    }

    private Categoria getOrCreateCategoria(String nombre) {
        return categoriaRepository.findAllByNombreCategoriaIgnoreCase(nombre).stream()
                .findFirst()
                .orElseGet(() -> categoriaRepository.save(Categoria.builder().nombreCategoria(nombre).build()));
    }

    private Marca getOrCreateMarca(String nombre) {
        return marcaRepository.findAllByNombreMarcaIgnoreCase(nombre).stream()
                .findFirst()
                .orElseGet(() -> marcaRepository.save(Marca.builder().nombreMarca(nombre).build()));
    }

    private void cleanupLegacyDemoModels() {
        Arrays.asList(
                "SKU-75010324",
                "SKU-72093104",
                "SKU-84102941",
                "SKU-30910482",
                "SKU-58291043",
                "SKU-10000001",
                "SKU-10000002",
                "SKU-10000003",
                "SKU-10000004",
                "SKU-10000005",
                "SKU-10000006",
                "SKU-10000007",
                "SKU-10000008",
                "SKU-10000009",
                "SKU-10000010",
                "SKU-10000011",
                "SKU-10000012"
        ).forEach(sku -> productoModeloRepository.findBySku(sku).ifPresent(model -> {
            especificacionRepository.deleteAll(especificacionRepository.findByProductoModeloId(model.getId()));
            productoImagenRepository.deleteAll(productoImagenRepository.findByProductoModeloId(model.getId()));
            productoModeloRepository.delete(model);
        }));
    }

    private void seedProduct(
            String sku,
            String codigoModelo,
            String modelo,
            BigDecimal precio,
            Integer stock,
            Categoria categoria,
            Marca marca,
            String imageUrl,
            Spec... specs
    ) {
        ProductoModelo producto = productoModeloRepository.findBySku(sku)
                .orElseGet(ProductoModelo::new);

        producto.setSku(sku);
        producto.setCodigoModelo(codigoModelo);
        producto.setModelo(modelo);
        producto.setPrecio(precio);
        producto.setStock(stock);
        producto.setCategoria(categoria);
        producto.setMarca(marca);

        ProductoModelo saved = productoModeloRepository.save(producto);

        especificacionRepository.deleteAll(especificacionRepository.findByProductoModeloId(saved.getId()));
        productoImagenRepository.deleteAll(productoImagenRepository.findByProductoModeloId(saved.getId()));

        especificacionRepository.saveAll(Arrays.stream(specs)
                .map(spec -> Especificacion.builder()
                        .productoModelo(saved)
                        .atributo(spec.atributo())
                        .valor(spec.valor())
                        .build())
                .toList());

        productoImagenRepository.save(ProductoImagen.builder()
                .productoModelo(saved)
                .urlImagen(imageUrl)
                .build());
    }

    private Spec spec(String atributo, String valor) {
        return new Spec(atributo, valor);
    }

    private String catalogImageUrl(String fileName) {
        return CATALOG_IMAGE_BASE_URL + fileName;
    }

    private record Spec(String atributo, String valor) {
    }
}
