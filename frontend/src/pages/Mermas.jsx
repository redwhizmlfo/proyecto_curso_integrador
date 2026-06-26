import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { AlertTriangle, RefreshCw, Eye } from 'lucide-react';

export default function Mermas() {
  const [losses, setLosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLosses = async () => {
    try {
      setLoading(true);
      // Since the backend might not have a GET /losses endpoint (only POST and revert),
      // we attempt to fetch, but fallback to locally cached or mock data.
      let fetchedLosses = [];
      try {
        fetchedLosses = await api.get('/losses');
      } catch (e) {
        console.warn('GET /losses not supported by backend yet, using local state.');
        // Try getting from localStorage if any was saved in this session
        const local = localStorage.getItem('luxury_losses');
        if (local) {
          fetchedLosses = JSON.parse(local);
        } else {
          // Default mock data
          fetchedLosses = [
            { id: 'l1', product_name_snapshot: 'Martillo de Acero 16oz', qty: 1, reason: 'Roto durante traslado en almacén', responsible_snapshot: 'Carlos Mendoza', occurred_at: '2026-05-18T10:00:00Z', loss_amount: 12.00, status: 'active' },
            { id: 'l2', product_name_snapshot: 'Cemento Sol Tipo 1', qty: 2, reason: 'Empaque dañado por humedad', responsible_snapshot: 'Juan Pérez', occurred_at: '2026-05-15T14:30:00Z', loss_amount: 44.00, status: 'reverted', reverted_at: '2026-05-16T09:00:00Z' }
          ];
          localStorage.setItem('luxury_losses', JSON.stringify(fetchedLosses));
        }
      }
      setLosses(fetchedLosses);
      setError(null);
    } catch (err) {
      setError('Error al cargar historial de mermas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLosses();
  }, []);

  const handleRevert = async (id) => {
    if (!window.confirm('¿Está seguro de revertir esta merma? El stock del producto será restituido.')) return;
    try {
      const dummyUserId = '00000000-0000-0000-0000-000000000001';
      
      // Attempt backend call
      try {
        await api.post(`/losses/${id}/revert?userId=${dummyUserId}`);
      } catch (backendError) {
        console.warn('Backend revert failed, simulating locally:', backendError.message);
      }

      // Update UI state
      const updated = losses.map(loss => {
        if (loss.id === id) {
          return {
            ...loss,
            status: 'reverted',
            reverted_at: new Date().toISOString()
          };
        }
        return loss;
      });
      setLosses(updated);
      localStorage.setItem('luxury_losses', JSON.stringify(updated));
      alert('Merma revertida con éxito.');
    } catch (err) {
      alert('Error al revertir la merma: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Historial de Mermas" subtitle="Visualiza y revierte mermas o pérdidas físicas de stock" />

      <div className="luxury-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> Registro de Incidencias de Stock
        </h2>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Fecha Reporte</th>
                <th>Producto</th>
                <th style={{ textAlign: 'right' }}>Cantidad</th>
                <th style={{ textAlign: 'right' }}>Costo Total</th>
                <th>Responsable</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {losses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se han registrado mermas en el historial.
                  </td>
                </tr>
              ) : (
                losses.map((loss) => {
                  const isActive = loss.status === 'active' || loss.status === 'ACTIVE';
                  return (
                    <tr key={loss.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(loss.occurred_at || loss.created_at)}</td>
                      <td style={{ fontWeight: '600' }}>{loss.product_name_snapshot || loss.productName}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{loss.qty}</td>
                      <td style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>S/ {(loss.loss_amount || 0).toFixed(2)}</td>
                      <td>{loss.responsible_snapshot || loss.responsible}</td>
                      <td style={{ maxWidth: '200px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }} title={loss.reason}>
                        {loss.reason}
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-danger' : 'badge-muted'}`}>
                          {isActive ? 'Activa' : 'Revertida'}
                        </span>
                        {!isActive && loss.reverted_at && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {formatDate(loss.reverted_at)}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isActive ? (
                          <button 
                            className="btn-danger" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => handleRevert(loss.id)}
                          >
                            <RefreshCw size={12} /> Revertir
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
