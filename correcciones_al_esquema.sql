-- Database: ferremas_db

-- Situación 1:
-- correción de error detectado en Spring Boot: Schema-validation: missing column [image_url] in table [products]
-- la tabla products no tiene el atributo image_url, se puede crear:
alter table products add column image_url VARCHAR(500);

