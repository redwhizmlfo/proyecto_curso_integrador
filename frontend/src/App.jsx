import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
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

export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar_collapsed', JSON.stringify(newVal));
      return newVal;
    });
  };

  return (
    <Router>
      <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Navigation Sidebar */}
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />

        {/* Main Content wrapper */}
        <main className="main-wrapper">
          <Routes>
            {/* Dashboard and submodules */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard/resumen-inventario" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-ventas" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-clientes" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-proveedores" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-pedidos-compra" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-almacen" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-empleados" element={<DashboardPlaceholder />} />
            <Route path="/dashboard/resumen-usuarios-roles" element={<DashboardPlaceholder />} />

            {/* POS Sales and Submodules */}
            <Route path="/ventas" element={<Navigate to="/ventas/pos" replace />} />
            <Route path="/ventas/pos" element={<Ventas />} />
            <Route path="/ventas/historial" element={<VentasHistorial />} />
            <Route path="/ventas/cotizaciones" element={<VentasCotizaciones />} />
            <Route path="/ventas/pedidos" element={<VentasPedidos />} />
            <Route path="/ventas/despachos" element={<VentasDespachos />} />
            <Route path="/ventas/devoluciones" element={<VentasDevoluciones />} />
            <Route path="/ventas/garantias" element={<VentasGarantias />} />

            {/* Inventory Sub-routes */}
            <Route path="/inventario" element={<Navigate to="/inventario/catalogo" replace />} />
            <Route path="/inventario/catalogo" element={<Inventario />} />
            <Route path="/inventario/stock-en-vivo" element={<StockEnVivo />} />
            <Route path="/inventario/movimientos" element={<Movimientos />} />
            <Route path="/inventario/alertas" element={<Alertas />} />
            <Route path="/inventario/mermas" element={<Mermas />} />
            <Route path="/inventario/kardex" element={<Kardex />} />

            {/* Operations */}
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/ordenes-compra" element={<OrdenesCompra />} />

            {/* Human Resources */}
            <Route path="/rrhh/empleados" element={<Empleados />} />
            <Route path="/rrhh/asistencia" element={<Asistencia />} />
            <Route path="/rrhh/boletas" element={<Boletas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
