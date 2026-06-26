# Guía de Endpoints para Postman - FerreMas API

Esta guía contiene los endpoints principales de la API de FerreMas (corriendo en `http://localhost:8081`) estructurados para copiar, pegar y probar directamente en Postman.

> **Nota sobre Seguridad:** 
> Para los endpoints protegidos (como `/api/users`), asegúrate de ir a la pestaña **Authorization** en Postman, seleccionar **Basic Auth** e ingresar las credenciales:
> - **Username:** `admin`
> - **Password:** `admin123`
>
> Para usar JWT (tokens), primero haz un POST a `/api/auth/login` para obtener el token, y luego usa **Bearer Token** en la pestaña Authorization para el resto de peticiones.

---

## 1. Autenticación (Auth & Users)

### Login para obtener JWT
- **Método:** `POST`
- **URL:** `http://localhost:8081/api/auth/login`
- **Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Listar Usuarios (Requiere Basic Auth Admin)
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/users`

---

## 2. Clientes (Customers)

### Listar Clientes
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/customers`

### Crear Cliente
- **Método:** `POST`
- **URL:** `http://localhost:8081/api/customers`
- **Body (JSON):**
```json
{
  "name": "Juan Perez",
  "docType": "DNI",
  "docNumber": "74859612",
  "phone": "987654321",
  "email": "juan.perez@test.com",
  "address": "Av. Principal 123",
  "preferredDiscount": 0
}
```

---

## 3. Proveedores (Suppliers)

### Listar Proveedores
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/suppliers`

### Crear Proveedor
- **Método:** `POST`
- **URL:** `http://localhost:8081/api/suppliers`
- **Body (JSON):**
```json
{
  "name": "Constructora ACME S.A.C",
  "ruc": "20123456789",
  "contactName": "Maria Lopez",
  "phone": "01-555-8888",
  "email": "ventas@acme.com"
}
```

---

## 4. Productos e Inventario (Products & Stock)

### Listar Productos
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/products`

### Registrar Movimiento de Stock (Ajuste/Ingreso)
- **Método:** `POST`
- **URL:** `http://localhost:8081/api/stock-movements`
- **Body (JSON):**
*(Nota: Debes reemplazar el `productId` con un ID de producto válido obtenido del GET)*
```json
{
  "productId": "UUID-DEL-PRODUCTO-AQUI",
  "movementType": "ENTRY",
  "delta": 50.00,
  "reasonCode": "COMPRA",
  "detail": "Ingreso por nueva compra a proveedor"
}
```

---

## 5. Ventas (Sales)

### Listar Ventas
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/sales`

### Registrar Venta (Checkout)
- **Método:** `POST`
- **URL:** `http://localhost:8081/api/sales`
- **Body (JSON):**
*(Nota: Debes usar UUIDs válidos para `customerId`, `sellerId` y `productId`)*
```json
{
  "customerId": "UUID-DEL-CLIENTE",
  "sellerId": "UUID-DEL-VENDEDOR",
  "documentType": "BOLETA",
  "paymentMethod": "EFECTIVO",
  "receivedAmount": 100.00,
  "discountPct": 0.00,
  "note": "Venta en mostrador",
  "lines": [
    {
      "productId": "UUID-DEL-PRODUCTO",
      "quantity": 2.00,
      "unitPrice": 45.00
    }
  ]
}
```

---

## 6. Otros Endpoints GET Útiles

### Dashboard (Resumen de métricas)
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/dashboard/summary`

### Empleados
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/employees`

### Órdenes de Compra
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/orders`

### Asistencia (Registro de Horarios)
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/attendance`

### Boletas (Planillas de Pago)
- **Método:** `GET`
- **URL:** `http://localhost:8081/api/slips`
