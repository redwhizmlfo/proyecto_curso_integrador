# Checklist de cumplimiento - Rubrica de entrega

Fecha de auditoria: 2026-07-16

## Resumen ejecutivo

| Criterio | Puntaje | Estado actual | Riesgo |
|---|---:|---|---|
| Integracion Front-end y Back-end | 4 pts | Parcial alta | Medio |
| Funcionalidad integral del sistema | 4 pts | Parcial alta | Medio |
| Seguridad y autenticacion | 2.5 pts | Alta | Bajo/medio |
| Calidad de codigo y buenas practicas | 2.5 pts | Media | Medio |
| Despliegue en la nube | 2 pts | Pendiente | Alto |
| Documentacion tecnica y manuales | 2 pts | Mejorada | Bajo/medio |
| Sustentacion y dominio tecnico | 3 pts | Parcial alta | Medio |

Estimacion antes de despliegue cloud: 14/20 a 16/20.

Estimacion con despliegue operativo y evidencia de pruebas: 17/20 a 19/20.

## 1. Integracion Front-end y Back-end

Estandar esperado:

- Integracion completa y estable con Spring Boot.

Evidencia actual:

- Frontend usa `VITE_API_URL`.
- Servicio central `frontend/src/services/api.js` conecta con backend.
- Backend expone API bajo `/api`.
- Login probado localmente con `admin/admin123`.
- Frontend local: `http://127.0.0.1:5173`.
- Backend local: `http://localhost:8081/api`.

Pendientes:

- Ejecutar prueba manual modulo por modulo con backend levantado.
- Registrar capturas o checklist firmado.
- Asegurar que la rama backend con JWT/permisos quede integrada antes de presentar.

Estado:

- Cumple parcialmente alto.

## 2. Funcionalidad integral del sistema

Estandar esperado:

- Todos los modulos funcionan correctamente segun requerimientos.

Modulos a probar:

- Login.
- Dashboard general.
- Resumen inventario.
- Resumen ventas.
- Resumen clientes.
- Resumen proveedores.
- Resumen pedidos.
- Resumen empleados.
- Usuarios y roles.
- Ventas POS.
- Historial de ventas.
- Cotizaciones.
- Pedidos.
- Despachos.
- Devoluciones.
- Garantias.
- Catalogo inventario.
- Stock en vivo.
- Movimientos.
- Alertas.
- Mermas.
- Kardex.
- Clientes.
- Proveedores.
- Ordenes de compra.
- Empleados.
- Asistencia.
- Boletas.

Pendientes:

- Validar flujo CRUD de clientes/proveedores/inventario.
- Validar venta o pedido desde POS.
- Validar permisos con usuario no ADMIN.
- Validar responsive en escritorio, tablet y movil.

Estado:

- Cumple parcialmente alto, falta evidencia formal de pruebas.

## 3. Seguridad y autenticacion

Estandar esperado:

- Seguridad implementada correctamente con JWT y control de roles.

Evidencia actual:

- `JwtAuthenticationFilter`.
- `JwtService`.
- `SecurityConfig` protege `/api/**`.
- `POST /api/auth/login`.
- `GET /api/auth/me`.
- Frontend adjunta `Authorization: Bearer <token>`.
- Rutas frontend se protegen con permisos en `ROUTE_PERMISSIONS`.
- Panel de permisos por submodulo.

Pendientes:

- Confirmar que los cambios backend de seguridad esten en rama/commit correcto.
- Probar usuario sin permisos.
- Cambiar `JWT_SECRET` en despliegue.

Estado:

- Cumple alto, con pendiente de integracion Git y prueba de roles.

## 4. Calidad de codigo y buenas practicas

Estandar esperado:

- Codigo limpio, modular y siguiendo buenas practicas.

Evidencia actual:

- Frontend centraliza API en `services/api.js`.
- Validaciones centralizadas en `services/validators.js`.
- Componentes reutilizables: `Header`, `Sidebar`, `SummaryControls`, `AnimatedKpiValue`, `FieldValidationHint`.
- Backend sigue capas controller/service/repository/model/dto.
- Build frontend pasa.
- Compile backend pasa.

Riesgos:

- `npm run lint` completo reporta errores heredados en varios modulos.
- Hay cambios backend sin commitear en el workspace actual.
- Evitar mezclar cambios backend en ramas frontend.

Pendientes:

- Corregir lint o documentar excepciones.
- Limpiar archivos temporales no versionables si se va a entregar repo.

Estado:

- Cumple parcialmente, requiere limpieza para nota maxima.

## 5. Despliegue en la nube

Estandar esperado:

- Frontend y backend desplegados correctamente y operativos.

Evidencia actual:

- `frontend/vercel.json` preparado.
- Backend usa variables `PORT`, `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.
- CORS configurable por `CORS_ALLOWED_ORIGINS`.

Pendientes criticos:

- Desplegar frontend en Vercel.
- Desplegar backend en Render/Railway/Fly.io/VPS.
- Configurar PostgreSQL cloud.
- Configurar variables de entorno productivas.
- Probar login contra URL cloud.
- Documentar URLs finales.

Estado:

- Pendiente. Es el bloque que mas puntos puede hacer perder si no se completa.

## 6. Documentacion tecnica y manuales

Estandar esperado:

- Presenta documentacion tecnica, README y manuales completos.

Evidencia actual:

- README principal actualizado.
- `docs/CONSULTA_CLIENTES_DNI_RUC.md`.
- `docs/PASARELAS_PAGO_PRODUCCION.md`.
- Este checklist de rubrica.

Pendientes:

- Manual de usuario por rol.
- Guia de despliegue con URLs reales.
- Capturas o anexos de pruebas.

Estado:

- Mejorado, pero aun puede reforzarse.

## 7. Sustentacion y dominio tecnico

Estandar esperado:

- Explica claramente arquitectura, tecnologias y decisiones tecnicas.

Puntos para sustentar:

- React/Vite como SPA.
- Spring Boot como API REST.
- PostgreSQL como persistencia relacional.
- JWT para sesion stateless.
- Control de permisos por modulo/submodulo.
- Validaciones centralizadas.
- Responsive global para dashboards, tablas, modales y sidebar.
- Separacion por capas en backend.
- Variables de entorno para despliegue.

Pendientes:

- Preparar guion de 5 a 7 minutos.
- Preparar diagrama simple de arquitectura.
- Tener demo con usuario ADMIN y usuario limitado.

Estado:

- Parcial alto. Falta material final de exposicion.

## Checklist final antes de presentar

- [ ] Rama frontend final creada y subida.
- [ ] Rama backend/integracion con JWT y permisos revisada.
- [ ] Backend compila.
- [ ] Frontend build pasa.
- [ ] Login ADMIN funciona.
- [ ] Usuario limitado bloquea rutas sin permiso.
- [ ] CRUD clientes funciona.
- [ ] CRUD proveedores funciona.
- [ ] Inventario funciona.
- [ ] POS registra flujo principal.
- [ ] Dashboard muestra datos.
- [ ] Responsive revisado en movil.
- [ ] Frontend desplegado.
- [ ] Backend desplegado.
- [ ] PostgreSQL cloud conectado.
- [ ] README con URLs finales.
- [ ] Manual de usuario listo.
- [ ] Capturas o video de evidencia listo.
