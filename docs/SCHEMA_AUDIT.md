# Auditoria de esquema SQL

Fecha: 2026-07-16

## Objetivo

Verificar que `esquema.sql` este alineado con las entidades JPA del backend y con los datos que consume el frontend antes del despliegue.

## Hallazgos corregidos

- Se elimino un bloque duplicado/corrupto de `esquema.sql` que dejaba columnas de `employee_slips` sueltas sin `CREATE TABLE`.
- Se agregaron a `sales` las columnas usadas por `Sale.java` para pagos:
  - `payment_status`
  - `payment_reference`
  - `payment_evidence_name`
  - `payment_bank_name`
  - `payment_bank_account_alias`
  - `payment_bank_account_number`
- Se agregaron migraciones idempotentes `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` para bases ya existentes.
- Se alineo `employee_attendance.status` con Java para aceptar `permiso`.
- Se actualizo la consistencia de eventos de asistencia para permitir `permiso` sin entrada ni salida.
- Se corrigio el seed del usuario `admin` para usar rol `ADMIN`.
- Se limpiaron textos de seed con caracteres danados.

## Validacion realizada

- `esquema.sql` ejecutado completo en PostgreSQL 16 temporal con `ON_ERROR_STOP=1`.
- Backend compila con `mvn -q -DskipTests compile`.
- Comparacion de tablas:
  - Entidades JPA con `@Table`: 22.
  - Tablas SQL: 23.
  - Faltantes en SQL: ninguna.
  - Tabla extra esperada: `user_module_permissions`, creada por `@ElementCollection` de `User`.

## Pendiente antes de produccion

- En cloud, ejecutar `esquema.sql` sobre la base PostgreSQL vacia antes de apuntar el backend.
- Si se usa `DDL_AUTO=update`, dejarlo solo para primera inicializacion; luego evaluar `validate` o migraciones versionadas.
- Configurar `JWT_SECRET`, `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD` y `CORS_ALLOWED_ORIGINS` en el proveedor cloud.
