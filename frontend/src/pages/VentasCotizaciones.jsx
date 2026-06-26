import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FileText, Calendar, User, Trash2, ArrowRight, Eye, X } from 'lucide-react';

export default function VentasCotizaciones() {
  const [quotations, setQuotations] = useState([]);
  const [selectedCot, setSelectedCot] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('inventory_quotations');
    if (stored) {
      setQuotations(JSON.parse(stored));
    }
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar esta cotización?')) {
      const updated = quotations.filter(q => q.id !== id);
      setQuotations(updated);
      localStorage.setItem('inventory_quotations', JSON.stringify(updated));
    }
  };

  const handleConvertToSale = (cot, e) => {
    if (e) e.stopPropagation();
    
    // Save items to localStorage so Ventas POS can read them on mount
    localStorage.setItem('pos_cart_pending', JSON.stringify(cot.items));
    localStorage.setItem('pos_customer_pending', JSON.stringify(cot.customer));
    
    alert(`Cargando proforma ${cot.docNumber} en el carrito del Punto de Venta POS...`);
    
    // Redirect to POS Sales page
    navigate('/ventas/pos');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleOpenDetails = (cot) => {
    setSelectedCot(cot);
    setShowDetailModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Cotizaciones / Proformas" subtitle="Emisión y administración de presupuestos sin reserva de inventario" />

      {quotations.length === 0 ? (
        <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--accent)' }} />
          <p style={{ fontWeight: '600', fontSize: '1rem' }}>No hay cotizaciones guardadas aún.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Puedes emitir una cotización seleccionando "Cotización" como Tipo de Operación en el Punto de Venta (POS).</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {quotations.map((cot) => (
            <div 
              key={cot.id}
              className="luxury-card interactive"
              onClick={() => handleOpenDetails(cot)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left'
              }}
            >
              {/* Decorative top border */}
              <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent)' }} />
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(0,52,113,0.06)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      PROFORMA
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {cot.docNumber}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(cot.id, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Eliminar cotización"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} /> {formatDate(cot.date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <User size={12} /> {cot.customer.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                    {cot.customer.docType}: {cot.customer.docNumber}
                  </span>
                </div>

                {/* Items summary */}
                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.02)', fontSize: '0.75rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase', fontSize: '0.65rem' }}>Items Cotizados:</div>
                  {cot.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: 'var(--text-primary)' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                        {it.name}
                      </span>
                      <strong>x${parseFloat(it.qty).toFixed(0)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Importe Estimado</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                    S/ {parseFloat(cot.total).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={(e) => handleConvertToSale(cot, e)}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent) 0%, #0056b3 100%)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(0, 52, 113, 0.15)',
                    cursor: 'pointer'
                  }}
                >
                  Confirmar Venta <ArrowRight size={12} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedCot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)', fontWeight: '800' }}>
                Resumen de Proforma {selectedCot.docNumber}
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
              <div><strong>Cliente:</strong> {selectedCot.customer.name}</div>
              <div><strong>Documento:</strong> {selectedCot.customer.docType} {selectedCot.customer.docNumber}</div>
              <div><strong>Fecha de Creación:</strong> {formatDate(selectedCot.date)}</div>
              <div><strong>Estado:</strong> <span style={{ color: 'var(--warning)', fontWeight: '800' }}>PENDIENTE DE CONFIRMACIÓN</span></div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '4px' }}>
                ℹ️ Esta cotización no ha reservado inventario. Confirmar la venta validará el stock actual del Punto de Venta.
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#0a1629', marginBottom: '0.4rem' }}>
                Artículos Cotizados
              </h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Descripción</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '60px' }}>Cant</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', width: '80px' }}>Precio</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right', width: '80px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCot.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{it.name}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>{parseFloat(it.qty).toFixed(0)}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>S/ {parseFloat(it.price).toFixed(2)}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontWeight: '600' }}>S/ {(it.qty * it.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '1.2rem' }}>
              Total Proforma: S/ {parseFloat(selectedCot.total).toFixed(2)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
              <button 
                onClick={() => handleConvertToSale(selectedCot)}
                className="btn-premium" 
                style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Cargar en POS <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
