import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  ChevronUp,
  Package,
  TrendingUp,
  History,
  Menu,
  ClipboardList,
  ShieldCheck,
  ReceiptText,
  FileClock,
  Send,
  RotateCcw,
  BadgeCheck
} from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const createSectionsState = (openSection = 'dashboard') => ({
    dashboard: openSection === 'dashboard',
    ventas: openSection === 'ventas',
    inventario: openSection === 'inventario',
    almacen: openSection === 'almacen',
    operaciones: openSection === 'operaciones',
    rrhh: openSection === 'rrhh',
  });

  const getActiveSection = () => {
    if (currentPath.startsWith('/ventas')) return 'ventas';
    if (currentPath.startsWith('/inventario/mermas') || currentPath.startsWith('/inventario/kardex')) return 'almacen';
    if (currentPath.startsWith('/inventario')) return 'inventario';
    if (currentPath.startsWith('/rrhh') || currentPath === '/panel-permisos') return 'rrhh';
    return 'dashboard';
  };

  const [sections, setSections] = useState(() => createSectionsState(getActiveSection()));

  const toggleSection = (section) => {
    setSections((prev) => (
      prev[section]
        ? createSectionsState(null)
        : createSectionsState(section)
    ));
  };

  const handleCategoryClick = (sectionName) => {
    if (isCollapsed) {
      onToggleCollapse(); // Expand sidebar
      setSections(createSectionsState(sectionName));
    } else {
      toggleSection(sectionName);
    }
  };

  const isDashboardActive = currentPath === '/' || currentPath.startsWith('/dashboard');
  const isVentasActive = currentPath.startsWith('/ventas');
  const isInventarioActive = currentPath.startsWith('/inventario') && !currentPath.startsWith('/inventario/mermas') && !currentPath.startsWith('/inventario/kardex');
  const isAlmacenActive = currentPath.startsWith('/inventario/mermas') || currentPath.startsWith('/inventario/kardex');
  const isRrhhActive = currentPath.startsWith('/rrhh');
  
  if (isCollapsed) {
    return (
      <nav className="sidebar collapsed">
        {/* Collapsed Logo */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem',
          borderBottom: '1px solid var(--glass-border)', 
          paddingBottom: '1.5rem',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--accent)' }}>M</span>
          <button 
            onClick={onToggleCollapse}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--accent)', 
              padding: '6px', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Expandir menú"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Collapsed Items List */}
        <ul className="nav-links" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', listStyle: 'none', padding: 0 }}>
          {/* Dashboard */}
          <li title="Dashboard">
            <button 
              onClick={() => handleCategoryClick('dashboard')}
              className={`nav-item-collapsed ${isDashboardActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
            </button>
          </li>

          {/* Ventas */}
          <li title="Ventas">
            <button 
              onClick={() => handleCategoryClick('ventas')}
              className={`nav-item-collapsed ${isVentasActive ? 'active' : ''}`}
            >
              <ShoppingCart size={20} />
            </button>
          </li>

          {/* Inventario Activo */}
          <li title="Inventario Activo">
            <button 
              onClick={() => handleCategoryClick('inventario')}
              className={`nav-item-collapsed ${isInventarioActive ? 'active' : ''}`}
            >
              <Boxes size={20} />
            </button>
          </li>

          {/* Pedidos */}
          <li title="Pedidos">
            <NavLink 
              to="/ordenes-compra" 
              className={({ isActive }) => `nav-item-collapsed ${isActive ? 'active' : ''}`}
            >
              <FileText size={20} />
            </NavLink>
          </li>

          {/* Clientes */}
          <li title="Clientes">
            <NavLink 
              to="/clientes" 
              className={({ isActive }) => `nav-item-collapsed ${isActive ? 'active' : ''}`}
            >
              <Users size={20} />
            </NavLink>
          </li>

          {/* Proveedores */}
          <li title="Proveedores">
            <NavLink 
              to="/proveedores" 
              className={({ isActive }) => `nav-item-collapsed ${isActive ? 'active' : ''}`}
            >
              <Truck size={20} />
            </NavLink>
          </li>

          {/* Avanzado Almacén */}
          <li title="Avanzado Almacén">
            <button 
              onClick={() => handleCategoryClick('almacen')}
              className={`nav-item-collapsed ${isAlmacenActive ? 'active' : ''}`}
            >
              <Package size={20} />
            </button>
          </li>

          {/* Empleados */}
          <li title="Empleados">
            <button 
              onClick={() => handleCategoryClick('rrhh')}
              className={`nav-item-collapsed ${isRrhhActive ? 'active' : ''}`}
            >
              <Briefcase size={20} />
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="sidebar">
      <div className="logo" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        fontSize: '1.2rem', 
        paddingBottom: '0.8rem', 
        borderBottom: '1px solid var(--glass-border)', 
        marginBottom: '2rem', 
        fontWeight: '700', 
        letterSpacing: '0.5px',
        padding: '0 1.5rem 1.5rem 1.5rem'
      }}>
        <span>MEPS GROUP PERÚ</span>
        <button 
          onClick={onToggleCollapse} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}
          title="Colapsar menú"
        >
          <Menu size={18} />
        </button>
      </div>
      <ul className="nav-links">
        {/* Dashboard Collapsible Menu */}
        <li>
          <div 
            className="nav-category" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              margin: '0.5rem 1.5rem 0.5rem 1.5rem',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }} 
            onClick={() => toggleSection('dashboard')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
            {sections.dashboard ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          {sections.dashboard && (
            <div style={{ paddingLeft: '0.5rem' }}>
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <LayoutDashboard size={14} style={{ marginRight: '8px' }} />
                <span>Resumen General</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-inventario" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Boxes size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Resumen Inventario</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-ventas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShoppingCart size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Resumen Ventas</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-clientes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Resumen Clientes</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-proveedores" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Truck size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Resumen Proveedores</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-pedidos-compra" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ClipboardList size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Resumen Pedidos</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-empleados" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Briefcase size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Resumen Empleados</span>
              </NavLink>
              <NavLink to="/dashboard/resumen-usuarios-roles" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Usuarios y Roles</span>
              </NavLink>
            </div>
          )}
        </li>

        {/* Ventas Collapsible Menu */}
        <li>
          <div 
            className="nav-category" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              margin: '0.5rem 1.5rem 0.5rem 1.5rem',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }} 
            onClick={() => toggleSection('ventas')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={16} />
              <span>Ventas</span>
            </div>
            {sections.ventas ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          {sections.ventas && (
            <div style={{ paddingLeft: '0.5rem' }}>
              <NavLink to="/ventas/pos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ShoppingCart size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Ventas POS</span>
              </NavLink>
              <NavLink to="/ventas/historial" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <History size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Historial de Ventas</span>
              </NavLink>
              <NavLink to="/ventas/cotizaciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <ReceiptText size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Cotizaciones</span>
              </NavLink>
              <NavLink to="/ventas/pedidos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileClock size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Pedidos</span>
              </NavLink>
              <NavLink to="/ventas/despachos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Send size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Despachos</span>
              </NavLink>
              <NavLink to="/ventas/devoluciones" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <RotateCcw size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Devoluciones</span>
              </NavLink>
              <NavLink to="/ventas/garantias" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <BadgeCheck size={14} style={{ marginRight: '8px' }} />
                <span style={{ fontSize: '0.85rem' }}>Garantías</span>
              </NavLink>
            </div>
          )}
        </li>

        {/* Inventario Activo Collapsible Menu */}
        <li>
          <div 
            className="nav-category" 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer', 
              margin: '0.5rem 1.5rem 0.5rem 1.5rem',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }} 
            onClick={() => toggleSection('inventario')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {sections.inventario && (
                <span 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    backgroundColor: '#003471', // accent/blue dot color
                    borderRadius: '50%',
                    flexShrink: 0
                  }} 
                />
              )}
              <Boxes size={16} />
              <span>Inventario Activo</span>
            </div>
            {sections.inventario ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          {sections.inventario && (
            <div style={{ paddingLeft: '0.5rem' }}>
              <NavLink to="/inventario/catalogo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%', marginRight: '8px', flexShrink: 0 }} />
                    )}
                    <Package size={14} />
                    <span style={{ fontSize: '0.85rem' }}>Catálogo de Productos</span>
                  </>
                )}
              </NavLink>
              <NavLink to="/inventario/stock-en-vivo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%', marginRight: '8px', flexShrink: 0 }} />
                    )}
                    <TrendingUp size={14} />
                    <span style={{ fontSize: '0.85rem' }}>Stock en Vivo</span>
                  </>
                )}
              </NavLink>
              <NavLink to="/inventario/movimientos" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%', marginRight: '8px', flexShrink: 0 }} />
                    )}
                    <History size={14} />
                    <span style={{ fontSize: '0.85rem' }}>Movimientos</span>
                  </>
                )}
              </NavLink>
              <NavLink to="/inventario/alertas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span style={{ width: '6px', height: '6px', backgroundColor: 'currentColor', borderRadius: '50%', marginRight: '8px', flexShrink: 0 }} />
                    )}
                    <AlertTriangle size={14} />
                    <span style={{ fontSize: '0.85rem' }}>Alertas</span>
                  </>
                )}
              </NavLink>
            </div>
          )}
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

        {/* Empleados */}
        <li>
          <div className="nav-category" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => toggleSection('rrhh')}>
            <span>Empleados</span>
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
