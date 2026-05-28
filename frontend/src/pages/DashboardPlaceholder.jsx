import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  Boxes,
  Briefcase,
  ClipboardList,
  DollarSign,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users
} from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

const currency = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN'
});

const number = new Intl.NumberFormat('es-PE', {
  maximumFractionDigits: 2
});

const asArray = (value) => (Array.isArray(value) ? value : []);
const toNumber = (value) => Number(value ?? 0) || 0;
const isActive = (value) => value === true || value === undefined || value === null;
const normalize = (value) => String(value ?? '').toLowerCase();
const sumBy = (items, picker) => items.reduce((total, item) => total + toNumber(picker(item)), 0);

const latest = (items, field) =>
  [...items].sort((a, b) => new Date(b[field] ?? 0) - new Date(a[field] ?? 0)).slice(0, 6);

const getStatusCount = (items, status) =>
  items.filter((item) => normalize(item.status) === status).length;

const iconMap = {
  AlertTriangle,
  Boxes,
  Briefcase,
  ClipboardList,
  DollarSign,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users
};

const fetchEndpoint = async (endpoint) => {
  try {
    return { data: await api.get(endpoint), failed: false };
  } catch (error) {
    console.warn(`No se pudo cargar ${endpoint}`, error);
    return { data: [], failed: true };
  }
};

const moduleDetails = {
  '/dashboard/resumen-inventario': {
    title: 'Resumen de Inventario',
    subtitle: 'KPIs de stock, valorizacion y productos criticos',
    icon: Boxes,
    apiEndpoint: '/dashboard/resumen/inventario',
    endpoints: {
      products: '/products',
      movements: '/stock-movements'
    },
    build: ({ products = [], movements = [] }) => {
      const activeProducts = products.filter((product) => isActive(product.active));
      const lowStock = activeProducts.filter((product) => toNumber(product.stock) <= toNumber(product.minStock));
      const inventoryValue = sumBy(activeProducts, (product) => toNumber(product.stock) * toNumber(product.cost));
      const categories = new Set(activeProducts.map((product) => product.category).filter(Boolean)).size;

      return {
        kpis: [
          { label: 'Productos activos', value: activeProducts.length, hint: `${categories} categorias`, icon: Package, tone: 'blue' },
          { label: 'Stock critico', value: lowStock.length, hint: 'Productos bajo minimo', icon: AlertTriangle, tone: lowStock.length ? 'red' : 'green' },
          { label: 'Valor inventario', value: currency.format(inventoryValue), hint: 'Costo por stock actual', icon: DollarSign, tone: 'orange' },
          { label: 'Movimientos', value: movements.length, hint: 'Kardex registrado', icon: ClipboardList, tone: 'slate' }
        ],
        tableTitle: 'Productos a revisar',
        columns: ['Producto', 'Categoria', 'Stock', 'Minimo'],
        rows: lowStock.length ? lowStock.slice(0, 6) : activeProducts.slice(0, 6),
        renderRow: (product) => [
          product.name,
          product.category || 'Sin categoria',
          `${number.format(toNumber(product.stock))} ${product.unit ?? ''}`,
          `${number.format(toNumber(product.minStock))} ${product.unit ?? ''}`
        ]
      };
    }
  },
  '/dashboard/resumen-ventas': {
    title: 'Resumen de Ventas',
    subtitle: 'KPIs comerciales desde ventas registradas',
    icon: ShoppingCart,
    apiEndpoint: '/dashboard/resumen/ventas',
    endpoints: {
      sales: '/sales',
      customers: '/customers'
    },
    build: ({ sales = [], customers = [] }) => {
      const revenue = sumBy(sales, (sale) => sale.total);
      const averageTicket = sales.length ? revenue / sales.length : 0;
      const recentSales = latest(sales, 'soldAt');

      return {
        kpis: [
          { label: 'Ventas registradas', value: sales.length, hint: 'Documentos emitidos', icon: ShoppingCart, tone: 'blue' },
          { label: 'Ingresos totales', value: currency.format(revenue), hint: 'Acumulado historico', icon: DollarSign, tone: 'orange' },
          { label: 'Ticket promedio', value: currency.format(averageTicket), hint: 'Total por venta', icon: ClipboardList, tone: 'green' },
          { label: 'Clientes en cartera', value: customers.length, hint: 'Base comercial', icon: Users, tone: 'slate' }
        ],
        tableTitle: 'Ultimas ventas',
        columns: ['Documento', 'Cliente', 'Pago', 'Total'],
        rows: recentSales,
        renderRow: (sale) => [
          sale.series || `VEN-${String(sale.id ?? '').slice(0, 6)}`,
          sale.clientNameSnapshot || 'Cliente sin nombre',
          sale.paymentMethod || 'No definido',
          currency.format(toNumber(sale.total))
        ]
      };
    }
  },
  '/dashboard/resumen-clientes': {
    title: 'Resumen de Clientes',
    subtitle: 'KPIs de clientes, documentos y descuentos',
    icon: Users,
    apiEndpoint: '/dashboard/resumen/clientes',
    endpoints: {
      customers: '/customers',
      sales: '/sales'
    },
    build: ({ customers = [], sales = [] }) => {
      const dni = customers.filter((customer) => normalize(customer.docType) === 'dni').length;
      const ruc = customers.filter((customer) => normalize(customer.docType) === 'ruc').length;
      const withDiscount = customers.filter((customer) => toNumber(customer.preferredDiscount) > 0);
      const buyers = new Set(sales.map((sale) => sale.clientDocNumberSnapshot).filter(Boolean)).size;

      return {
        kpis: [
          { label: 'Clientes registrados', value: customers.length, hint: `${buyers} con compras`, icon: Users, tone: 'blue' },
          { label: 'Clientes DNI', value: dni, hint: 'Personas naturales', icon: ClipboardList, tone: 'slate' },
          { label: 'Clientes RUC', value: ruc, hint: 'Empresas', icon: Briefcase, tone: 'orange' },
          { label: 'Con descuento', value: withDiscount.length, hint: 'Preferencial activo', icon: DollarSign, tone: 'green' }
        ],
        tableTitle: 'Clientes recientes',
        columns: ['Cliente', 'Documento', 'Telefono', 'Descuento'],
        rows: latest(customers, 'createdAt'),
        renderRow: (customer) => [
          customer.name,
          `${String(customer.docType ?? '').toUpperCase()} ${customer.docNumber ?? ''}`,
          customer.phone || 'Sin telefono',
          `${number.format(toNumber(customer.preferredDiscount))}%`
        ]
      };
    }
  },
  '/dashboard/resumen-proveedores': {
    title: 'Resumen de Proveedores',
    subtitle: 'KPIs de abastecimiento y proveedores activos',
    icon: Truck,
    apiEndpoint: '/dashboard/resumen/proveedores',
    endpoints: {
      suppliers: '/suppliers',
      products: '/products',
      orders: '/orders'
    },
    build: ({ suppliers = [], products = [], orders = [] }) => {
      const activeSuppliers = suppliers.filter((supplier) => isActive(supplier.active));
      const suppliersWithProducts = new Set(products.map((product) => product.supplierNameSnapshot).filter(Boolean)).size;

      return {
        kpis: [
          { label: 'Proveedores activos', value: activeSuppliers.length, hint: `${suppliers.length} registrados`, icon: Truck, tone: 'blue' },
          { label: 'Con productos', value: suppliersWithProducts, hint: 'Abastecimiento vinculado', icon: Package, tone: 'green' },
          { label: 'Ordenes pendientes', value: getStatusCount(orders, 'pendiente'), hint: 'Por gestionar', icon: ClipboardList, tone: 'orange' },
          { label: 'Ordenes recibidas', value: getStatusCount(orders, 'recibido'), hint: 'Cerradas en compras', icon: ShieldCheck, tone: 'slate' }
        ],
        tableTitle: 'Proveedores recientes',
        columns: ['Proveedor', 'RUC', 'Contacto', 'Estado'],
        rows: latest(suppliers, 'createdAt'),
        renderRow: (supplier) => [
          supplier.name,
          supplier.ruc || 'Sin RUC',
          supplier.contact || supplier.phone || 'Sin contacto',
          isActive(supplier.active) ? 'Activo' : 'Inactivo'
        ]
      };
    }
  },
  '/dashboard/resumen-pedidos-compra': {
    title: 'Resumen de Pedidos de Compra',
    subtitle: 'KPIs de ordenes, prioridad y unidades solicitadas',
    icon: ClipboardList,
    apiEndpoint: '/dashboard/resumen/pedidos-compra',
    endpoints: {
      orders: '/orders'
    },
    build: ({ orders = [] }) => {
      const totalUnits = sumBy(orders, (order) => order.totalUnits);
      const urgent = orders.filter((order) => ['alta', 'urgente'].includes(normalize(order.priority))).length;

      return {
        kpis: [
          { label: 'Ordenes totales', value: orders.length, hint: 'Pedidos de compra', icon: ClipboardList, tone: 'blue' },
          { label: 'Pendientes', value: getStatusCount(orders, 'pendiente'), hint: 'Aun no recibidas', icon: AlertTriangle, tone: 'orange' },
          { label: 'Recibidas', value: getStatusCount(orders, 'recibido'), hint: 'Completadas', icon: ShieldCheck, tone: 'green' },
          { label: 'Unidades solicitadas', value: number.format(totalUnits), hint: `${urgent} prioridad alta`, icon: Package, tone: 'slate' }
        ],
        tableTitle: 'Ultimas ordenes',
        columns: ['Proveedor', 'Estado', 'Prioridad', 'Unidades'],
        rows: latest(orders, 'orderedAt'),
        renderRow: (order) => [
          order.supplierNameSnapshot || 'Proveedor',
          order.status || 'Sin estado',
          order.priority || 'Media',
          number.format(toNumber(order.totalUnits))
        ]
      };
    }
  },
  '/dashboard/resumen-almacen': {
    title: 'Resumen de Almacen',
    subtitle: 'KPIs de movimientos, reposicion y control operativo',
    icon: Boxes,
    apiEndpoint: '/dashboard/resumen/almacen',
    endpoints: {
      movements: '/stock-movements',
      products: '/products'
    },
    build: ({ movements = [], products = [] }) => {
      const entries = movements.filter((movement) => toNumber(movement.delta) > 0);
      const exits = movements.filter((movement) => toNumber(movement.delta) < 0);
      const adjusted = movements.filter((movement) => normalize(movement.movementType).includes('ajuste'));
      const productsMoved = new Set(movements.map((movement) => movement.productNameSnapshot).filter(Boolean)).size;

      return {
        kpis: [
          { label: 'Movimientos', value: movements.length, hint: `${productsMoved} productos movidos`, icon: ClipboardList, tone: 'blue' },
          { label: 'Entradas', value: entries.length, hint: 'Incrementos de stock', icon: Package, tone: 'green' },
          { label: 'Salidas', value: exits.length, hint: 'Descuentos de stock', icon: AlertTriangle, tone: 'orange' },
          { label: 'Productos activos', value: products.filter((product) => isActive(product.active)).length, hint: `${adjusted.length} ajustes`, icon: Boxes, tone: 'slate' }
        ],
        tableTitle: 'Ultimos movimientos',
        columns: ['Producto', 'Tipo', 'Delta', 'Stock final'],
        rows: latest(movements, 'occurredAt'),
        renderRow: (movement) => [
          movement.productNameSnapshot || 'Producto',
          movement.movementType || 'Movimiento',
          `${number.format(toNumber(movement.delta))} ${movement.unitSnapshot ?? ''}`,
          number.format(toNumber(movement.stockAfter))
        ]
      };
    }
  },
  '/dashboard/resumen-empleados': {
    title: 'Resumen de Empleados',
    subtitle: 'KPIs de personal, asistencia y planillas',
    icon: Briefcase,
    apiEndpoint: '/dashboard/resumen/empleados',
    endpoints: {
      employees: '/employees',
      attendance: '/attendance',
      slips: '/slips'
    },
    build: ({ employees = [], attendance = [], slips = [] }) => {
      const activeEmployees = employees.filter((employee) => isActive(employee.active));
      const presentToday = employees.filter((employee) => employee.attendanceToday === true).length;
      const payroll = sumBy(slips, (slip) => slip.netPay ?? slip.totalPay ?? slip.amount);

      return {
        kpis: [
          { label: 'Empleados activos', value: activeEmployees.length, hint: `${employees.length} registrados`, icon: Briefcase, tone: 'blue' },
          { label: 'Asistencia hoy', value: presentToday, hint: 'Marcados como presentes', icon: ShieldCheck, tone: 'green' },
          { label: 'Marcaciones', value: attendance.length, hint: 'Historial cargado', icon: ClipboardList, tone: 'slate' },
          { label: 'Boletas emitidas', value: slips.length, hint: currency.format(payroll), icon: DollarSign, tone: 'orange' }
        ],
        tableTitle: 'Equipo registrado',
        columns: ['Empleado', 'Rol', 'Estado hoy', 'Jornal'],
        rows: activeEmployees.slice(0, 6),
        renderRow: (employee) => [
          employee.name,
          employee.role || 'Sin rol',
          employee.todayStatus || (employee.attendanceToday ? 'Presente' : 'Sin marca'),
          currency.format(toNumber(employee.payPerDay))
        ]
      };
    }
  },
  '/dashboard/resumen-usuarios-roles': {
    title: 'Resumen de Usuarios y Roles',
    subtitle: 'KPIs de cuentas, roles y estado de acceso',
    icon: ShieldCheck,
    apiEndpoint: '/dashboard/resumen/usuarios-roles',
    endpoints: {
      users: '/users',
      employees: '/employees'
    },
    build: ({ users = [], employees = [] }) => {
      const activeUsers = users.filter((user) => normalize(user.status) === 'active' || user.active === true);
      const blockedUsers = users.filter((user) => ['blocked', 'inactive'].includes(normalize(user.status)));
      const roles = new Set(users.map((user) => user.role).filter(Boolean)).size;

      return {
        kpis: [
          { label: 'Usuarios', value: users.length, hint: `${activeUsers.length} activos`, icon: Users, tone: 'blue' },
          { label: 'Roles', value: roles, hint: 'Perfiles distintos', icon: ShieldCheck, tone: 'green' },
          { label: 'Bloqueados/inactivos', value: blockedUsers.length, hint: 'Revisar accesos', icon: AlertTriangle, tone: blockedUsers.length ? 'red' : 'slate' },
          { label: 'Empleados', value: employees.length, hint: 'Base vinculable', icon: Briefcase, tone: 'orange' }
        ],
        tableTitle: 'Usuarios registrados',
        columns: ['Usuario', 'Rol', 'Estado', 'Ultimo acceso'],
        rows: users.slice(0, 6),
        renderRow: (user) => [
          user.username,
          user.role || 'Sin rol',
          user.status || (user.active ? 'active' : 'inactive'),
          user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleDateString('es-PE') : 'Sin acceso'
        ]
      };
    }
  }
};

const toneStyles = {
  blue: { color: '#003471', background: '#e9f2fd' },
  orange: { color: '#ff6b00', background: '#fff1e8' },
  green: { color: '#16794c', background: '#e9f8ef' },
  red: { color: '#b42318', background: '#fff0ee' },
  slate: { color: '#475569', background: '#f1f5f9' }
};

export default function DashboardPlaceholder() {
  const location = useLocation();
  const config = moduleDetails[location.pathname] ?? moduleDetails['/dashboard/resumen-inventario'];
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasPartialError, setHasPartialError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadModuleData() {
      setLoading(true);
      setHasPartialError(false);

      const dashboardResult = await fetchEndpoint(config.apiEndpoint);
      if (!alive) return;

      if (!dashboardResult.failed) {
        setPayload(dashboardResult.data);
        setHasPartialError(false);
        setLoading(false);
        return;
      }

      const entries = Object.entries(config.endpoints);
      const results = await Promise.all(
        entries.map(async ([key, endpoint]) => {
          const result = await fetchEndpoint(endpoint);
          return [key, result.data, result.failed];
        })
      );

      if (!alive) return;
      const nextPayload = Object.fromEntries(results.map(([key, data]) => [key, data]));
      setPayload(nextPayload);
      setHasPartialError(results.some(([, , failed]) => failed));
      setLoading(false);
    }

    loadModuleData();
    return () => {
      alive = false;
    };
  }, [config]);

  const summary = useMemo(() => {
    if (payload?.kpis && payload?.columns && payload?.rows) {
      return payload;
    }

    const normalizedPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, asArray(value)])
    );
    return config.build(normalizedPayload);
  }, [config, payload]);

  const PageIcon = config.icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title={config.title} subtitle={config.subtitle} />

      {hasPartialError && (
        <div className="dashboard-warning">
          Algunos KPIs no pudieron cargarse porque su endpoint aun no responde.
        </div>
      )}

      <section className="dashboard-kpi-grid" aria-busy={loading}>
        {summary.kpis.map((kpi) => {
          const Icon = typeof kpi.icon === 'string' ? iconMap[kpi.icon] ?? ClipboardList : kpi.icon;
          const style = toneStyles[kpi.tone] ?? toneStyles.blue;

          return (
            <article className="dashboard-kpi-card" key={kpi.label}>
              <div className="dashboard-kpi-icon" style={style}>
                <Icon size={20} />
              </div>
              <div>
                <p>{kpi.label}</p>
                <strong>{loading ? '...' : kpi.value}</strong>
                <span>{kpi.hint}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="luxury-card dashboard-summary-table">
        <div className="dashboard-table-header">
          <h2>{summary.tableTitle}</h2>
          <span>{loading ? 'Cargando' : `${summary.rows.length} registros`}</span>
        </div>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                {summary.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={summary.columns.length}>Cargando KPIs del submodulo...</td>
                </tr>
              ) : summary.rows.length ? (
                summary.rows.map((row, rowIndex) => (
                  <tr key={row.id ?? rowIndex}>
                    {(summary.renderRow ? summary.renderRow(row) : row).map((cell, cellIndex) => (
                      <td key={`${row.id ?? rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={summary.columns.length}>No hay registros para mostrar en este resumen.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
