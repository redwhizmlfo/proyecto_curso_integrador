import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  RefreshCw,
  Users,
  Truck,
  FileText,
  Briefcase,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function Sidebar() {
  const [sections, setSections] = useState({
    almacen: true,
    operaciones: true,
    rrhh: true,
  });

  const toggleSection = (section) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <nav className="sidebar">
      <div className="logo" style={{ fontSize: '1.2rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem', fontWeight: '700', letterSpacing: '0.5px' }}>
        MEPS GROUP PERÚ
      </div>
      <ul className="nav-links">
        {/* Dashboard */}
        <li>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>
        </li>

        {/* POS */}
        <li>
          <NavLink to="/ventas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart />
            <span>Ventas</span>
          </NavLink>
        </li>

        {/* Inventario */}
        <li>
          <NavLink to="/inventario" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Boxes />
            <span>Inventario</span>
          </NavLink>
        </li>

        {/* Pedidos */}
        <li>
          <NavLink to="/ordenes-compra" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileText />
            <span>Pedidos</span>
          </NavLink>
        </li>

        {/* Clientes */}
        <li>
          <NavLink to="/clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users />
            <span>Clientes</span>
          </NavLink>
        </li>

        {/* Proveedores */}
        <li>
          <NavLink to="/proveedores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Truck />
            <span>Proveedores</span>
          </NavLink>
        </li>

        {/* Mermas & Kardex */}
        <li>
          <div className="nav-category" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('almacen')}>
            <span>Avanzado Almacén</span>
            {sections.almacen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          {sections.almacen && (
            <div style={{ paddingLeft: '0.5rem' }}>
              <NavLink to="/inventario/mermas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <AlertTriangle />
                <span>Mermas</span>
              </NavLink>
              <NavLink to="/inventario/kardex" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <RefreshCw />
                <span>Kardex</span>
              </NavLink>
            </div>
          )}
        </li>

        {/* Recursos Humanos */}
        <li>
          <div className="nav-category" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('rrhh')}>
            <span>Recursos Humanos</span>
            {sections.rrhh ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          {sections.rrhh && (
            <div style={{ paddingLeft: '0.5rem' }}>
              <NavLink to="/rrhh/empleados" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Briefcase />
                <span>Personal</span>
              </NavLink>
              <NavLink to="/rrhh/asistencia" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Calendar />
                <span>Asistencia</span>
              </NavLink>
              <NavLink to="/rrhh/boletas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <DollarSign />
                <span>Boletas de Pago</span>
              </NavLink>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
