# Documentación del Proyecto: FerreMas Luxury ERP

Este documento detalla la implementación del sistema "FerreMas" en base a los criterios requeridos por la rúbrica de evaluación.

---

## IV. Arquitectura del proyecto Spring Boot

El proyecto está estructurado utilizando una **Arquitectura en Capas (Layered Architecture)**, el estándar más robusto en el ecosistema de Spring Boot. Las capas implementadas son:

1. **Capa de Presentación (Controllers):** Gestiona las peticiones HTTP (REST), valida las entradas iniciales y enruta el flujo hacia los servicios correspondientes. Ubicación: `com.ferreteria.controller`.
2. **Capa de Negocio (Services):** Contiene toda la lógica de negocio, validaciones complejas y cálculos. Se ubica en `com.ferreteria.service`.
3. **Capa de Persistencia (Repositories):** Se comunica con la base de datos PostgreSQL utilizando Spring Data JPA. Ubicación: `com.ferreteria.repository`.
4. **Capa de Dominio (Models):** Entidades que mapean directamente a las tablas de la base de datos. Ubicación: `com.ferreteria.model`.

Se ha utilizado **Spring Boot 3.3.4** con **Java 21**, garantizando el uso de las últimas características de rendimiento del lenguaje.

---

## V. Implementación de API REST y CRUD

El backend expone una API RESTful madura que sigue las mejores prácticas (uso adecuado de verbos HTTP y códigos de estado como `200 OK`, `201 Created`, `404 Not Found`, `500 Internal Server Error`).

Se han implementado operaciones **CRUD completas** (Create, Read, Update, Delete) para los módulos principales del ERP:
- **Clientes:** `/api/customers`
- **Proveedores:** `/api/suppliers`
- **Productos:** `/api/products`
- **Inventario (Movimientos):** `/api/stock-movements`
- **Ventas (Sales):** `/api/sales`

Para documentar y facilitar las pruebas interactivas de estos endpoints, se ha integrado **Swagger (OpenAPI)**, accesible a través de `/swagger-ui.html`.

---

## VI. Dependency Injection y DTOs

### Inyección de Dependencias
Se ha aplicado ampliamente la **Inversión de Control (IoC)** y la inyección de dependencias de Spring. En lugar de instanciar clases manualmente con `new`, el framework gestiona el ciclo de vida de los Beans.
- Se utiliza inyección por constructor mediante la anotación `@RequiredArgsConstructor` de Lombok, lo que garantiza que las dependencias sean inmutables (declaradas como `final`) y seguras.

### DTOs (Data Transfer Objects)
Para desacoplar el modelo de base de datos de las interfaces de cliente (frontend/Postman), se implementó el patrón DTO.
- **Ejemplos implementados:** `LoginRequestDTO`, `PurchaseOrderReqDTO`, `StockMovementReqDTO`.
- Esto evita exponer campos sensibles (como contraseñas, tokens o metadatos de auditoría) y previene problemas de sobreescritura accidental o ciclos infinitos al serializar JSON.

---

## VII. Persistencia con JPA/Hibernate

La capa de base de datos utiliza **PostgreSQL** orquestado por **Hibernate (JPA)**.
- **Modelado de Datos:** Uso exhaustivo de anotaciones como `@Entity`, `@Table`, `@Column`. Las claves primarias utilizan UUID (`@GeneratedValue`).
- **Auditoría (JPA Auditing):** Las entidades extienden seguimiento automático de tiempos mediante `@CreatedDate` y `@LastModifiedDate`. Se configuró un `JpaAuditingConfig` especializado para trabajar de forma transparente con `OffsetDateTime` respetando las zonas horarias.
- **Relaciones:** Implementación de relaciones como `@ManyToOne` y `@OneToMany` usando carga perezosa (`FetchType.LAZY`) para optimizar el consumo de memoria.

---

## VIII. Consultas y operaciones con base de datos

Las operaciones sobre la base de datos se manejan abstrayendo la complejidad de SQL a través de las interfaces `JpaRepository` de Spring Data.

1. **Query Methods:** Se crearon métodos derivados inteligentes que Spring Data traduce automáticamente a SQL:
   - `findByUsername(String username)` en `UserRepository`.
   - `findByRuc(String ruc)` en `SupplierRepository`.
2. **Operaciones Transaccionales:** Las lógicas de negocio que involucran múltiples tablas (como registrar una venta y a su vez descontar stock del producto) utilizan `@Transactional` para garantizar el concepto ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad). Si un paso falla, se aplica un *rollback* completo.

---

## IX. Seguridad inicial con Spring Security

El proyecto incluye un entorno robusto de seguridad desde la capa `SecurityConfig`:
1. **Encriptación de Contraseñas:** Se utiliza `BCryptPasswordEncoder` para asegurar que ninguna contraseña (como las de los administradores) se almacene en texto plano en PostgreSQL.
2. **Autenticación Dual:** 
   - **Basic Auth:** Habilitado para compatibilidad simple y requerimientos directos de la rúbrica.
   - **JWT (JSON Web Tokens):** Flujo implementado y preparado a través de `AuthController` y `JwtService` para proporcionar seguridad moderna sin estado (stateless) hacia aplicaciones cliente como React.
3. **Autorización:** Se implementó `CustomUserDetailsService` para cargar dinámicamente los roles desde la tabla `users` de la BD y restringir rutas sensibles basadas en el rol (ej. `.hasRole("ADMIN")`).

---

## X. Evidencias del proyecto

1. **Código Fuente:** Repositorio en GitHub conteniendo todo el ecosistema (Frontend en React y Backend en Spring Boot).
2. **Swagger OpenAPI:** Interfaz de pruebas visual en `/swagger-ui/index.html`.
3. **Colección Postman:** Disponibilidad del archivo `postman_endpoints.md` que detalla las peticiones, URLs, headers y los payloads JSON listos para usar en Postman.
4. **Base de Datos:** Estructura SQL generada limpiamente vía esquema o generador de DDL de Hibernate.

---

## XI. Dificultades encontradas

Durante la integración y desarrollo, el equipo superó exitosamente varios retos técnicos complejos:

1. **Conflicto de Tiempos (JPA Auditing vs OffsetDateTime):** 
   - *Problema:* Al insertar registros, Spring Data internamente intentaba parsear las fechas como `LocalDateTime`, ocasionando colisiones `InvalidDataAccessApiUsageException` con el `OffsetDateTime` de PostgreSQL.
   - *Solución:* Se desarrolló la clase `JpaAuditingConfig` la cual inyecta explícitamente un `DateTimeProvider` para obligar a Spring a utilizar `OffsetDateTime.now()`.
2. **Errores de Serialización JSON (Hibernate Lazy Loading Proxies):** 
   - *Problema:* Al solicitar endpoints GET que devolvían listas (como Productos o Movimientos), Jackson (la librería que convierte Java a JSON) fallaba con el error `ByteBuddyInterceptor` al toparse con entidades cargadas de forma "perezosa" (LAZY).
   - *Solución:* Se añadió la directiva `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` en los modelos involucrados (`Product`, `Supplier`, `StockMovement`) para instruir a Jackson a omitir metadatos internos de Hibernate durante la serialización.
3. **Codificación de Archivos (BOM UTF-8):** 
   - *Problema:* Durante el despliegue de ciertos archivos generados por terminal, se inyectaron caracteres BOM, ocasionando que Maven fallara la compilación del código Java con el mensaje "illegal character".
   - *Solución:* Se identificó y reescribió el código eliminando el BOM, estableciendo estándares limpios de guardado en UTF-8 puro.
