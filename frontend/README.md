# Frontend - MEPS GROUP

Aplicacion React/Vite para el sistema de gestion ferretera MEPS GROUP.

## Tecnologias

- React 19.
- Vite 8.
- React Router DOM.
- Axios.
- Lucide React.

## Variables de entorno

Crear `frontend/.env.local` para desarrollo:

```env
VITE_API_URL=http://localhost:8081/api
```

Para produccion, configurar la misma variable en Vercel o el proveedor usado:

```env
VITE_API_URL=https://URL_BACKEND/api
```

## Scripts

Instalar dependencias:

```bash
npm install
```

Levantar desarrollo:

```bash
npm run dev -- --host 127.0.0.1
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Nota: el build esta operativo. El lint completo puede reportar pendientes heredados que deben limpiarse antes de exigir calidad estricta.

## Estructura

```text
src/
  components/
    AnimatedKpiValue.jsx
    FieldValidationHint.jsx
    Header.jsx
    Sidebar.jsx
    SummaryControls.jsx
  context/
    SidebarToggleContext.jsx
  pages/
    Dashboard.jsx
    Clientes.jsx
    Proveedores.jsx
    Inventario.jsx
    Ventas.jsx
    PanelPermisos.jsx
    temporal/
      Resumen*.jsx
  services/
    api.js
    validators.js
  index.css
```

## Seguridad frontend

- El login consume `POST /auth/login`.
- La sesion se guarda en `localStorage`.
- `api.js` adjunta `Authorization: Bearer <token>`.
- Si el backend responde `401`, se limpia la sesion.
- `App.jsx` valida permisos por ruta con `ROUTE_PERMISSIONS`.

## Validaciones

Las validaciones se centralizan en:

```text
src/services/validators.js
```

Componentes relacionados:

- `FieldValidationHint.jsx`: mensajes en vivo debajo de inputs.
- Formularios con `noValidate` para controlar mensajes propios.

## Responsive

El responsive principal esta en:

```text
src/index.css
```

Se cubre:

- Sidebar en movil.
- Header.
- KPIs.
- Resumenes.
- Tablas con scroll horizontal controlado.
- Formularios.
- Modales.
- Controles de filtros/exportacion.

## Despliegue Vercel

El archivo `vercel.json` incluye rewrites para SPA:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

Pasos:

1. Crear proyecto en Vercel apuntando a `frontend/`.
2. Configurar `VITE_API_URL`.
3. Ejecutar deploy.
4. Verificar login y navegacion.
