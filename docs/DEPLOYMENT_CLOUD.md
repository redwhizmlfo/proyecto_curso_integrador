# Guia de despliegue en la nube

Fecha: 2026-07-16

## Arquitectura recomendada

- Frontend: Vercel.
- Backend: Render, Railway, Fly.io o VPS con Docker.
- Base de datos: PostgreSQL administrado.

## Backend

El backend queda preparado con:

- `backend/Dockerfile`
- `render.yaml`
- Endpoint publico de salud: `GET /api/health`
- Variables productivas en `backend/.env.example`
- Esquema auditado en `docs/SCHEMA_AUDIT.md`

### Variables requeridas

Configurar en el proveedor cloud:

```env
PORT=8081
DATABASE_URL=jdbc:postgresql://host:5432/database_name
DB_USERNAME=usuario
DB_PASSWORD=password
DDL_AUTO=update
SHOW_SQL=false
SQL_LOG_LEVEL=INFO
JWT_SECRET=valor_largo_aleatorio_minimo_32_bytes
JWT_EXPIRATION_MS=3600000
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
CUSTOMER_LOOKUP_TOKEN=
```

Notas:

- `DATABASE_URL` debe ser una URL JDBC.
- `JWT_SECRET` no debe quedar en el repositorio.
- `CORS_ALLOWED_ORIGINS` debe incluir la URL final de Vercel.

### Pruebas backend despues del deploy

```bash
curl https://tu-backend.onrender.com/api/health
```

Debe responder:

```json
{"status":"ok"}
```

Login:

```bash
curl -X POST https://tu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Validar token:

```bash
curl https://tu-backend.onrender.com/api/auth/me \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## Frontend

El frontend queda preparado con:

- `frontend/vercel.json`
- `frontend/.env.example`
- Build Vite verificado localmente.

### Variable requerida en Vercel

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

### Configuracion Vercel

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Checklist final cloud

- [ ] Backend desplegado.
- [ ] `GET /api/health` responde `200`.
- [ ] PostgreSQL cloud conectado.
- [ ] Login admin funciona contra backend cloud.
- [ ] Frontend desplegado.
- [ ] `VITE_API_URL` apunta al backend cloud.
- [ ] `CORS_ALLOWED_ORIGINS` incluye la URL del frontend.
- [ ] Login funciona desde la URL final del frontend.
- [ ] README actualizado con URLs reales.
