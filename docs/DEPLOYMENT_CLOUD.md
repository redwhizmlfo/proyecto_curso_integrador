# Guia de despliegue en la nube

Fecha: 2026-07-16

## Arquitectura elegida

- Base de datos: Supabase PostgreSQL.
- Backend: Render con Docker.
- Frontend: Vercel con Vite/React.

Orden recomendado:

1. Crear base en Supabase.
2. Ejecutar `esquema.sql`.
3. Desplegar backend en Render.
4. Desplegar frontend en Vercel.
5. Actualizar CORS del backend con la URL final de Vercel.

## 1. Supabase

Crear un proyecto en Supabase y abrir el SQL Editor.

Ejecutar el contenido completo de:

```txt
esquema.sql
```

El esquema ya fue validado en PostgreSQL 16 temporal con `ON_ERROR_STOP=1`.

### Datos que necesitas copiar de Supabase

En Supabase Dashboard, entrar a `Connect` y copiar:

- Host.
- Database name, normalmente `postgres`.
- User, normalmente `postgres` o el usuario del pooler.
- Password del proyecto.
- Port, normalmente `5432` para conexion directa o session pooler.

Para Render/Spring Boot se debe usar una URL JDBC.

Conexion directa:

```env
DATABASE_URL=jdbc:postgresql://db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=TU_PASSWORD_SUPABASE
```

Session pooler:

```env
DATABASE_URL=jdbc:postgresql://aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require
DB_USERNAME=postgres.PROJECT_REF
DB_PASSWORD=TU_PASSWORD_SUPABASE
```

Notas:

- Usar `sslmode=require`.
- Si el proveedor backend no soporta IPv6, usar el pooler de Supabase.
- No publicar password ni secretos en GitHub.

## 2. Backend en Render

Archivos preparados:

- `backend/Dockerfile`
- `render.yaml`
- Endpoint publico de salud: `GET /api/health`
- Variables de ejemplo: `backend/.env.example`
- Auditoria de esquema: `docs/SCHEMA_AUDIT.md`

### Variables requeridas en Render

```env
PORT=8081
DATABASE_URL=jdbc:postgresql://db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
DB_USERNAME=postgres
DB_PASSWORD=TU_PASSWORD_SUPABASE
DDL_AUTO=update
SHOW_SQL=false
SQL_LOG_LEVEL=INFO
JWT_SECRET=VALOR_LARGO_ALEATORIO_MINIMO_32_BYTES
JWT_EXPIRATION_MS=3600000
CORS_ALLOWED_ORIGINS=https://TU_FRONTEND.vercel.app
CUSTOMER_LOOKUP_TOKEN=
```

Mientras no exista la URL de Vercel, puedes usar temporalmente:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Luego actualizarla con la URL real de Vercel.

### Pruebas backend

Health check:

```bash
curl https://TU_BACKEND.onrender.com/api/health
```

Debe responder:

```json
{"status":"ok"}
```

Login:

```bash
curl -X POST https://TU_BACKEND.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Validar sesion:

```bash
curl https://TU_BACKEND.onrender.com/api/auth/me \
  -H "Authorization: Bearer TOKEN_AQUI"
```

## 3. Frontend en Vercel

Archivos preparados:

- `frontend/vercel.json`
- `frontend/.env.example`

Configuracion del proyecto:

- Root Directory: `frontend`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Variable requerida:

```env
VITE_API_URL=https://TU_BACKEND.onrender.com/api
```

Vercel/Vite solo expone al navegador variables con prefijo `VITE_`.

## 4. Checklist final

- [ ] Proyecto Supabase creado.
- [ ] `esquema.sql` ejecutado en Supabase.
- [ ] Backend desplegado en Render.
- [ ] `GET /api/health` responde `200`.
- [ ] Login admin funciona contra backend cloud.
- [ ] Frontend desplegado en Vercel.
- [ ] `VITE_API_URL` apunta al backend cloud.
- [ ] `CORS_ALLOWED_ORIGINS` incluye la URL real de Vercel.
- [ ] Login funciona desde la URL final de Vercel.
- [ ] URLs finales agregadas al README.
