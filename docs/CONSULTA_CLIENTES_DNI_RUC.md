# Consulta automatica de clientes por DNI/RUC

## Objetivo

Permitir que el cajero escriba DNI o RUC en el carrito POS y el sistema cargue los datos del cliente automaticamente.

El carrito se mantiene compacto. La ficha completa del cliente se muestra en el modal de resumen/pago antes de finalizar venta, pedido o despacho.

## Flujo recomendado

```text
Carrito POS
-> Cajero escribe DNI/RUC
-> Backend busca en customers
-> DNI no existente: consulta APIDNI
-> RUC no existente: consulta tabla local sunat_ruc_records
-> Si obtiene datos validos, guarda cliente
-> Frontend muestra datos en modal resumen/pago
-> Cajero confirma pago/despacho
```

## Endpoint interno

```http
GET /api/customer-lookup/{document}
```

Reglas:

- 8 digitos: DNI.
- 11 digitos: RUC.
- Primero consulta base local.
- Si DNI no existe y la consulta externa esta habilitada, consume APIDNI.
- Si RUC no existe, consulta `sunat_ruc_records`.
- Si obtiene datos validos, crea el cliente en `customers`.

Respuesta ejemplo:

```json
{
  "id": "uuid",
  "name": "CLIENTE O RAZON SOCIAL",
  "docType": "DNI",
  "docNumber": "12345678",
  "phone": "",
  "email": "",
  "address": "",
  "preferredDiscount": 0,
  "status": "VALIDADO",
  "condition": "HABIDO",
  "source": "LOCAL_DB",
  "created": false
}
```

## Configuracion

DNI decidido para produccion:

```text
APIDNI
```

Motivo:

- Para DNI puede devolver nombres, apellidos, fecha de nacimiento, genero, direccion, ubigeo, distrito, provincia y departamento segun plan.

## RUC con fuente SUNAT

Para RUC, la fuente de negocio debe considerarse SUNAT.

Existen dos formas correctas:

### SUNAT directo con Padron Reducido

SUNAT publica el Padron Reducido del RUC para descarga. Contiene:

- RUC.
- Nombre o razon social.
- Estado del contribuyente.
- Condicion de domicilio.
- Ubigeo.
- Domicilio fiscal.
- Direccion de local anexo por RUC.

Este camino no es una consulta REST simple para el POS. Se debe implementar como sincronizacion:

```text
Descarga Padron SUNAT -> importar a tabla local -> POS consulta tabla local
```

Uso recomendado:

- Conciliacion masiva.
- Validacion local rapida.
- Respaldo cuando el proveedor API no responda.

Decision actual de produccion:

```text
DNI: APIDNI API
RUC: SUNAT Padron Reducido en tabla local sunat_ruc_records
```

En `backend/src/main/resources/application.properties`:

```properties
customer.lookup.enabled=${CUSTOMER_LOOKUP_ENABLED:true}
customer.lookup.provider=${CUSTOMER_LOOKUP_PROVIDER:APIDNI}
customer.lookup.token=${CUSTOMER_LOOKUP_TOKEN:}
customer.lookup.dni-url=${CUSTOMER_LOOKUP_DNI_URL:https://apidni.com/api/v2/dni/{document}}
customer.lookup.ruc-url=
```

Variables reales para activar produccion:

```env
CUSTOMER_LOOKUP_ENABLED=true
CUSTOMER_LOOKUP_PROVIDER=APIDNI
CUSTOMER_LOOKUP_TOKEN=TU_TOKEN_REAL_DE_APIDNI
```

Las claves deben quedarse siempre en backend. Nunca se colocan en React.

## Modo produccion sin simulacion

El POS no debe inventar nombres como `CLIENTE CONSULTADO`. El comportamiento correcto es:

- Si el documento existe en `customers`, se usa ese cliente.
- Si DNI no existe, se consulta APIDNI.
- Si RUC no existe, se consulta `sunat_ruc_records`.
- Si obtiene datos validos, se guarda el cliente y se muestra en el modal de resumen.
- Si DNI no tiene token o RUC no esta importado en padron local, no se crea cliente falso; se muestra error y se bloquea la validacion automatica.

Variables de entorno sugeridas:

```env
CUSTOMER_LOOKUP_ENABLED=true
CUSTOMER_LOOKUP_PROVIDER=APIDNI
CUSTOMER_LOOKUP_TOKEN=token_real
CUSTOMER_LOOKUP_DNI_URL=https://apidni.com/api/v2/dni/{document}
```

## Carga inicial RUC SUNAT

El sistema soporta importar el Padron Reducido SUNAT oficial a la tabla local `sunat_ruc_records`.

Fuente oficial SUNAT:

```text
https://www.sunat.gob.pe/descargaPRR/mrc137_padron_reducido.html
```

Archivo configurado:

```properties
sunat.ruc.padron-url=${SUNAT_RUC_PADRON_URL:https://www2.sunat.gob.pe/padron_reducido_ruc.zip}
```

### Importar desde SUNAT

```http
POST /api/sunat-ruc-records/import/sunat
```

Para prueba limitada:

```http
POST /api/sunat-ruc-records/import/sunat?limit=1000
```

Para produccion completa:

```http
POST /api/sunat-ruc-records/import/sunat
```

Nota: el padron completo pesa bastante y contiene millones de registros. Ejecutar la importacion completa fuera de hora punta.

### Importar desde archivo local

Acepta `.zip` o `.txt` del Padron Reducido:

```http
POST /api/sunat-ruc-records/import/local?path=C:\rutas\padron_reducido_ruc.zip
```

Para prueba limitada:

```http
POST /api/sunat-ruc-records/import/local?path=C:\rutas\padron_reducido_ruc.zip&limit=1000
```

### Registrar un RUC puntual

Tambien se puede registrar un RUC oficial localmente:

```http
POST /api/sunat-ruc-records
```

Payload:

```json
{
  "ruc": "20331061655",
  "businessName": "AJEPER S.A.",
  "taxpayerStatus": "ACTIVO",
  "domicileCondition": "HABIDO",
  "ubigeo": "150118",
  "fiscalAddress": "AV. LA PAZ NRO. 131 SANTA MARIA DE HUACHIPA"
}
```

Luego el POS puede validar ese RUC usando:

```http
GET /api/customer-lookup/20331061655
```

## Campos soportados desde proveedor

El backend normaliza varios nombres comunes de respuesta:

DNI:

- `nombreCompleto`
- `nombre_completo`
- `nombre`
- `nombres`
- `apellidoPaterno`
- `apellidoMaterno`
- `apellido_paterno`
- `apellido_materno`

RUC:

- `razonSocial`
- `razon_social`
- `nombre_o_razon_social`
- `nombre`
- `direccion`
- `direccionFiscal`
- `domicilio_fiscal`

## Produccion

Recomendado:

- Buscar siempre primero en base local.
- Consultar proveedor solo si no existe el cliente.
- Guardar auditoria de consultas cuando se agregue autenticacion por cajero.
- No usar scraping como base productiva.
- Revisar contrato, disponibilidad y tratamiento de datos personales del proveedor.
