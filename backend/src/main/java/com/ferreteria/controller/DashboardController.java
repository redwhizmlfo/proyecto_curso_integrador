package com.ferreteria.controller;

import com.ferreteria.model.Customer;
import com.ferreteria.model.Employee;
import com.ferreteria.model.EmployeeAttendance;
import com.ferreteria.model.EmployeeSlip;
import com.ferreteria.model.Loss;
import com.ferreteria.model.Product;
import com.ferreteria.model.PurchaseOrder;
import com.ferreteria.model.Sale;
import com.ferreteria.model.StockMovement;
import com.ferreteria.model.Supplier;
import com.ferreteria.model.User;
import com.ferreteria.repository.CustomerRepository;
import com.ferreteria.repository.EmployeeAttendanceRepository;
import com.ferreteria.repository.EmployeeRepository;
import com.ferreteria.repository.EmployeeSlipRepository;
import com.ferreteria.repository.LossRepository;
import com.ferreteria.repository.ProductRepository;
import com.ferreteria.repository.PurchaseOrderRepository;
import com.ferreteria.repository.SaleRepository;
import com.ferreteria.repository.StockMovementRepository;
import com.ferreteria.repository.SupplierRepository;
import com.ferreteria.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final StockMovementRepository stockMovementRepository;
    private final LossRepository lossRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeAttendanceRepository attendanceRepository;
    private final EmployeeSlipRepository slipRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<Product> products = productRepository.findAll();
        List<Sale> sales = saleRepository.findAll();

        List<Map<String, Object>> recentSales = latestByDate(sales, Sale::getSoldAt, 5).stream()
                .map(this::dashboardSale)
                .toList();
        List<Product> lowStockItems = products.stream()
                .filter(product -> product.isActive() && compare(product.getStock(), product.getMinStock()) <= 0)
                .limit(5)
                .toList();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProducts", products.stream().filter(Product::isActive).count());
        summary.put("lowStockAlerts", lowStockItems.size());
        summary.put("totalSalesRevenue", sum(sales.stream().map(Sale::getTotal)));
        summary.put("totalCustomers", customerRepository.count());
        summary.put("recentSales", recentSales);
        summary.put("lowStockItems", lowStockItems.stream().map(this::dashboardProduct).toList());

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/resumen/{module}")
    public ResponseEntity<Map<String, Object>> getModuleSummary(@PathVariable String module) {
        return switch (module) {
            case "inventario" -> ResponseEntity.ok(inventorySummary());
            case "ventas" -> ResponseEntity.ok(salesSummary());
            case "clientes" -> ResponseEntity.ok(customersSummary());
            case "proveedores" -> ResponseEntity.ok(suppliersSummary());
            case "pedidos-compra" -> ResponseEntity.ok(purchaseOrdersSummary());
            case "almacen" -> ResponseEntity.ok(warehouseSummary());
            case "empleados" -> ResponseEntity.ok(employeesSummary());
            case "usuarios-roles" -> ResponseEntity.ok(usersSummary());
            default -> ResponseEntity.notFound().build();
        };
    }

    private Map<String, Object> inventorySummary() {
        List<Product> products = productRepository.findAll();
        List<StockMovement> movements = stockMovementRepository.findAll();
        List<Product> activeProducts = products.stream().filter(Product::isActive).toList();
        List<Product> lowStock = activeProducts.stream()
                .filter(product -> compare(product.getStock(), product.getMinStock()) <= 0)
                .toList();

        BigDecimal inventoryValue = sum(activeProducts.stream()
                .map(product -> safe(product.getStock()).multiply(safe(product.getCost()))));
        long categories = activeProducts.stream().map(Product::getCategory).filter(Objects::nonNull).distinct().count();

        List<List<Object>> rows = (lowStock.isEmpty() ? activeProducts : lowStock).stream()
                .limit(6)
                .map(product -> row(
                        product.getName(),
                        fallback(product.getCategory(), "Sin categoria"),
                        safe(product.getStock()) + " " + fallback(product.getUnit(), ""),
                        safe(product.getMinStock()) + " " + fallback(product.getUnit(), "")
                ))
                .toList();

        return response(
                "Productos a revisar",
                List.of("Producto", "Categoria", "Stock", "Minimo"),
                rows,
                kpi("Productos activos", activeProducts.size(), categories + " categorias", "Package", "blue"),
                kpi("Stock critico", lowStock.size(), "Productos bajo minimo", "AlertTriangle", lowStock.isEmpty() ? "green" : "red"),
                kpi("Valor inventario", inventoryValue, "Costo por stock actual", "DollarSign", "orange"),
                kpi("Movimientos", movements.size(), "Kardex registrado", "ClipboardList", "slate")
        );
    }

    private Map<String, Object> salesSummary() {
        List<Sale> sales = saleRepository.findAll();
        BigDecimal revenue = sum(sales.stream().map(Sale::getTotal));
        BigDecimal averageTicket = sales.isEmpty()
                ? BigDecimal.ZERO
                : revenue.divide(BigDecimal.valueOf(sales.size()), 2, java.math.RoundingMode.HALF_UP);

        List<List<Object>> rows = latestByDate(sales, Sale::getSoldAt, 6).stream()
                .map(sale -> row(
                        fallback(sale.getSeries(), "VEN-" + shortId(sale.getId())),
                        fallback(sale.getClientNameSnapshot(), "Cliente sin nombre"),
                        fallback(sale.getPaymentMethod(), "No definido"),
                        safe(sale.getTotal())
                ))
                .toList();

        return response(
                "Ultimas ventas",
                List.of("Documento", "Cliente", "Pago", "Total"),
                rows,
                kpi("Ventas registradas", sales.size(), "Documentos emitidos", "ShoppingCart", "blue"),
                kpi("Ingresos totales", revenue, "Acumulado historico", "DollarSign", "orange"),
                kpi("Ticket promedio", averageTicket, "Total por venta", "ClipboardList", "green"),
                kpi("Clientes en cartera", customerRepository.count(), "Base comercial", "Users", "slate")
        );
    }

    private Map<String, Object> customersSummary() {
        List<Customer> customers = customerRepository.findAll();
        List<Sale> sales = saleRepository.findAll();
        long dni = customers.stream().filter(customer -> equalsIgnoreCase(customer.getDocType(), "dni")).count();
        long ruc = customers.stream().filter(customer -> equalsIgnoreCase(customer.getDocType(), "ruc")).count();
        long withDiscount = customers.stream().filter(customer -> compare(customer.getPreferredDiscount(), BigDecimal.ZERO) > 0).count();
        long buyers = sales.stream().map(Sale::getClientDocNumberSnapshot).filter(Objects::nonNull).distinct().count();

        List<List<Object>> rows = latestByDate(customers, Customer::getCreatedAt, 6).stream()
                .map(customer -> row(
                        customer.getName(),
                        fallback(customer.getDocType(), "").toUpperCase() + " " + fallback(customer.getDocNumber(), ""),
                        fallback(customer.getPhone(), "Sin telefono"),
                        safe(customer.getPreferredDiscount()) + "%"
                ))
                .toList();

        return response(
                "Clientes recientes",
                List.of("Cliente", "Documento", "Telefono", "Descuento"),
                rows,
                kpi("Clientes registrados", customers.size(), buyers + " con compras", "Users", "blue"),
                kpi("Clientes DNI", dni, "Personas naturales", "ClipboardList", "slate"),
                kpi("Clientes RUC", ruc, "Empresas", "Briefcase", "orange"),
                kpi("Con descuento", withDiscount, "Preferencial activo", "DollarSign", "green")
        );
    }

    private Map<String, Object> suppliersSummary() {
        List<Supplier> suppliers = supplierRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        long activeSuppliers = suppliers.stream().filter(Supplier::isActive).count();
        long suppliersWithProducts = products.stream().map(Product::getSupplierNameSnapshot).filter(Objects::nonNull).distinct().count();

        List<List<Object>> rows = latestByDate(suppliers, Supplier::getCreatedAt, 6).stream()
                .map(supplier -> row(
                        supplier.getName(),
                        fallback(supplier.getRuc(), "Sin RUC"),
                        firstPresent(supplier.getContact(), supplier.getPhone(), "Sin contacto"),
                        supplier.isActive() ? "Activo" : "Inactivo"
                ))
                .toList();

        return response(
                "Proveedores recientes",
                List.of("Proveedor", "RUC", "Contacto", "Estado"),
                rows,
                kpi("Proveedores activos", activeSuppliers, suppliers.size() + " registrados", "Truck", "blue"),
                kpi("Con productos", suppliersWithProducts, "Abastecimiento vinculado", "Package", "green"),
                kpi("Ordenes pendientes", countStatus(orders, "pendiente"), "Por gestionar", "ClipboardList", "orange"),
                kpi("Ordenes recibidas", countStatus(orders, "recibido"), "Cerradas en compras", "ShieldCheck", "slate")
        );
    }

    private Map<String, Object> purchaseOrdersSummary() {
        List<PurchaseOrder> orders = purchaseOrderRepository.findAll();
        BigDecimal totalUnits = sum(orders.stream().map(PurchaseOrder::getTotalUnits));
        long urgent = orders.stream()
                .filter(order -> equalsIgnoreCase(order.getPriority(), "alta") || equalsIgnoreCase(order.getPriority(), "urgente"))
                .count();

        List<List<Object>> rows = latestByDate(orders, PurchaseOrder::getOrderedAt, 6).stream()
                .map(order -> row(
                        fallback(order.getSupplierNameSnapshot(), "Proveedor"),
                        fallback(order.getStatus(), "Sin estado"),
                        fallback(order.getPriority(), "Media"),
                        safe(order.getTotalUnits())
                ))
                .toList();

        return response(
                "Ultimas ordenes",
                List.of("Proveedor", "Estado", "Prioridad", "Unidades"),
                rows,
                kpi("Ordenes totales", orders.size(), "Pedidos de compra", "ClipboardList", "blue"),
                kpi("Pendientes", countStatus(orders, "pendiente"), "Aun no recibidas", "AlertTriangle", "orange"),
                kpi("Recibidas", countStatus(orders, "recibido"), "Completadas", "ShieldCheck", "green"),
                kpi("Unidades solicitadas", totalUnits, urgent + " prioridad alta", "Package", "slate")
        );
    }

    private Map<String, Object> warehouseSummary() {
        List<StockMovement> movements = stockMovementRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Loss> losses = lossRepository.findAll();
        long entries = movements.stream().filter(movement -> compare(movement.getDelta(), BigDecimal.ZERO) > 0).count();
        long exits = movements.stream().filter(movement -> compare(movement.getDelta(), BigDecimal.ZERO) < 0).count();
        long activeLosses = losses.stream().filter(loss -> equalsIgnoreCase(loss.getStatus(), "active")).count();
        long productsMoved = movements.stream().map(StockMovement::getProductNameSnapshot).filter(Objects::nonNull).distinct().count();

        List<List<Object>> rows = latestByDate(movements, StockMovement::getOccurredAt, 6).stream()
                .map(movement -> row(
                        fallback(movement.getProductNameSnapshot(), "Producto"),
                        fallback(movement.getMovementType(), "Movimiento"),
                        safe(movement.getDelta()) + " " + fallback(movement.getUnitSnapshot(), ""),
                        safe(movement.getStockAfter())
                ))
                .toList();

        return response(
                "Ultimos movimientos",
                List.of("Producto", "Tipo", "Delta", "Stock final"),
                rows,
                kpi("Movimientos", movements.size(), productsMoved + " productos movidos", "ClipboardList", "blue"),
                kpi("Entradas", entries, "Incrementos de stock", "Package", "green"),
                kpi("Salidas", exits, "Descuentos de stock", "AlertTriangle", "orange"),
                kpi("Mermas activas", activeLosses, products.stream().filter(Product::isActive).count() + " productos activos", "Boxes", "slate")
        );
    }

    private Map<String, Object> employeesSummary() {
        List<Employee> employees = employeeRepository.findAll();
        List<EmployeeAttendance> attendance = attendanceRepository.findAll();
        List<EmployeeSlip> slips = slipRepository.findAll();
        long activeEmployees = employees.stream().filter(Employee::isActive).count();
        long presentToday = employees.stream().filter(employee -> Boolean.TRUE.equals(employee.getAttendanceToday())).count();
        BigDecimal payroll = sum(slips.stream().map(EmployeeSlip::getTotalAmount));

        List<List<Object>> rows = employees.stream()
                .filter(Employee::isActive)
                .limit(6)
                .map(employee -> row(
                        employee.getName(),
                        fallback(employee.getRole(), "Sin rol"),
                        firstPresent(employee.getTodayStatus(), employee.getAttendanceToday() ? "Presente" : null, "Sin marca"),
                        safe(employee.getPayPerDay())
                ))
                .toList();

        return response(
                "Equipo registrado",
                List.of("Empleado", "Rol", "Estado hoy", "Jornal"),
                rows,
                kpi("Empleados activos", activeEmployees, employees.size() + " registrados", "Briefcase", "blue"),
                kpi("Asistencia hoy", presentToday, "Marcados como presentes", "ShieldCheck", "green"),
                kpi("Marcaciones", attendance.size(), "Historial cargado", "ClipboardList", "slate"),
                kpi("Boletas emitidas", slips.size(), payroll, "DollarSign", "orange")
        );
    }

    private Map<String, Object> usersSummary() {
        List<User> users = userRepository.findAll();
        long activeUsers = users.stream()
                .filter(user -> user.isActive() || equalsIgnoreCase(user.getStatus(), "active"))
                .count();
        long blockedUsers = users.stream()
                .filter(user -> equalsIgnoreCase(user.getStatus(), "blocked") || equalsIgnoreCase(user.getStatus(), "inactive"))
                .count();
        long roles = users.stream().map(User::getRole).filter(Objects::nonNull).distinct().count();

        List<List<Object>> rows = users.stream()
                .limit(6)
                .map(user -> row(
                        user.getUsername(),
                        fallback(user.getRole(), "Sin rol"),
                        fallback(user.getStatus(), user.isActive() ? "active" : "inactive"),
                        user.getLastAccessAt() == null ? "Sin acceso" : user.getLastAccessAt().toLocalDate().toString()
                ))
                .toList();

        return response(
                "Usuarios registrados",
                List.of("Usuario", "Rol", "Estado", "Ultimo acceso"),
                rows,
                kpi("Usuarios", users.size(), activeUsers + " activos", "Users", "blue"),
                kpi("Roles", roles, "Perfiles distintos", "ShieldCheck", "green"),
                kpi("Bloqueados/inactivos", blockedUsers, "Revisar accesos", "AlertTriangle", blockedUsers > 0 ? "red" : "slate"),
                kpi("Empleados", employeeRepository.count(), "Base vinculable", "Briefcase", "orange")
        );
    }

    @SafeVarargs
    private Map<String, Object> response(String tableTitle, List<String> columns, List<List<Object>> rows, Map<String, Object>... kpis) {
        Map<String, Object> response = new HashMap<>();
        response.put("kpis", List.of(kpis));
        response.put("tableTitle", tableTitle);
        response.put("columns", columns);
        response.put("rows", rows);
        return response;
    }

    private Map<String, Object> kpi(String label, Object value, Object hint, String icon, String tone) {
        Map<String, Object> kpi = new HashMap<>();
        kpi.put("label", label);
        kpi.put("value", value);
        kpi.put("hint", hint);
        kpi.put("icon", icon);
        kpi.put("tone", tone);
        return kpi;
    }

    private Map<String, Object> dashboardSale(Sale sale) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", sale.getId());
        item.put("series", sale.getSeries());
        item.put("clientNameSnapshot", sale.getClientNameSnapshot());
        item.put("soldAt", sale.getSoldAt());
        item.put("total", safe(sale.getTotal()));
        return item;
    }

    private Map<String, Object> dashboardProduct(Product product) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", product.getId());
        item.put("name", product.getName());
        item.put("barcode", product.getBarcode());
        item.put("category", product.getCategory());
        item.put("stock", safe(product.getStock()));
        item.put("minStock", safe(product.getMinStock()));
        item.put("unit", product.getUnit());
        return item;
    }

    private List<Object> row(Object... values) {
        return List.of(values);
    }

    private BigDecimal sum(Stream<BigDecimal> values) {
        return values.filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private int compare(BigDecimal left, BigDecimal right) {
        return safe(left).compareTo(safe(right));
    }

    private boolean equalsIgnoreCase(String value, String expected) {
        return value != null && value.equalsIgnoreCase(expected);
    }

    private String fallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String firstPresent(String first, String second, String fallback) {
        if (first != null && !first.isBlank()) return first;
        if (second != null && !second.isBlank()) return second;
        return fallback;
    }

    private String shortId(Object id) {
        return id == null ? "000000" : id.toString().substring(0, Math.min(6, id.toString().length()));
    }

    private long countStatus(List<PurchaseOrder> orders, String status) {
        return orders.stream().filter(order -> equalsIgnoreCase(order.getStatus(), status)).count();
    }

    private <T> List<T> latestByDate(List<T> items, java.util.function.Function<T, OffsetDateTime> dateGetter, int limit) {
        return items.stream()
                .sorted((left, right) -> {
                    OffsetDateTime leftDate = dateGetter.apply(left);
                    OffsetDateTime rightDate = dateGetter.apply(right);
                    if (leftDate == null && rightDate == null) return 0;
                    if (leftDate == null) return 1;
                    if (rightDate == null) return -1;
                    return rightDate.compareTo(leftDate);
                })
                .limit(limit)
                .toList();
    }
}
