import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Construction, ArrowLeft, GitBranch } from 'lucide-react';

export default function DashboardPlaceholder() {
  const location = useLocation();
  
  // Resolve module title based on route path
  const getModuleDetails = (path) => {
    switch (path) {
      case '/dashboard/resumen-inventario':
        return { title: 'Resumen de Inventario', branch: 'feature/frontend-dashboard-inventario' };
      case '/dashboard/resumen-ventas':
        return { title: 'Resumen de Ventas', branch: 'feature/frontend-dashboard-ventas' };
      case '/dashboard/resumen-clientes':
        return { title: 'Resumen de Clientes', branch: 'feature/frontend-dashboard-clientes' };
      case '/dashboard/resumen-proveedores':
        return { title: 'Resumen de Proveedores', branch: 'feature/frontend-dashboard-proveedores' };
      case '/dashboard/resumen-pedidos-compra':
        return { title: 'Resumen de Pedidos de Compra', branch: 'feature/frontend-dashboard-pedidos' };
      case '/dashboard/resumen-almacen':
        return { title: 'Resumen de Almacén', branch: 'feature/frontend-dashboard-almacen' };
      case '/dashboard/resumen-empleados':
        return { title: 'Resumen de Empleados', branch: 'feature/frontend-dashboard-empleados' };
      case '/dashboard/resumen-usuarios-roles':
        return { title: 'Resumen de Usuarios y Roles', branch: 'feature/frontend-dashboard-usuarios-roles' };
      default:
        return { title: 'Submódulo de Dashboard', branch: 'feature/frontend-dashboard-submodule' };
    }
  };

  const { title, branch } = getModuleDetails(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <div className="header">
        <div>
          <h1 className="title-gradient">{title}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Módulo del Sistema de Control y Reportes</p>
        </div>
      </div>

      <div className="luxury-card" style={{ 
        background: '#ffffff', 
        border: '1px solid #cbd5e1', 
        borderRadius: '4px', 
        padding: '3rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
        marginTop: '1rem'
      }}>
        <div style={{ 
          background: '#e9f2fd', 
          color: '#003471', 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Construction size={30} />
        </div>

        <h2 style={{ color: '#0a1629', fontWeight: '800', fontSize: '1.4rem', margin: 0 }}>
          Módulo en Planificación
        </h2>
        
        <p style={{ color: '#5c6b73', fontSize: '0.95rem', maxWidth: '500px', margin: 0, lineHeight: '1.5' }}>
          La visualización y los reportes para <strong>{title}</strong> serán implementados en su propia rama dedicada de GitHub para mantener un historial limpio y ordenado de la aplicación.
        </p>

        <div style={{ 
          background: '#f8fafc', 
          border: '1px dashed #cbd5e1', 
          borderRadius: '4px', 
          padding: '0.8rem 1.5rem', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.6rem',
          fontSize: '0.85rem',
          color: '#003471',
          fontWeight: '700',
          fontFamily: 'monospace'
        }}>
          <GitBranch size={16} /> Rama GitHub: {branch}
        </div>

        <Link to="/" style={{ 
          textDecoration: 'none', 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: '#ff6b00', 
          fontWeight: '700', 
          fontSize: '0.9rem',
          marginTop: '1rem'
        }}>
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
