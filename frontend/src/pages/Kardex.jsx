import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Filter, RefreshCw, Layers } from 'lucide-react';

export default function Kardex() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [prodList, moveList] = await Promise.all([
        api.get('/products'),
        api.get('/stock-movements')
      ]);
      setProducts(prodList.filter(p => p.isActive));
      setMovements(moveList);
      setError(null);
    } catch (err) {
      console.error('Error loading Kardex data:', err);
      setError('Servidor backend offline. Usando datos demo de Kardex.');
      // Demo Fallback
      setProducts([
        { id: '101', name: 'Martillo de Acero 16oz', barcode: '75010324' },
        { id: '102', name: 'Cemento Sol Tipo 1 (42.5kg)', barcode: '77502310' },
        { id: '103', name: 'Tornillo de Madera 2" (x100)', barcode: '84102941' }
      ]);
      setMovements([
        { id: 'm1', productId: '101', product_name_snapshot: 'Martillo de Acero 16oz', occurred_at: '2026-05-18T10:00:00Z', movement_type: 'perdida', delta: -1, stock_before: 13, stock_after: 12, detail: 'Reporte merma: Roto durante traslado', unit_snapshot: 'pza' },
        { id: 'm2', productId: '102', product_name_snapshot: 'Cemento Sol Tipo 1 (42.5kg)', occurred_at: '2026-05-17T15:00:00Z', movement_type: 'ingreso_stock', delta: 50, stock_before: 10, stock_after: 60, detail: 'Recepcion Orden Compra OC-4821', unit_snapshot: 'bolsa' },
        { id: 'm3', productId: '101', product_name_snapshot: 'Martillo de Acero 16oz', occurred_at: '2026-05-15T11:20:00Z', movement_type: 'venta', delta: -2, stock_before: 15, stock_after: 13, detail: 'Venta Boleta B001-00044', unit_snapshot: 'pza' },
        { id: 'm4', productId: '103', product_name_snapshot: 'Tornillo de Madera 2" (x100)', occurred_at: '2026-05-14T09:00:00Z', movement_type: 'alta_producto', delta: 45, stock_before: 0, stock_after: 45, detail: 'Stock Inicial de Producto', unit_snapshot: 'caja' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleProductFilterChange = async (productId) => {
    setSelectedProductId(productId);
    if (!productId) {
      // Reload all
      loadInitialData();
      return;
    }

    try {
      setLoading(true);
      const filtered = await api.get(`/stock-movements/product/${productId}`);
      setMovements(filtered);
    } catch (err) {
      console.warn('Failed filtering via backend, filtering locally.');
      // Local filter when offline
      const localData = [
        { id: 'm1', productId: '101', product_name_snapshot: 'Martillo de Acero 16oz', occurred_at: '2026-05-18T10:00:00Z', movement_type: 'perdida', delta: -1, stock_before: 13, stock_after: 12, detail: 'Reporte merma: Roto durante traslado', unit_snapshot: 'pza' },
        { id: 'm2', productId: '102', product_name_snapshot: 'Cemento Sol Tipo 1 (42.5kg)', occurred_at: '2026-05-17T15:00:00Z', movement_type: 'ingreso_stock', delta: 50, stock_before: 10, stock_after: 60, detail: 'Recepcion Orden Compra OC-4821', unit_snapshot: 'bolsa' },
        { id: 'm3', productId: '101', product_name_snapshot: 'Martillo de Acero 16oz', occurred_at: '2026-05-15T11:20:00Z', movement_type: 'venta', delta: -2, stock_before: 15, stock_after: 13, detail: 'Venta Boleta B001-00044', unit_snapshot: 'pza' },
        { id: 'm4', productId: '103', product_name_snapshot: 'Tornillo de Madera 2" (x100)', occurred_at: '2026-05-14T09:00:00Z', movement_type: 'alta_producto', delta: 45, stock_before: 0, stock_after: 45, detail: 'Stock Inicial de Producto', unit_snapshot: 'caja' }
      ];
      setMovements(localData.filter(m => m.productId === productId));
    } finally {
      setLoading(false);
    }
  };

  const getMovementBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'alta_producto':
        return 'badge-info';
      case 'ingreso_stock':
      case 'importacion':
      case 'anulacion_perdida':
        return 'badge-success';
      case 'venta':
      case 'perdida':
        return 'badge-danger';
      case 'edicion_stock':
      case 'ajuste_perdida':
      default:
        return 'badge-warning';
    }
  };

  const formatMovementTypeLabel = (type) => {
    const formatted = type?.replace('_', ' ');
    return formatted ? formatted.toUpperCase() : 'MOVIMIENTO';
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
      <Header title="Kardex de Inventario" subtitle="Auditoría cronológica de todos los movimientos de stock" />

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filter panel */}
      <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', padding: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
          <Filter size={16} /> <span>Filtrar por Producto:</span>
        </div>
        <div style={{ flexGrow: 1, minWidth: '250px' }}>
          <select 
            className="form-select" 
            value={selectedProductId}
            onChange={(e) => handleProductFilterChange(e.target.value)}
          >
            <option value="">-- Todos los Productos (Ver Todo) --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.barcode})</option>
            ))}
          </select>
        </div>
        <button 
          className="btn-secondary" 
          style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          onClick={() => handleProductFilterChange(selectedProductId)}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Audit table */}
      <div className="luxury-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} /> Auditoría del Kardex
        </h2>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Producto</th>
                <th>Tipo de Movimiento</th>
                <th style={{ textAlign: 'right' }}>Stock Anterior</th>
                <th style={{ textAlign: 'right' }}>Variación</th>
                <th style={{ textAlign: 'right' }}>Stock Posterior</th>
                <th>Detalles / Comentario</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se registran movimientos para este filtro.
                  </td>
                </tr>
              ) : (
                movements.map((move) => {
                  const deltaVal = move.delta;
                  const deltaText = deltaVal > 0 ? `+${deltaVal}` : `${deltaVal}`;
                  const deltaColor = deltaVal > 0 ? 'var(--success)' : 'var(--danger)';

                  return (
                    <tr key={move.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(move.occurred_at || move.created_at)}</td>
                      <td style={{ fontWeight: '600' }}>{move.product_name_snapshot || 'Producto'}</td>
                      <td>
                        <span className={`badge ${getMovementBadgeClass(move.movement_type)}`}>
                          {formatMovementTypeLabel(move.movement_type)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {move.stock_before} {move.unit_snapshot || 'und'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: deltaColor }}>
                        {deltaText} {move.unit_snapshot || 'und'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--accent)' }}>
                        {move.stock_after} {move.unit_snapshot || 'und'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{move.detail || '-'}</td>
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
