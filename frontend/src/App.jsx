import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { SidebarToggleProvider } from './context/SidebarToggleContext';
import Dashboard from './pages/Dashboard';
import ResumenInventario from './pages/temporal/ResumenInventario';
import ResumenVentas from './pages/temporal/ResumenVentas';
import ResumenClientes from './pages/temporal/ResumenClientes';
import ResumenProveedores from './pages/temporal/ResumenProveedores';
import ResumenPedidos from './pages/temporal/ResumenPedidos';
import ResumenEmpleados from './pages/temporal/ResumenEmpleados';
import ResumenUsuariosRoles from './pages/temporal/ResumenUsuariosRoles';
import Ventas from './pages/Ventas';
import VentasHistorial from './pages/VentasHistorial';
import VentasCotizaciones from './pages/VentasCotizaciones';
import VentasPedidos from './pages/VentasPedidos';
import VentasDespachos from './pages/VentasDespachos';
import VentasDevoluciones from './pages/VentasDevoluciones';
import VentasGarantias from './pages/VentasGarantias';
import Inventario from './pages/Inventario';
import StockEnVivo from './pages/StockEnVivo';
import Movimientos from './pages/Movimientos';
import Alertas from './pages/Alertas';
import Mermas from './pages/Mermas';
import Kardex from './pages/Kardex';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import OrdenesCompra from './pages/OrdenesCompra';
import Empleados from './pages/Empleados';
import Asistencia from './pages/Asistencia';
import Boletas from './pages/Boletas';
import Login from './pages/Login';
import api from './services/api';
import PanelPermisos from './pages/PanelPermisos';

const ROUTE_PERMISSIONS = {
  '/': 'dashboard:home',
  '/dashboard/resumen-inventario': 'dashboard:inventario',
  '/dashboard/resumen-ventas': 'dashboard:ventas',
  '/dashboard/resumen-clientes': 'clientes',
  '/dashboard/resumen-proveedores': 'proveedores',
  '/dashboard/resumen-pedidos-compra': 'ordenes-compra',
  '/dashboard/resumen-empleados': 'rrhh:empleados',
  '/dashboard/resumen-usuarios-roles': 'dashboard:usuarios',
  '/panel-permisos': 'seguridad:panel-permisos',
  '/ventas/pos': 'ventas:pos',
  '/ventas/historial': 'ventas:historial',
  '/ventas/cotizaciones': 'ventas:cotizaciones',
  '/ventas/pedidos': 'ventas:pedidos',
  '/ventas/despachos': 'ventas:pedidos',
  '/ventas/devoluciones': 'ventas:devoluciones',
  '/ventas/garantias': 'ventas:devoluciones',
  '/inventario/catalogo': 'inventario:catalogo',
  '/inventario/stock-en-vivo': 'inventario:stock',
  '/inventario/movimientos': 'inventario:movimientos',
  '/inventario/alertas': 'inventario:alertas',
  '/inventario/mermas': 'inventario:kardex',
  '/inventario/kardex': 'inventario:kardex',
  '/clientes': 'clientes',
  '/proveedores': 'proveedores',
  '/ordenes-compra': 'ordenes-compra',
  '/rrhh/empleados': 'rrhh:empleados',
  '/rrhh/asistencia': 'rrhh:asistencia',
  '/rrhh/boletas': 'rrhh:boletas',
};

const readStoredToken = () => {
  const storedToken = localStorage.getItem('token');
  if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
    return null;
  }
  return storedToken;
};

const readStoredUser = () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('current_user') || 'null');
    if (!storedUser || !storedUser.username || !storedUser.role) {
      localStorage.removeItem('current_user');
      return null;
    }
    return storedUser;
  } catch {
    localStorage.removeItem('current_user');
    return null;
  }
};

const isSmallViewport = () => (
  typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches
);

const getInitialSidebarCollapsed = () => {
  if (isSmallViewport()) return true;

  const saved = localStorage.getItem('sidebar_collapsed');
  return saved ? JSON.parse(saved) : false;
};

function AccessDenied() {
  return (
    <div className="luxury-card" style={{ maxWidth: 720, margin: '3rem auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--accent)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Acceso restringido</h1>
      <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
        Tu usuario no tiene permiso para abrir este módulo. Solicita acceso desde Usuarios y Roles.
      </p>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(readStoredToken);
  const [currentUser, setCurrentUser] = useState(readStoredUser);
  const [sessionLoading, setSessionLoading] = useState(() => Boolean(readStoredToken()) && !readStoredUser());
  const [isCollapsed, setIsCollapsed] = useState(getInitialSidebarCollapsed);
  const [isMobileShell, setIsMobileShell] = useState(isSmallViewport);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar_collapsed', JSON.stringify(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    const applyViewportMode = (mobile) => {
      setIsMobileShell(mobile);
      if (mobile) setIsCollapsed(true);
    };

    applyViewportMode(mediaQuery.matches);

    const handleViewportChange = (event) => applyViewportMode(event.matches);
    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  useEffect(() => {
    if (!token || currentUser) {
      return;
    }

    let cancelled = false;
    const hydrateSession = async () => {
      try {
        const session = await api.get('/auth/me');
        if (cancelled) return;
        const userSession = {
          userId: session.userId,
          username: session.username,
          role: session.role,
          employeeId: session.employeeId,
          permissions: session.permissions || [],
        };
        localStorage.setItem('current_user', JSON.stringify(userSession));
        setCurrentUser(userSession);
      } catch {
        if (cancelled) return;
        localStorage.removeItem('token');
        localStorage.removeItem('current_user');
        setToken(null);
        setCurrentUser(null);
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    };

    hydrateSession();
    return () => {
      cancelled = true;
    };
  }, [token, currentUser]);

  const hasPermission = (permissionId) => {
    if (!permissionId) return true;
    if (!currentUser) return false;
    if (String(currentUser.role || '').toUpperCase() === 'ADMIN') return true;
    return (currentUser.permissions || []).includes(permissionId);
  };

  const guard = (path, element) => (
    hasPermission(ROUTE_PERMISSIONS[path]) ? element : <AccessDenied />
  );

  if (!token) {
    return <Login onLoginSuccess={(session) => {
      localStorage.setItem('token', session.token);
      localStorage.setItem('current_user', JSON.stringify({
        userId: session.userId,
        username: session.username,
        role: session.role,
        employeeId: session.employeeId,
        permissions: session.permissions || [],
      }));
      setCurrentUser({
        userId: session.userId,
        username: session.username,
        role: session.role,
        employeeId: session.employeeId,
        permissions: session.permissions || [],
      });
      setToken(session.token);
    }} />;
  }

  if (sessionLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: 'var(--accent)', fontWeight: 800 }}>
        Validando sesión...
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileShell ? 'mobile-shell' : ''}`}>
        <SidebarToggleProvider value={{ isCollapsed, toggleSidebar }}>
          {/* Navigation Sidebar */}
          <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
          {isMobileShell && !isCollapsed ? (
            <button
              type="button"
              className="sidebar-scrim"
              aria-label="Cerrar menu"
              onClick={toggleSidebar}
            />
          ) : null}

          {/* Main Content wrapper */}
          <main className="main-wrapper">
            <Routes>
            {/* Dashboard and submodules */}
            <Route path="/" element={guard('/', <Dashboard />)} />
            <Route path="/dashboard/resumen-inventario" element={guard('/dashboard/resumen-inventario', <ResumenInventario />)} />
            <Route path="/dashboard/resumen-ventas" element={guard('/dashboard/resumen-ventas', <ResumenVentas />)} />
            <Route path="/dashboard/resumen-clientes" element={guard('/dashboard/resumen-clientes', <ResumenClientes />)} />
            <Route path="/dashboard/resumen-proveedores" element={guard('/dashboard/resumen-proveedores', <ResumenProveedores />)} />
            <Route path="/dashboard/resumen-pedidos-compra" element={guard('/dashboard/resumen-pedidos-compra', <ResumenPedidos />)} />
            <Route path="/dashboard/resumen-empleados" element={guard('/dashboard/resumen-empleados', <ResumenEmpleados />)} />
            <Route path="/dashboard/resumen-usuarios-roles" element={guard('/dashboard/resumen-usuarios-roles', <ResumenUsuariosRoles />)} />
            <Route path="/panel-permisos" element={guard('/panel-permisos', <PanelPermisos />)} />

            {/* POS Sales and Submodules */}
            <Route path="/ventas" element={<Navigate to="/ventas/pos" replace />} />
            <Route path="/ventas/pos" element={guard('/ventas/pos', <Ventas />)} />
            <Route path="/ventas/historial" element={guard('/ventas/historial', <VentasHistorial />)} />
            <Route path="/ventas/cotizaciones" element={guard('/ventas/cotizaciones', <VentasCotizaciones />)} />
            <Route path="/ventas/pedidos" element={guard('/ventas/pedidos', <VentasPedidos />)} />
            <Route path="/ventas/despachos" element={guard('/ventas/despachos', <VentasDespachos />)} />
            <Route path="/ventas/devoluciones" element={guard('/ventas/devoluciones', <VentasDevoluciones />)} />
            <Route path="/ventas/garantias" element={guard('/ventas/garantias', <VentasGarantias />)} />

            {/* Inventory Sub-routes */}
            <Route path="/inventario" element={<Navigate to="/inventario/catalogo" replace />} />
            <Route path="/inventario/catalogo" element={guard('/inventario/catalogo', <Inventario />)} />
            <Route path="/inventario/stock-en-vivo" element={guard('/inventario/stock-en-vivo', <StockEnVivo />)} />
            <Route path="/inventario/movimientos" element={guard('/inventario/movimientos', <Movimientos />)} />
            <Route path="/inventario/alertas" element={guard('/inventario/alertas', <Alertas />)} />
            <Route path="/inventario/mermas" element={guard('/inventario/mermas', <Mermas />)} />
            <Route path="/inventario/kardex" element={guard('/inventario/kardex', <Kardex />)} />

            {/* Operations */}
            <Route path="/clientes" element={guard('/clientes', <Clientes />)} />
            <Route path="/proveedores" element={guard('/proveedores', <Proveedores />)} />
            <Route path="/ordenes-compra" element={guard('/ordenes-compra', <OrdenesCompra />)} />

            {/* Human Resources */}
            <Route path="/rrhh/empleados" element={guard('/rrhh/empleados', <Empleados />)} />
            <Route path="/rrhh/asistencia" element={guard('/rrhh/asistencia', <Asistencia />)} />
            <Route path="/rrhh/boletas" element={guard('/rrhh/boletas', <Boletas />)} />
            </Routes>
          </main>
        </SidebarToggleProvider>
      </div>
    </Router>
  );
}
