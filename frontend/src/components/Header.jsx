import React from 'react';
import { User } from 'lucide-react';

export default function Header({ title, subtitle = "Sistema de Gestión de Ventas Avanzado", children }) {
  return (
    <header className="header">
      <div>
        <h1 className="title-gradient">{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{subtitle}</p>
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
        </div>
      </div>
    </header>
  );
}
