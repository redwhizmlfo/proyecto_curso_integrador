# FERREMAS — Sistema de Gestión Ferretera

> Proyecto Integrador · Curso de Desarrollo de Software  
> Stack: **Spring Boot 3.3 + React 19 + PostgreSQL**

---

## 📋 Descripción General

**FERREMAS** es un sistema de gestión empresarial para ferreterías desarrollado como proyecto integrador. El sistema cubre los módulos de clientes, proveedores, inventario, ventas, empleados, asistencia, boletas/planillas y un dashboard analítico en tiempo real.

La arquitectura sigue el patrón **Controller → Service → Repository → Entity** cumpliendo estándares REST y buenas prácticas de desarrollo con Spring Boot.

---

## 🏗️ Arquitectura del Proyecto

```
springboot/
├── backend/                         # Spring Boot (Java 21)
│   └── src/main/java/com/ferreteria/
│       ├── config/                  # Seguridad y configuración inicial
│       │   ├── SecurityConfig.java
│       │   ├── CatalogDataInitializer.java
│       │   └── PaymentConfigInitializer.java
│       ├── controller/              # 24 controladores REST
│       ├── service/                 # 16 servicios de negocio
│       ├── repository/              # 20 repositorios JPA
│       ├── model/                   # 22 entidades JPA/Hibernate
│       └── dto/                     # 17 DTOs de transferencia de datos
├── frontend/                        # React 19 + Vite
│   └── src/
│       ├── pages/                   # Módulos de la aplicación
│       ├── components/              # Sidebar, Header, componentes reutilizables
│       └── index.css                # Sistema de diseño global
└── esquema.sql                      # Esquema DDL + datos semilla
```

---

## ⚙️ Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje principal |
| Spring Boot | 3.3.4 | Framework principal |
| Spring Data JPA | 3.3.4 | Persistencia ORM |
| Spring Security | 3.3.4 | Autenticación y autorización |
| Hibernate | 6.x | Implementación JPA |
| PostgreSQL Driver | - | Conector base de datos |
| Lombok | 1.18.44 | Reducción de boilerplate |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.6 | Framework UI |
| Vite | 8.x | Bundler y servidor de desarrollo |
| React Router DOM | 7.15.1 | Enrutamiento SPA |
| Axios | 1.16.1 | Cliente HTTP |
| Lucide React | 1.16.0 | Iconografía |

### Base de Datos
| Tecnología | Detalle |
|---|---|
| PostgreSQL | 18.x |
| Base de datos | `ferremas_db` |
| Puerto | `5432` |

---

## 🔐 Seguridad (Spring Security)

El proyecto implementa **autenticación HTTP Basic** con `BCryptPasswordEncoder` y control de acceso basado en roles:

```java
// SecurityConfig.java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/users/**").hasRole("ADMIN")  // Solo ADMIN
    .anyRequest().permitAll()                           // Resto: abierto
)
.httpBasic(basic -> {});  // HTTP Basic Auth habilitado
```

- `CustomUserDetailsService` implementa `UserDetailsService` para cargar usuarios desde la BD
- Contraseñas almacenadas con hash `BCrypt`
- Roles: `ADMIN`, `USER`

---

## 🗄️ Persistencia JPA/Hibernate

Todos los modelos utilizan anotaciones JPA estándar con auditoría automática:

```java
@Entity
@Table(name = "customers")
@EntityListeners(AuditingEntityListener.class)
public class Customer {
    @Id @GeneratedValue
    private UUID id;

    @CreatedDate
    private OffsetDateTime createdAt;

    @LastModifiedDate
    private OffsetDateTime updatedAt;
}
```

Relaciones implementadas: `@OneToMany`, `@ManyToOne`, `@ManyToMany`  
Repositorios extienden `JpaRepository<T, UUID>` con consultas JPQL personalizadas.

---

## 🌐 API REST — Endpoints Principales

Todos los módulos implementan CRUD completo siguiendo convenciones RESTful:

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/customers` | Listar todos los clientes |
| `GET` | `/api/customers/{id}` | Obtener cliente por ID |
| `POST` | `/api/customers` | Crear nuevo cliente |
| `PUT` | `/api/customers/{id}` | Actualizar cliente |
| `DELETE` | `/api/customers/{id}` | Eliminar cliente |
| `GET` | `/api/suppliers` | Listar proveedores |
| `GET` | `/api/products` | Listar productos |
| `POST` | `/api/sales` | Registrar venta |
| `GET` | `/api/employees` | Listar empleados |
| `GET` | `/api/dashboard/summary` | KPIs del dashboard |

> Base URL: `http://localhost:8080`

---

## 💉 Inyección de Dependencias y DTOs

El proyecto utiliza **constructor injection** vía Lombok `@RequiredArgsConstructor`:

```java
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor   // Inyección por constructor
public class CustomerController {

    private final CustomerService customerService;  // Inyectado automáticamente

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody CustomerRequestDTO request) {
        return new ResponseEntity<>(customerService.createCustomer(request), HttpStatus.CREATED);
    }
}
```

Los **DTOs** separan la capa de presentación del modelo de dominio (17 DTOs implementados).

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Java 21+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

### 1. Configurar Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE ferremas_db;
```

```bash
# Ejecutar el esquema y datos iniciales
psql -h localhost -U postgres -d ferremas_db -f esquema.sql
```

### 2. Configurar `application.properties`

```properties
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ferremas_db
spring.datasource.username=postgres
spring.datasource.password=admin123
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

### 3. Ejecutar el Backend

```bash
cd backend
mvn spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

### 4. Ejecutar el Frontend (desarrollo)

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### 5. Build de producción (frontend embebido en backend)

```bash
cd frontend
npm run build
# Los assets se copian automáticamente a backend/src/main/resources/static/
```

Luego ejecutar solo el backend y acceder a: `http://localhost:8080`

---

## 📦 Módulos del Sistema

| Módulo | Descripción | Endpoints |
|---|---|---|
| **Clientes** | CRUD + búsqueda por DNI/RUC via SUNAT/APIDNI | `/api/customers` |
| **Proveedores** | CRUD + categorías de proveedor | `/api/suppliers` |
| **Inventario** | Productos, stock en vivo, movimientos | `/api/products`, `/api/stock-movements` |
| **Ventas** | Registro de ventas, items, historial | `/api/sales` |
| **Empleados** | CRUD empleados, asistencia, boletas | `/api/employees` |
| **Órdenes de Compra** | Pedidos a proveedores | `/api/purchase-orders` |
| **Dashboard** | KPIs en tiempo real (ventas, stock, clientes) | `/api/dashboard/**` |
| **Usuarios** | Gestión de acceso (solo ADMIN) | `/api/users` |

---

## 🧪 Verificación del Sistema

### Verificar que el backend responde
```bash
curl http://localhost:8080/api/customers
curl http://localhost:8080/api/suppliers
curl http://localhost:8080/api/products
```

### Verificar datos en PostgreSQL
```bash
psql -h localhost -U postgres -d ferremas_db -c "SELECT COUNT(*) FROM customers;"
psql -h localhost -U postgres -d ferremas_db -c "SELECT COUNT(*) FROM suppliers;"
psql -h localhost -U postgres -d ferremas_db -c "SELECT COUNT(*) FROM products;"
```

### Probar autenticación (endpoint protegido)
```bash
# Sin credenciales → 401 Unauthorized
curl http://localhost:8080/api/users

# Con credenciales ADMIN → 200 OK
curl -u admin:admin123 http://localhost:8080/api/users
```

---

## 👥 Estructura de Ramas Git

| Rama | Responsable |
|---|---|
| `main` | Producción estable |
| `feature/frontend-dashboard-navbar` | Dashboard y navegación |
| `feature/frontend-modulo-clientes` | Módulo clientes |
| `feature/frontend-modulo-ventas` | Módulo ventas |
| `feature/frontend-modulo-proveedores` | Módulo proveedores |
| `BE-feature/spring-security-jwt` | JWT (remoto) |
| `BE-feature/modulo_asistencia` | Asistencia (remoto) |

---

## 📁 Datos de Prueba

El archivo `esquema.sql` incluye datos semilla para:
- ✅ Proveedores peruanos reales (10 registros con RUC)
- ✅ Clientes de ejemplo
- ✅ Productos de ferretería con precios y stock
- ✅ Usuario administrador por defecto

---

*Sistema desarrollado como proyecto integrador — FERREMAS © 2026*
