import React from 'react';
import Header from '../components/Header';

export default function VentasGarantias() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Garantías" subtitle="Consulta de validez de garantías de fábrica y gestión de servicio técnico" />
      <div className="luxury-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Módulo de Garantías en desarrollo.</p>
      </div>
    </div>
  );
}
