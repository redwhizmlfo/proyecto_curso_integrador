import { LogOut, ShieldUser, User } from 'lucide-react';
import { useSidebarToggle } from '../context/SidebarToggleContext';

export default function Header({ title, subtitle = 'Sistema de Gestion de Ventas Avanzado', children }) {
  const { isCollapsed, toggleSidebar } = useSidebarToggle();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('current_user');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-title-group">
        <button
          type="button"
          className="sidebar-edge-toggle"
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
          title={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          <span className="sidebar-toggle-icon" aria-hidden="true">
            <span className="sidebar-toggle-line" />
            <span className="sidebar-toggle-line" />
            <span className="sidebar-toggle-line" />
          </span>
        </button>

        <div className="header-copy">
          <h1 className="title-gradient">{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-actions">
        {children}
        <div className="user-profile">
          <div className="user-profile-copy">
            <div>ADMIN USUARIO</div>
            <span><ShieldUser size={12} /> SUPER ADMIN</span>
          </div>

          <div className="user-avatar">
            <User size={18} />
          </div>

          <button className="logout-button" onClick={handleLogout} title="Cerrar sesion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
