import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Mermas from './pages/Mermas';
import Kardex from './pages/Kardex';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import OrdenesCompra from './pages/OrdenesCompra';
import Empleados from './pages/Empleados';
import Asistencia from './pages/Asistencia';
import Boletas from './pages/Boletas';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content wrapper */}
        <main className="main-wrapper">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* POS Sales */}
            <Route path="/ventas" element={<Ventas />} />

            {/* Inventory Sub-routes */}
            <Route path="/inventario" element={<Inventario />} />
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
