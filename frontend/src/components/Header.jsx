import { User, LogOut } from 'lucide-react';
import { useSidebarToggle } from '../context/SidebarToggleContext';

export default function Header({ title, subtitle = "Sistema de Gestión de Ventas Avanzado", children }) {
  const { isCollapsed, toggleSidebar } = useSidebarToggle();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-title-group">
        <button
          type="button"
          className="sidebar-edge-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="sidebar-toggle-icon" aria-hidden="true">
            <span className="sidebar-toggle-line" />
            <span className="sidebar-toggle-line" />
            <span className="sidebar-toggle-line" />
          </span>
        </button>
        <div>
          <h1 className="title-gradient">{title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{subtitle}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {children}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '750', fontSize: '0.9rem', color: '#004B93', letterSpacing: '0.5px' }}>ADMIN USUARIO</div>
            <div style={{ fontSize: '0.75rem', color: '#8E8E93', fontWeight: '600', letterSpacing: '0.5px' }}>SUPER ADMIN</div>
          </div>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1.5px solid #004B93',
            display: 'grid',
            placeItems: 'center',
            color: '#004B93',
            background: '#ffffff'
          }}>
            <User size={18} />
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#dc2626',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              transition: 'all 0.2s'
            }}
            title="Cerrar Sesión"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
