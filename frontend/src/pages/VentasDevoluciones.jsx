import React from 'react';
import Header from '../components/Header';

export default function VentasDevoluciones() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Devoluciones" subtitle="Control de devoluciones de mercadería y emisión de Notas de Crédito" />
      <div className="luxury-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Módulo de Devoluciones en desarrollo.</p>
      </div>
    </div>
  );
}
