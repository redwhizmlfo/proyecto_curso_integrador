-- Agregar columna faltante:
alter table if exists sales
add column payment_bank_account_alias VARCHAR(120);

-- Agregar columna faltante:
alter table if exists sales
add column payment_bank_account_number VARCHAR(80);

-- Agregar columna faltante:
alter table if exists sales
add column payment_status VARCHAR(32);

-- Agregar columna faltante:
alter table if exists sales
add column payment_reference VARCHAR(120);

-- Agregar columna faltante:
alter table if exists sales
add column payment_evidence_name VARCHAR(220);

-- Agregar columna faltante:
alter table if exists sales
add column payment_bank_name VARCHAR(220);



-- Revertir columna agregada:
-- alter table sales
-- drop column payment_bank_account_alias;

-- Revertir columna agregada:
-- alter table sales
-- drop column payment_bank_account_number;

-- Revertir columna agregada:
-- alter table sales
-- drop column payment_status;

-- Revertir columna agregada:
-- alter table sales
-- drop column payment_evidence_name;

-- Revertir columna agregada:
-- alter table sales
-- drop column payment_bank_name;