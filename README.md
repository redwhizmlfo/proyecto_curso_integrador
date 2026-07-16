# MEPS GROUP - Sistema de Gestion Ferretera

Sistema web de gestion para ferreteria desarrollado con Spring Boot, React y PostgreSQL. Incluye modulos operativos de ventas, inventario, clientes, proveedores, pedidos, empleados, asistencia, boletas, dashboard y control de permisos por usuario.

## Stack

| Capa | Tecnologia |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Lucide |
| Backend | Spring Boot 3.3, Spring Security, Spring Data JPA |
| Base de datos | PostgreSQL |
| Seguridad | JWT Bearer Token, roles y permisos por modulo |

## Arquitectura

```text
springboot/
  backend/
    src/main/java/com/ferreteria/
      config/        Seguridad, JWT, CORS, carga inicial
      controller/    Endpoints REST
      service/       Reglas de negocio
      repository/    Acceso a datos JPA
      model/         Entidades
      dto/           Objetos de entrada/salida
  frontend/
    src/
      components/    Header, Sidebar, controles reutilizables
      pages/         Modulos del sistema
      services/      API y validadores
      context/       Estado compartido
      index.css      Sistema visual y responsive
  docs/
    Documentacion tecnica complementaria
```

## Modulos

| Modulo | Estado |
|---|---|
| Login | JWT con usuario y permisos |
| Dashboard | KPIs y resumenes por area |
| Clientes | CRUD, validaciones y consulta DNI/RUC |
| Proveedores | CRUD y validaciones |
| Inventario | Catalogo, stock, movimientos, alertas, mermas y kardex |
| Ventas | POS, historial, cotizaciones, pedidos, despachos, devoluciones y garantias |
| Ordenes de compra | Registro y gestion de pedidos a proveedores |
| RR.HH. | Empleados, asistencia y boletas |
| Usuarios y roles | Panel de permisos por modulo/submodulo |

## Seguridad

El sistema usa autenticacion JWT:

1. El usuario inicia sesion en `POST /api/auth/login`.
2. El backend responde con token JWT, rol y permisos.
3. El frontend guarda la sesion y envia `Authorization: Bearer <token>` en cada request.
4. El backend protege `/api/**` con Spring Security.
5. El frontend valida permisos por ruta para ocultar o bloquear submodulos.

Credenciales locales de prueba:

```text
Usuario: admin
Password: admin123
Rol: ADMIN
```

## Ejecucion local

### Requisitos

- Java 21 o superior
- Maven 3.9+
- Node.js 18+
- PostgreSQL

### Backend

Configurar base de datos local:

```sql
CREATE DATABASE ferremas_db;
```

Variables principales en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/ferremas_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:admin123}
server.port=${PORT:8081}
jwt.secret=${JWT_SECRET:dev_local_jwt_secret_change_me_32_chars_minimum_2026}
```

Levantar backend:

```bash
cd backend
mvn spring-boot:run
```

Backend local:

```text
http://localhost:8081/api
```

### Frontend

Crear `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8081/api
```

Levantar frontend:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Frontend local:

```text
http://127.0.0.1:5173
```

## Verificacion rapida

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
mvn -q -DskipTests compile
```

Login API:

```bash
curl -X POST http://localhost:8081/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

## Despliegue recomendado

Frontend:

- Vercel.
- Configurar `VITE_API_URL=https://URL_BACKEND/api`.
- El archivo `frontend/vercel.json` contiene rewrites para SPA.

Backend:

- Render, Railway, Fly.io o VPS.
- Configurar variables:

```env
PORT=8081
DATABASE_URL=jdbc:postgresql://HOST:5432/DB
DB_USERNAME=usuario
DB_PASSWORD=password
JWT_SECRET=secreto_largo_seguro
CORS_ALLOWED_ORIGINS=https://URL_FRONTEND
```

Base de datos:

- PostgreSQL local para desarrollo.
- PostgreSQL cloud para entrega/despliegue.

## Documentacion complementaria

- `docs/CONSULTA_CLIENTES_DNI_RUC.md`
- `docs/PASARELAS_PAGO_PRODUCCION.md`
- `docs/CHECKLIST_RUBRICA_ENTREGA.md`
- `docs/DEPLOYMENT_CLOUD.md`

## Estado de calidad conocido

- `frontend npm run build`: operativo.
- `backend mvn -DskipTests compile`: operativo.
- `npm run lint` completo aun requiere limpieza de errores heredados en varios modulos. No bloquea build, pero debe quedar como mejora tecnica pendiente si se exige lint estricto.

## Sustentacion tecnica

Decisiones principales:

- Separacion frontend/backend para desarrollo independiente.
- API REST con servicios de negocio en Spring Boot.
- JWT para sesion stateless.
- Permisos por modulo/submodulo para control de acceso.
- React Router para navegacion SPA.
- Validaciones de formularios centralizadas en `frontend/src/services/validators.js`.
- CSS responsive global para evitar rupturas en cards, tablas, modales y submenus.
