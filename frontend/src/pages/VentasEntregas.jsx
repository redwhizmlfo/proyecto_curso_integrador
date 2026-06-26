import React from 'react';
import Header from '../components/Header';

export default function VentasEntregas() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Seguimiento y Entregas" subtitle="Logística de despachos y estado de envíos a clientes" />
      <div className="luxury-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Módulo de Seguimiento y Entregas en desarrollo.</p>
      </div>
    </div>
  );
}
