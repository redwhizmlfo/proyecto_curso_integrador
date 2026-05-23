import React from 'react';

export default function Header({ title, subtitle = "Sistema de Gestión de Ventas Avanzado" }) {
  return (
    <header className="header">
      <div>
        <h1 className="title-gradient">{title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{subtitle}</p>
      </div>
      <div className="user-profile luxury-card" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Admin User</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: '700', letterSpacing: '1px' }}>GERENTE</div>
        </div>
        <img 
          src="https://ui-avatars.com/api/?name=Admin+User&background=00f2ff&color=000&bold=true" 
          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--accent)' }} 
          alt="Avatar"
        />
      </div>
    </header>
  );
}
