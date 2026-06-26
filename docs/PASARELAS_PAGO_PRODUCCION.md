# Plan de integracion de pasarelas de pago para produccion

Este documento define la ruta para llevar el carrito de compras, pagos y generacion de pedidos/ventas a un flujo de produccion. La regla central es:

**Ningun pedido o venta se debe generar como pagado si el backend no recibio confirmacion valida del proveedor de pago o autorizacion interna controlada.**

## 1. Objetivo del flujo

El flujo final debe ser:

1. El usuario arma el carrito en POS.
2. El frontend envia el carrito al backend para crear una intencion de pago.
3. El backend calcula el total final, valida stock y crea un registro `PaymentIntent` interno.
4. El backend inicializa la pasarela elegida: Izipay, Culqi, Openpay, Mercado Pago, PayU, etc.
5. El cliente paga.
6. La pasarela confirma el resultado por API de retorno y/o webhook.
7. El backend marca el pago como `APPROVED`, `REJECTED`, `EXPIRED` o `PENDING`.
8. Solo si el pago esta `APPROVED`, el backend crea la venta o pedido.
9. Al crear venta/pedido pagado, se descuenta stock y se registra movimiento.
10. Se imprime ticket y queda disponible en historial.

## 2. Estados recomendados

### PaymentIntent

Estados:

- `CREATED`: se genero la intencion, aun no enviada a pasarela.
- `PENDING`: enviada a pasarela, esperando pago.
- `APPROVED`: pago confirmado.
- `REJECTED`: pago rechazado.
- `EXPIRED`: el cliente no pago dentro del tiempo definido.
- `CANCELLED`: anulada por usuario o caja.
- `MANUAL_REVIEW`: requiere revision manual, por ejemplo constancia dudosa.

### Pedido

Estados:

- `PAGADO_PENDIENTE_DESPACHO`
- `EN_PREPARACION`
- `DESPACHADO`
- `ENTREGADO`
- `CANCELADO`

### Venta

Estados:

- `PAGADA`
- `ANULADA`
- `DEVUELTA_PARCIAL`
- `DEVUELTA_TOTAL`

## 3. Modelo backend recomendado

Crear entidades separadas para no mezclar pagos con ventas.

### Tabla `payment_intents`

Campos recomendados:

- `id`
- `provider`: `IZIPAY`, `CULQI`, `OPENPAY`, `MERCADO_PAGO`, `PAYU`, `EFECTIVO`, `TRANSFERENCIA`, `YAPE`, `PLIN`, `OFFLINE_KEY`
- `operation_type`: `VENTA_DIRECTA`, `PEDIDO`
- `status`
- `amount`
- `currency`: `PEN`
- `customer_id`
- `created_by_user_id`
- `external_payment_id`
- `external_order_id`
- `external_session_token`
- `payment_reference`
- `evidence_file_url`
- `raw_provider_response`
- `expires_at`
- `approved_at`
- `created_at`
- `updated_at`

### Tabla `payment_intent_items`

Campos recomendados:

- `id`
- `payment_intent_id`
- `product_id`
- `name_snapshot`
- `barcode_snapshot`
- `qty`
- `unit_price`
- `line_total`

### Relacion con ventas/pedidos

En `sales` agregar:

- `payment_intent_id`
- `payment_status`
- `payment_provider`
- `payment_reference`

Para pedidos de venta, si se crea tabla propia, agregar lo mismo.

## 4. Endpoints backend recomendados

### Crear intencion de pago

`POST /api/payments/intents`

Body:

```json
{
  "operationType": "PEDIDO",
  "provider": "IZIPAY",
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "qty": 2
    }
  ]
}
```

El backend debe:

- Recalcular precios desde base de datos.
- Validar stock disponible.
- Aplicar descuentos autorizados.
- Calcular IGV y total.
- Crear `PaymentIntent`.
- Inicializar la pasarela si aplica.
- Devolver datos seguros al frontend.

Respuesta:

```json
{
  "intentId": "uuid",
  "provider": "IZIPAY",
  "status": "PENDING",
  "amount": 615.00,
  "currency": "PEN",
  "checkoutData": {
    "sessionToken": "token_seguro_si_aplica",
    "publicKey": "pk_publica_si_aplica"
  }
}
```

### Confirmar pago desde frontend

`POST /api/payments/intents/{id}/confirm`

Solo debe usarse para proveedores sin webhook inmediato o metodos manuales. Para pasarelas reales, el backend debe consultar a la pasarela antes de aprobar.

### Webhook por proveedor

Endpoints:

- `POST /api/payments/webhooks/izipay`
- `POST /api/payments/webhooks/culqi`
- `POST /api/payments/webhooks/openpay`
- `POST /api/payments/webhooks/mercadopago`
- `POST /api/payments/webhooks/payu`

Cada webhook debe:

- Validar firma/token/secreto del proveedor.
- Buscar `PaymentIntent` por referencia externa.
- Consultar al proveedor si es necesario.
- Actualizar estado.
- Si queda `APPROVED`, ejecutar creacion de venta/pedido en una transaccion.
- Guardar payload completo en log/auditoria.
- Responder rapido `200 OK`.

## 5. Flujo frontend recomendado

El React POS no debe calcular la aprobacion final.

Responsabilidades del frontend:

- Mostrar carrito.
- Permitir seleccionar metodo/proveedor.
- Enviar carrito al backend.
- Abrir checkout/token de pasarela cuando corresponda.
- Mostrar estados: pendiente, aprobado, rechazado.
- Subir constancias para transferencia/Yape/Plin si el metodo sera manual.
- Nunca guardar una venta pagada directamente en `localStorage` en produccion.

Responsabilidades del backend:

- Calcular totales finales.
- Inicializar pasarelas.
- Guardar PaymentIntent.
- Confirmar pagos.
- Descontar stock.
- Generar venta/pedido.

## 6. Pasarelas recomendadas

### Izipay

Uso recomendado:

- Tarjeta online con Izipay Checkout.
- POS/terminal si Izipay ofrece mecanismo de integracion para tu equipo.

Puntos clave:

- El script de checkout puede cargarse en frontend.
- La creacion del token de sesion debe hacerse desde backend.
- Las credenciales privadas nunca van en React.
- Guardar `transactionId`, `authorizationCode`, `orderNumber` o el identificador equivalente que devuelva Izipay.

Variables:

```env
IZIPAY_ENV=sandbox
IZIPAY_PUBLIC_KEY=
IZIPAY_USERNAME=
IZIPAY_PASSWORD=
IZIPAY_HMACSHA256_KEY=
IZIPAY_WEBHOOK_SECRET=
```

Flujo:

1. Backend crea `PaymentIntent`.
2. Backend solicita token/sesion a Izipay.
3. Frontend abre checkout Izipay.
4. Izipay procesa pago.
5. Backend recibe notificacion o consulta estado.
6. Backend aprueba y genera pedido/venta.

Referencia oficial:

- https://developers.izipay.pe/
- https://developers.izipay.pe/web-core/quickstart/
- https://developers.izipay.pe/api/

### Culqi

Uso recomendado:

- Tarjetas online.
- Yape mediante integracion oficial si esta habilitada para tu comercio.
- Ordenes de pago para flujos asincronos.

Puntos clave:

- Culqi usa llaves publicas y privadas.
- La llave privada debe estar solo en backend.
- Para ordenes/billeteras se debe usar webhook para confirmar estado.
- Culqi documenta webhooks para cambios de estado como pagos realizados.

Variables:

```env
CULQI_ENV=test
CULQI_PUBLIC_KEY=
CULQI_PRIVATE_KEY=
CULQI_WEBHOOK_SECRET=
```

Flujo tarjeta:

1. Frontend tokeniza tarjeta con llave publica o checkout.
2. Backend recibe token temporal.
3. Backend crea cargo con llave privada.
4. Backend confirma resultado.
5. Si aprobado, genera venta/pedido.

Flujo orden/billetera:

1. Backend crea orden.
2. Frontend muestra checkout/medio de pago.
3. Culqi notifica por webhook.
4. Backend confirma y genera venta/pedido.

Referencias oficiales:

- https://docs.culqi.com/
- https://docs.culqi.com/es/documentacion/pagos-online/
- https://docs.culqi.com/es/documentacion/pagos-online/llaves
- https://docs.culqi.com/es/documentacion/pagos-online/ordenes-de-pago/resumen/
- https://docs.culqi.com/es/documentacion/pagos-online/webhooks

### Openpay Peru

Uso recomendado:

- Tarjetas.
- Pagos alternativos.
- Yape si el producto esta habilitado para tu comercio.

Puntos clave:

- Tiene API sandbox y produccion.
- Openpay.js sirve para tokenizar en navegador.
- La confirmacion y cargos deben controlarse desde backend.
- Revisar notificaciones para estados asincronos.

Variables:

```env
OPENPAY_ENV=sandbox
OPENPAY_MERCHANT_ID=
OPENPAY_PRIVATE_KEY=
OPENPAY_PUBLIC_KEY=
OPENPAY_WEBHOOK_SECRET=
```

Referencias oficiales:

- https://www.openpay.pe/documentacion
- https://documents.openpay.pe/api-v2/
- https://www.openpay.pe/metodos-de-pago/pagos-alternativos

### Mercado Pago

Uso recomendado:

- Checkout Pro cuando se quiere redirigir al usuario a Mercado Pago.
- Checkout API/Payments cuando se requiere mayor control.

Puntos clave:

- El backend debe crear preferencia o pago.
- El frontend solo redirige o renderiza checkout.
- Confirmar pago consultando API y/o webhook.
- Guardar `payment_id`, `merchant_order_id`, estado y detalle.

Variables:

```env
MERCADOPAGO_ENV=sandbox
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=
```

Referencia oficial:

- https://www.mercadopago.com.pe/developers/es/docs
- https://docs02.mercadopago.com.pe/developers/es/reference/online-payments/checkout-pro/get-payment/get

### PayU Latam

Uso recomendado:

- Tarjetas y metodos alternativos soportados por pais.
- Empresas que quieren API transaccional directa.

Puntos clave:

- PayU recomienda conexion HTTPS/TLS y no almacenar datos sensibles de tarjeta.
- Puede trabajar con flujo de un paso o dos pasos.
- Backend debe procesar autorizacion/captura y confirmaciones.

Variables:

```env
PAYU_ENV=test
PAYU_API_KEY=
PAYU_API_LOGIN=
PAYU_MERCHANT_ID=
PAYU_ACCOUNT_ID=
PAYU_WEBHOOK_SECRET=
```

Referencias oficiales:

- https://developers.payulatam.com/latam/es/docs/services/payments.html
- https://developers.payulatam.com/latam/en/docs/integrations/api-integration.html

### Niubiz

Uso recomendado:

- Tarjetas online y POS si el contrato/equipo soporta integracion.

Puntos clave:

- Verificar la documentacion y credenciales oficiales entregadas por Niubiz al comercio.
- Implementar el mismo contrato interno `PaymentProvider`.
- Confirmar pagos solo por respuesta oficial/API/webhook.

Variables:

```env
NIUBIZ_ENV=test
NIUBIZ_MERCHANT_ID=
NIUBIZ_USER=
NIUBIZ_PASSWORD=
NIUBIZ_WEBHOOK_SECRET=
```

Flujo recomendado:

1. Backend crea `PaymentIntent` con proveedor `NIUBIZ`.
2. Backend genera sesion/token de seguridad con credenciales Niubiz.
3. Frontend abre checkout/formulario o usa terminal/POS autorizado.
4. Niubiz procesa autorizacion.
5. Backend confirma estado con respuesta oficial, API o webhook.
6. Si esta `APPROVED`, se genera pedido/venta y se descuenta stock.

Datos a guardar:

- `transactionId`
- `authorizationCode`
- `purchaseNumber`
- `actionCode`
- `cardBrand`
- `maskedCard`
- `amount`
- `currency`
- payload completo para auditoria

## 7. Metodos manuales o semi-manuales

### Efectivo

Puede aprobarse en caja, pero debe registrar:

- Usuario cajero.
- Monto recibido.
- Vuelto.
- Hora de confirmacion.

### Transferencia bancaria

Para produccion hay dos niveles:

1. Manual controlado:
   - Cliente sube constancia.
   - Cajero valida en banca empresarial.
   - Se aprueba con usuario responsable.

2. Automatizado:
   - Banco/API o conciliacion bancaria.
   - Webhook/archivo de movimientos.
   - Backend compara monto, referencia y fecha.

### Yape / Plin

Para produccion:

- Usar API/producto oficial si esta disponible por el proveedor contratado.
- Si no hay API oficial para tu cuenta, manejarlo como manual controlado con constancia y validacion en app/cuenta.
- Evitar aprobar automaticamente solo por imagen.

## 8. Configuracion lista para Yape / Plin con QR y notificaciones

Esta configuracion sirve para dejar preparado el sistema con tus numeros receptores, QR de cobro, reglas de validacion y notificacion. Los numeros de abajo son ejemplos y deben reemplazarse por los datos reales del negocio.

### Variables de entorno sugeridas

```env
# Yape
YAPE_ENABLED=true
YAPE_MODE=manual_controlled
YAPE_OWNER_NAME=MEPS GROUP PERU
YAPE_RECEIVER_PHONE=999888777
YAPE_QR_IMAGE_URL=/uploads/payments/qr/yape-meps.png
YAPE_MIN_REFERENCE_LENGTH=4
YAPE_REQUIRE_EVIDENCE=true
YAPE_NOTIFY_CHANNEL=whatsapp
YAPE_NOTIFY_PHONE=999888777

# Plin
PLIN_ENABLED=true
PLIN_MODE=manual_controlled
PLIN_OWNER_NAME=MEPS GROUP PERU
PLIN_RECEIVER_PHONE=988777666
PLIN_QR_IMAGE_URL=/uploads/payments/qr/plin-meps.png
PLIN_MIN_REFERENCE_LENGTH=4
PLIN_REQUIRE_EVIDENCE=true
PLIN_NOTIFY_CHANNEL=whatsapp
PLIN_NOTIFY_PHONE=988777666

# Notificaciones internas
PAYMENT_NOTIFY_ADMIN_PHONE=977666555
PAYMENT_NOTIFY_EMAIL=caja@mepsgroup.pe
PAYMENT_MANUAL_REVIEW_REQUIRED=true
```

### Configuracion en base de datos recomendada

Tabla `payment_methods_config`:

```text
id
provider              YAPE | PLIN
enabled               true | false
mode                  manual_controlled | api | webhook
owner_name
receiver_phone
qr_image_url
require_evidence
notify_channel        whatsapp | sms | email | internal
notify_phone
webhook_url
created_at
updated_at
```

Ejemplo:

```json
[
  {
    "provider": "YAPE",
    "enabled": true,
    "mode": "manual_controlled",
    "ownerName": "MEPS GROUP PERU",
    "receiverPhone": "999888777",
    "qrImageUrl": "/uploads/payments/qr/yape-meps.png",
    "requireEvidence": true,
    "notifyChannel": "whatsapp",
    "notifyPhone": "999888777"
  },
  {
    "provider": "PLIN",
    "enabled": true,
    "mode": "manual_controlled",
    "ownerName": "MEPS GROUP PERU",
    "receiverPhone": "988777666",
    "qrImageUrl": "/uploads/payments/qr/plin-meps.png",
    "requireEvidence": true,
    "notifyChannel": "whatsapp",
    "notifyPhone": "988777666"
  }
]
```

### Flujo del QR en POS

Cuando el cajero seleccione Yape o Plin:

1. El backend crea un `PaymentIntent` en estado `PENDING`.
2. El frontend muestra:
   - Monto exacto.
   - QR configurado.
   - Numero receptor.
   - Nombre del titular.
   - Campo numero de operacion.
   - Carga de constancia.
3. El cliente yapea o plinea el monto.
4. El sistema registra el comprobante y referencia.
5. Se notifica a caja/admin que hay pago pendiente de validar.
6. Caja valida en la app o por API oficial.
7. Solo si se confirma el ingreso, el backend cambia a `APPROVED`.
8. Recién ahi se genera pedido/venta.

### Regla de aprobacion

No aprobar automaticamente solo porque el usuario subio una imagen.

Validacion minima:

- Monto exacto coincide con el total.
- Referencia u operacion existe.
- Fecha/hora corresponde a la venta.
- Titular o numero coincide si el proveedor lo informa.
- Cajero/admin confirma recepcion.

Estados para Yape/Plin:

- `PENDING_CUSTOMER_PAYMENT`: se mostro QR, esperando pago.
- `PENDING_REVIEW`: cliente subio constancia o referencia.
- `APPROVED`: caja/API confirma pago.
- `REJECTED`: no se encontro pago o monto incorrecto.
- `EXPIRED`: no pago dentro del tiempo limite.

### Notificaciones

El sistema debe notificar por dos vias:

1. Notificacion interna en el sistema:
   - campana de caja
   - panel de pagos pendientes
   - badge en POS

2. Notificacion externa:
   - WhatsApp Business API
   - SMS provider
   - email

Ejemplo de mensaje:

```text
Pago Yape pendiente de validar
Pedido: PED-104582
Monto: S/ 615.00
Cliente: CONSTRUCTORA DEL NORTE S.A.C.
Operacion: OP-928173
Receptor: 999888777
```

### Importante sobre notificacion por numero celular

El sistema no puede leer de forma segura y estable las notificaciones de la app Yape/Plin de un celular personal, salvo que exista una integracion oficial o un proveedor autorizado que envie webhook/API. Leer notificaciones del telefono con una app puente no es recomendable para produccion porque:

- puede romperse por cambios de Android/iOS;
- puede exponer datos sensibles;
- no es una confirmacion bancaria oficial;
- puede generar falsos positivos.

Para produccion, las opciones correctas son:

1. **API/webhook oficial o proveedor autorizado:** el backend recibe la confirmacion real.
2. **Validacion manual controlada:** el cajero confirma en el sistema luego de revisar la app/cuenta.
3. **Conciliacion bancaria:** importar movimientos y cruzar monto/referencia.

### Endpoint recomendado para subir constancia

`POST /api/payments/intents/{id}/evidence`

Body multipart:

```text
file: constancia.jpg
reference: OP-928173
senderPhone: 955444333
```

Respuesta:

```json
{
  "intentId": "uuid",
  "status": "PENDING_REVIEW",
  "message": "Constancia recibida. Caja debe validar el pago."
}
```

### Endpoint recomendado para aprobacion de caja

`POST /api/payments/intents/{id}/manual-approve`

Body:

```json
{
  "approvedByUserId": "uuid",
  "reference": "OP-928173",
  "note": "Pago verificado en app Yape del numero 999888777"
}
```

Respuesta:

```json
{
  "intentId": "uuid",
  "status": "APPROVED",
  "approvedAt": "2026-05-24T10:30:00-05:00"
}
```

## 9. Transferencias bancarias en vivo y configuracion multi-cuenta

La transferencia bancaria debe funcionar como una compuerta de pago igual que tarjeta, Izipay, Culqi, Yape o Plin. Primero se confirma el pago y recien despues se crea pedido/venta.

### Objetivo

Permitir que el comercio configure una o varias cuentas bancarias receptoras y que el POS pueda mostrar al cliente la cuenta elegida para transferir. Luego el backend debe validar en vivo o por conciliacion que el dinero entro.

### Variables de entorno sugeridas

```env
BANK_TRANSFER_ENABLED=true
BANK_TRANSFER_MODE=api_or_manual_review
BANK_TRANSFER_DEFAULT_EXPIRATION_MINUTES=20
BANK_TRANSFER_REQUIRE_EVIDENCE=true
BANK_TRANSFER_NOTIFY_CHANNEL=internal,whatsapp,email
BANK_TRANSFER_NOTIFY_ADMIN_PHONE=977666555
BANK_TRANSFER_NOTIFY_EMAIL=caja@mepsgroup.pe
```

### Tabla `bank_accounts`

Crear una tabla configurable para cuentas receptoras:

```text
id
bank_name
account_alias
account_holder_name
account_number
cci
currency
document_type
document_number
enabled
supports_api
provider_code
created_at
updated_at
```

Ejemplo:

```json
[
  {
    "bankName": "BCP",
    "accountAlias": "Cuenta soles BCP",
    "accountHolderName": "MEPS GROUP PERU S.A.C.",
    "accountNumber": "191-12345678-0-00",
    "cci": "00219100123456780000",
    "currency": "PEN",
    "documentType": "RUC",
    "documentNumber": "20601234567",
    "enabled": true,
    "supportsApi": true,
    "providerCode": "BCP_API"
  },
  {
    "bankName": "INTERBANK",
    "accountAlias": "Cuenta ventas Interbank",
    "accountHolderName": "MEPS GROUP PERU S.A.C.",
    "accountNumber": "200-300400500600",
    "cci": "00320030040050060000",
    "currency": "PEN",
    "documentType": "RUC",
    "documentNumber": "20601234567",
    "enabled": true,
    "supportsApi": false,
    "providerCode": "MANUAL"
  }
]
```

### Flujo POS para transferencia

1. Cajero selecciona `Transferencia Bancaria`.
2. POS solicita al backend cuentas activas: `GET /api/payment-config/bank-accounts?currency=PEN`.
3. Cajero o cliente elige una cuenta receptora.
4. Backend crea `PaymentIntent` con monto exacto, cuenta receptora, referencia unica y expiracion.
5. Frontend muestra banco, titular, cuenta, CCI, monto exacto y referencia.
6. Cliente transfiere.
7. Sistema confirma por API bancaria, webhook, polling de movimientos o validacion manual controlada.
8. Si confirma monto y referencia, cambia a `APPROVED`.
9. Backend crea pedido/venta y descuenta stock.

### Referencia unica por transferencia

Cada intento debe generar una referencia unica, por ejemplo:

```text
TRF-20260524-000184
```

El cliente debe colocar esa referencia en glosa/descripcion cuando el banco lo permita. Si no se puede, se cruza por monto exacto, hora, cuenta destino, constancia y usuario que valida.

### Endpoints recomendados

- `GET /api/payment-config/bank-accounts`
- `POST /api/payment-config/bank-accounts`
- `POST /api/payments/intents`
- `GET /api/payments/intents/{id}`
- `POST /api/payments/intents/{id}/evidence`
- `POST /api/payments/intents/{id}/manual-approve`
- `POST /api/payments/intents/{id}/reject`

Crear intencion de transferencia:

```json
{
  "provider": "BANK_TRANSFER",
  "operationType": "PEDIDO",
  "customerId": "uuid",
  "bankAccountId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "qty": 1
    }
  ]
}
```

### Notificacion en vivo

Para notificar en vivo dentro del POS:

- WebSocket: `/ws/payments`
- Server-Sent Events: `/api/payments/events`
- Polling cada 3 a 5 segundos como primera version

Evento ejemplo:

```json
{
  "type": "PAYMENT_APPROVED",
  "intentId": "uuid",
  "provider": "BANK_TRANSFER",
  "amount": 615.00,
  "reference": "TRF-20260524-000184",
  "message": "Transferencia confirmada"
}
```

El POS debe reaccionar:

- `PENDING`: esperando pago.
- `PENDING_REVIEW`: revisar constancia.
- `APPROVED`: generar pedido/venta.
- `REJECTED`: bloquear compra y mostrar motivo.
- `EXPIRED`: permitir reintento.

### Seguridad para transferencias

- No aprobar por captura solamente.
- No aprobar si el monto no coincide.
- No aprobar si la referencia ya fue usada.
- No aprobar si webhook/API no pasa firma o autenticacion.
- Guardar auditoria: quien aprobo, cuando, cuenta, monto y evidencia.
- Idempotencia: una transferencia no puede crear dos ventas.

## 10. Apple Pay

Apple Pay no se integra como transferencia directa. Normalmente se habilita dentro de una pasarela/adquirente como Izipay, Culqi, Openpay, Mercado Pago, PayU o Niubiz si el proveedor lo soporta para tu comercio.

### Flujo recomendado

1. Usuario selecciona `Apple Pay`.
2. Frontend verifica compatibilidad del navegador/dispositivo.
3. Backend crea `PaymentIntent`.
4. La pasarela genera sesion/token.
5. Apple Pay tokeniza el pago en el dispositivo.
6. La pasarela autoriza/captura.
7. Backend recibe confirmacion.
8. Si queda `APPROVED`, se crea pedido/venta.

### Variables sugeridas

```env
APPLE_PAY_ENABLED=true
APPLE_PAY_PROVIDER=IZIPAY
APPLE_PAY_MERCHANT_IDENTIFIER=merchant.pe.mepsgroup
APPLE_PAY_DISPLAY_NAME=MEPS GROUP PERU
APPLE_PAY_COUNTRY_CODE=PE
APPLE_PAY_CURRENCY_CODE=PEN
APPLE_PAY_DOMAIN=ventas.mepsgroup.pe
```

### Tabla `digital_wallet_config`

```text
id
wallet_provider
payment_provider
merchant_identifier
display_name
country_code
currency_code
domain
enabled
created_at
updated_at
```

### Regla de produccion

El frontend no decide si Apple Pay fue exitoso. Solo obtiene token o resultado preliminar. El backend/pasarela debe confirmar autorizacion real y emitir evento en vivo al POS.

## 11. Regla global para todos los metodos en carrito

Todos los metodos deben pasar por el mismo flujo:

```text
Carrito -> PaymentIntent -> Confirmacion proveedor/caja -> APPROVED -> Pedido/Venta -> Stock -> Ticket
```

No debe existir un camino alterno que cree pedido o venta pagada sin `PaymentIntent APPROVED`.

Aplica a:

- Efectivo.
- Tarjeta POS.
- Izipay.
- Culqi.
- Transferencia.
- Yape.
- Plin.
- Apple Pay.
- Google Pay.
- Openpay.
- Mercado Pago.
- PayU.
- Niubiz.
- Llave offline.

## 12. Patron de codigo recomendado

Crear interfaz backend:

```java
public interface PaymentProvider {
    PaymentInitResponse initialize(PaymentIntent intent);
    PaymentStatusResponse queryStatus(String externalId);
    boolean verifyWebhook(String payload, Map<String, String> headers);
    PaymentWebhookResult parseWebhook(String payload);
}
```

Implementaciones:

- `IzipayPaymentProvider`
- `CulqiPaymentProvider`
- `OpenpayPaymentProvider`
- `MercadoPagoPaymentProvider`
- `PayUPaymentProvider`
- `ManualPaymentProvider`

Servicio orquestador:

```java
public class PaymentService {
    public PaymentIntent createIntent(CreatePaymentIntentRequest request) {}
    public PaymentIntent markApproved(UUID intentId, ProviderConfirmation confirmation) {}
    public Sale createSaleFromApprovedIntent(UUID intentId) {}
    public SalesOrder createOrderFromApprovedIntent(UUID intentId) {}
}
```

## 13. Seguridad obligatoria

- Nunca guardar CVV, numero completo de tarjeta ni claves privadas.
- Usar HTTPS siempre.
- Variables sensibles solo en backend.
- Validar firma de webhooks.
- Idempotencia: si el webhook llega dos veces, no duplicar venta ni descontar stock dos veces.
- Registrar auditoria de cambios de pago.
- Guardar payloads de proveedor para soporte.
- Separar sandbox y produccion.
- Usar roles: cajero, admin, supervisor.

## 14. Plan por fases

### Fase 1 - Base interna

- Crear `PaymentIntent` y `PaymentIntentItem`.
- Crear endpoints `/api/payments/intents`.
- Cambiar POS para que todo pago pase por backend.
- Eliminar guardado productivo de pedidos pagados en `localStorage`.
- Mantener `localStorage` solo para demo/offline temporal.

### Fase 2 - Metodos internos

- Efectivo.
- Transferencia manual.
- Yape/Plin manual con constancia.
- Llave offline con usuario supervisor.

### Fase 3 - Izipay

- Configurar credenciales sandbox.
- Crear provider backend.
- Crear endpoint de sesion/token.
- Integrar checkout frontend.
- Implementar webhook/consulta de estado.
- Pasar pruebas sandbox.

### Fase 4 - Culqi

- Configurar llaves test/live.
- Integrar cargos de tarjeta.
- Integrar ordenes/billeteras si aplica.
- Implementar webhooks.

### Fase 5 - Otros proveedores

- Openpay.
- Mercado Pago.
- PayU.
- Niubiz si el comercio obtiene credenciales/documentacion oficial.

### Fase 6 - Produccion

- Activar HTTPS.
- Configurar dominios de retorno/webhook.
- Rotar claves.
- Pruebas con montos bajos reales.
- Monitoreo de errores.
- Conciliacion diaria.

## 15. Criterios de aceptacion

Un pago esta listo para produccion si:

- El carrito se recalcula en backend.
- El pago tiene `PaymentIntent`.
- El proveedor devuelve confirmacion verificable.
- El webhook es idempotente.
- La venta/pedido solo se crea una vez.
- El stock se descuenta en la misma transaccion que crea venta/pedido.
- El historial muestra proveedor, referencia y estado.
- Hay auditoria para soporte.

## 16. Recomendacion final

Prioridad sugerida:

1. Terminar arquitectura `PaymentIntent`.
2. Integrar Izipay sandbox.
3. Integrar Culqi sandbox.
4. Dejar Transferencia/Yape/Plin manual-controlado mientras no haya API oficial disponible para la cuenta.
5. Agregar Openpay/Mercado Pago/PayU segun comisiones, soporte y medios de pago que necesite el negocio.

## 17. Decision operativa actual: modo manual controlado

Por decision del negocio, el sistema trabajara inicialmente en **modo manual controlado** para pasarelas y metodos donde todavia no se tengan credenciales productivas, API habilitada o terminal POS compatible.

Esto aplica inicialmente a:

- Niubiz.
- Izipay.
- Culqi si aun no se configura checkout/API.
- Tarjeta POS fisico no integrado.
- Transferencia bancaria.
- Yape.
- Plin.
- Llave offline.

### Como funcionara ahora

El cajero selecciona el metodo de pago en el checkout del carrito. Luego realiza la validacion fuera del sistema o con el canal disponible:

- En POS fisico: cobra en la maquina Niubiz/Izipay.
- En transferencia: revisa banca/app o constancia.
- En Yape/Plin: revisa app/cuenta receptora y constancia.
- En llave offline: valida codigo autorizado por caja o supervisor.

Despues registra en el sistema:

- metodo de pago;
- referencia, operacion o codigo de aprobacion;
- constancia si aplica;
- cuenta bancaria destino si aplica;
- usuario responsable de la aprobacion.

Solo despues de esa confirmacion manual controlada el sistema permite:

```text
Pago aprobado -> Generar pedido/venta -> Descontar stock -> Imprimir ticket -> Guardar historial
```

### Por que se usa este modo

Este modo permite operar desde ya sin bloquear el flujo comercial mientras se consiguen:

- credenciales de produccion;
- credenciales sandbox;
- terminal POS compatible;
- contrato de pasarela;
- webhook/API bancaria;
- certificaciones del proveedor.

### Limitaciones del modo manual

- El cajero debe registrar referencia o codigo de aprobacion.
- Hay riesgo de error humano si se escribe mal.
- No existe confirmacion automatica de la pasarela.
- La validacion depende del responsable de caja.
- No debe considerarse integracion bancaria automatica.

### Controles obligatorios

Para reducir riesgos:

- No aprobar pagos sin revisar monto exacto.
- No aprobar pagos sin referencia cuando el metodo la entregue.
- No aprobar transferencia/Yape/Plin solo por imagen si el monto no fue revisado.
- Guardar usuario que aprueba.
- Guardar fecha y hora de aprobacion.
- Guardar constancia cuando aplique.
- Evitar duplicar una misma referencia en otra venta.

### Migracion futura a modo integrado

Cuando se tengan credenciales o terminal compatible, cada proveedor podra pasar de:

```text
manual_controlled
```

a:

```text
integrated
```

En modo integrado:

- el backend crea la intencion de pago;
- el backend o terminal envia el monto a la pasarela;
- el cliente paga;
- la pasarela devuelve estado, operacion y codigo;
- el sistema aprueba automaticamente si la respuesta es valida;
- el cajero ya no escribe codigo manualmente.

### Configuracion sugerida por proveedor

```text
Niubiz: manual_controlled -> integrated
Izipay: manual_controlled -> integrated
Culqi: manual_controlled -> checkout_integrated
Transferencia: manual_controlled -> bank_api_or_reconciliation
Yape: manual_controlled -> api_or_authorized_provider
Plin: manual_controlled -> api_or_authorized_provider
```

### Regla de transicion

La migracion a modo integrado no debe cambiar el flujo del carrito. Solo cambia el mecanismo de confirmacion del `PaymentIntent`.

El flujo siempre se mantiene:

```text
Carrito -> PaymentIntent -> Confirmacion -> APPROVED -> Pedido/Venta
```

## 18. Flujo operativo por metodo de pago

Esta seccion define como debe comportarse el sistema para cada metodo de pago desde el carrito hasta la generacion de pedido/venta.

### 18.1 Efectivo

Uso:

- Caja fisica.
- Venta presencial.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Efectivo`.
3. Backend crea `PaymentIntent` con estado `PENDING_CASH_CONFIRMATION`.
4. Cajero recibe dinero.
5. Cajero registra monto recibido.
6. Sistema calcula vuelto.
7. Cajero confirma pago.
8. Backend marca `PaymentIntent` como `APPROVED`.
9. Backend genera pedido/venta.
10. Backend descuenta stock.
11. Sistema imprime ticket.

Datos a guardar:

- monto total;
- monto recibido;
- vuelto;
- usuario cajero;
- fecha/hora de confirmacion.

No requiere:

- constancia;
- codigo externo;
- webhook.

### 18.2 Tarjeta POS fisico no integrado

Uso:

- Maquina POS externa de Niubiz/Izipay u otro adquirente.
- Modo manual controlado.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Tarjeta POS`.
3. Backend crea `PaymentIntent` con estado `PENDING_CARD_TERMINAL`.
4. Cajero digita o confirma el monto en la maquina POS.
5. Cliente pasa/inserta/acerca tarjeta.
6. Terminal responde aprobado o rechazado.
7. Si es aprobado, cajero registra en el sistema:
   - codigo de autorizacion;
   - numero de operacion;
   - marca de tarjeta si se ve;
   - ultimos 4 digitos si se ve;
   - voucher si aplica.
8. Backend marca `PaymentIntent` como `APPROVED`.
9. Backend genera pedido/venta.
10. Backend descuenta stock.
11. Sistema imprime ticket.

Si el terminal rechaza:

- el cajero marca `REJECTED`;
- no se genera pedido/venta;
- el carrito puede reintentarse con otro metodo.

### 18.3 Tarjeta POS integrado

Uso futuro:

- Cuando el terminal sea compatible con integracion.
- El cajero no escribe codigo manualmente.

Flujo:

1. Cajero arma carrito.
2. Selecciona proveedor integrado, por ejemplo `Niubiz Integrado` o `Izipay Integrado`.
3. Backend crea `PaymentIntent`.
4. Backend o app local envia monto al terminal.
5. Terminal muestra monto.
6. Cliente pasa tarjeta.
7. Terminal devuelve al sistema:
   - estado;
   - codigo de autorizacion;
   - numero de operacion;
   - marca;
   - tarjeta enmascarada.
8. Backend valida respuesta.
9. Si es `APPROVED`, genera pedido/venta.
10. Se descuenta stock e imprime ticket.

No requiere:

- tipeo manual de codigo.

### 18.4 Transferencia bancaria manual controlada

Uso:

- Transferencia a BCP, Interbank, BBVA u otra cuenta configurada.
- Modo actual recomendado hasta tener API bancaria.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Transferencia Bancaria`.
3. Sistema muestra cuentas disponibles:
   - BCP;
   - Interbank;
   - BBVA.
4. Cajero/cliente elige cuenta destino.
5. Backend crea `PaymentIntent` con:
   - banco;
   - cuenta;
   - CCI;
   - monto;
   - referencia unica.
6. Cliente realiza transferencia.
7. Cliente entrega constancia o numero de operacion.
8. Cajero valida en banca/app empresarial.
9. Cajero registra referencia y adjunta constancia.
10. Backend marca `PaymentIntent` como `APPROVED`.
11. Backend genera pedido/venta.
12. Backend descuenta stock.
13. Sistema imprime ticket.

Si no se encuentra el pago:

- estado `REJECTED` o `PENDING_REVIEW`;
- no se genera pedido/venta.

### 18.5 Transferencia bancaria con API o conciliacion

Uso futuro:

- Cuando el banco o proveedor entregue API, webhook o archivo de conciliacion.

Flujo:

1. Backend crea `PaymentIntent` con referencia unica.
2. Cliente transfiere.
3. Banco/proveedor notifica movimiento por webhook/API, o el sistema consulta movimientos.
4. Backend cruza:
   - monto;
   - cuenta destino;
   - referencia;
   - fecha/hora;
   - identificador externo.
5. Si coincide, `PaymentIntent` pasa a `APPROVED`.
6. Backend genera pedido/venta.

No requiere:

- aprobacion manual, salvo excepciones.

### 18.6 Yape manual controlado

Uso:

- Pago a numero Yape configurado.
- QR visible en POS.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Yape`.
3. Backend crea `PaymentIntent`.
4. Frontend muestra:
   - QR Yape;
   - numero receptor;
   - titular;
   - monto exacto.
5. Cliente yapea.
6. Cliente muestra constancia o numero de operacion.
7. Cajero valida en app/cuenta.
8. Cajero registra referencia y constancia.
9. Backend marca `APPROVED`.
10. Backend genera pedido/venta.

Si no se ve el yape:

- queda `PENDING_REVIEW` o `REJECTED`;
- no se genera pedido/venta.

### 18.7 Plin manual controlado

Uso:

- Pago a numero Plin configurado.
- QR visible en POS.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Plin`.
3. Backend crea `PaymentIntent`.
4. Frontend muestra QR/numero Plin.
5. Cliente paga.
6. Cajero valida ingreso.
7. Cajero registra referencia/constancia.
8. Backend marca `APPROVED`.
9. Backend genera pedido/venta.

### 18.8 Yape/Plin integrado

Uso futuro:

- Solo si existe API oficial o proveedor autorizado para tu comercio.

Flujo:

1. Backend crea `PaymentIntent`.
2. Backend genera orden de pago o QR dinamico.
3. Cliente paga.
4. Proveedor envia webhook.
5. Backend valida firma y estado.
6. Si estado es aprobado, genera pedido/venta.

No se debe:

- aprobar solo por captura;
- leer notificaciones del celular personal como confirmacion bancaria oficial.

### 18.9 Izipay manual controlado

Uso actual:

- Pasarela/terminal Izipay aun sin credenciales o sin integracion.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Izipay`.
3. Cobra en terminal o canal Izipay externo.
4. Si se aprueba, registra codigo/operacion en el sistema.
5. Backend marca `PaymentIntent` como `APPROVED`.
6. Backend genera pedido/venta.

### 18.10 Izipay integrado

Uso futuro:

- Izipay Checkout/API/POS compatible.

Flujo:

1. Backend crea `PaymentIntent`.
2. Backend solicita sesion/token a Izipay.
3. Frontend abre checkout o terminal.
4. Cliente paga.
5. Izipay devuelve resultado.
6. Backend confirma por respuesta o webhook.
7. Si aprobado, genera pedido/venta.

### 18.11 Niubiz manual controlado

Uso actual:

- POS Niubiz sin integracion directa.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Niubiz`.
3. Cobra en terminal Niubiz.
4. Si terminal aprueba, cajero registra:
   - codigo de autorizacion;
   - operacion;
   - voucher si aplica.
5. Backend marca `APPROVED`.
6. Backend genera pedido/venta.

### 18.12 Niubiz integrado

Uso futuro:

- Niubiz API/POS integrado.

Flujo:

1. Backend crea `PaymentIntent`.
2. Backend genera sesion/token con Niubiz.
3. Frontend/terminal procesa tarjeta.
4. Niubiz retorna estado.
5. Backend valida respuesta.
6. Si aprobado, genera pedido/venta.

Datos esperados:

- `transactionId`;
- `authorizationCode`;
- `purchaseNumber`;
- `actionCode`;
- tarjeta enmascarada;
- marca de tarjeta.

### 18.13 Culqi checkout o API

Uso:

- Pago con tarjeta online.
- Ordenes de pago.
- Billeteras si estan habilitadas.

Flujo:

1. Backend crea `PaymentIntent`.
2. Frontend usa Culqi Checkout o tokenizacion con llave publica.
3. Backend recibe token seguro.
4. Backend crea cargo/orden con llave privada.
5. Culqi responde aprobado/rechazado o envia webhook.
6. Backend valida estado.
7. Si aprobado, genera pedido/venta.

### 18.14 Openpay

Flujo:

1. Backend crea `PaymentIntent`.
2. Frontend tokeniza con Openpay.js o checkout.
3. Backend crea cargo.
4. Openpay confirma estado.
5. Backend genera pedido/venta si esta aprobado.

### 18.15 Mercado Pago

Flujo:

1. Backend crea `PaymentIntent`.
2. Backend crea preferencia o pago.
3. Frontend abre checkout.
4. Mercado Pago procesa pago.
5. Backend recibe webhook/consulta estado.
6. Si aprobado, genera pedido/venta.

### 18.16 PayU

Flujo:

1. Backend crea `PaymentIntent`.
2. Backend crea transaccion PayU.
3. PayU autoriza/captura.
4. Backend confirma estado.
5. Si aprobado, genera pedido/venta.

### 18.17 Apple Pay

Uso:

- Wallet digital mediante proveedor compatible.

Flujo:

1. Backend crea `PaymentIntent`.
2. Frontend verifica si Apple Pay esta disponible.
3. Pasarela compatible genera sesion.
4. Cliente autoriza con Apple Pay.
5. Pasarela procesa pago.
6. Backend confirma estado.
7. Si aprobado, genera pedido/venta.

### 18.18 Google Pay

Uso:

- Wallet digital mediante proveedor compatible.

Flujo:

1. Backend crea `PaymentIntent`.
2. Frontend verifica Google Pay.
3. Cliente autoriza pago.
4. Pasarela procesa token.
5. Backend confirma estado.
6. Si aprobado, genera pedido/venta.

### 18.19 Llave offline

Uso:

- Contingencia cuando no hay internet o se autoriza por supervisor.

Flujo:

1. Cajero arma carrito.
2. Selecciona `Llave Offline`.
3. Supervisor genera o entrega codigo autorizado.
4. Cajero registra codigo.
5. Backend valida formato, usuario y permisos.
6. Backend marca `APPROVED_MANUAL`.
7. Backend genera pedido/venta.

Debe auditar:

- supervisor;
- caja;
- motivo;
- monto;
- fecha/hora.
