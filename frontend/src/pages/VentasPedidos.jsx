import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { FileText, Calendar, User, Trash2, Check, Eye, X } from 'lucide-react';

export default function VentasPedidos() {
  const [orders, setOrders] = useState([]);
  const [selectedPed, setSelectedPed] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadOrders = () => {
    const stored = localStorage.getItem('inventory_orders');
    if (stored) {
      setOrders(JSON.parse(stored));
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este pedido?')) {
      const updated = orders.filter(p => p.id !== id);
      setOrders(updated);
      localStorage.setItem('inventory_orders', JSON.stringify(updated));
    }
  };

  const handleConfirmDispatch = async (ped, e) => {
    if (e) e.stopPropagation();
    
    if (!window.confirm(`¿Confirmar despacho para el pedido ${ped.docNumber}? Esto validará y descontará stock real.`)) {
      return;
    }
    
    setLoading(true);
    try {
      // 1. Fetch latest models from backend to update stock correctly
      let latestModels = [];
      try {
        latestModels = await api.get('/modelos');
      } catch (err) {
        console.warn('Backend offline or error fetching models, using simulation.', err);
      }

      // 2. Decrement stock for each model item
      if (latestModels.length > 0) {
        for (const item of ped.items) {
          // Find model by ID or SKU
          const modelObj = latestModels.find(m => m.id === item.productId || m.sku === item.barcode);
          if (modelObj) {
            const newStock = Math.max(0, modelObj.stock - item.qty);
            await api.put(`/modelos/${modelObj.id}`, {
              ...modelObj,
              id_categoria: modelObj.categoria?.id,
              id_marca: modelObj.marca?.id,
              stock: newStock
            });
          }
        }
      }

      // 3. Save to inventory_dispatches in localStorage
      const dispatch = {
        id: `desp_${Date.now()}`,
        docNumber: ped.docNumber.replace('PED-', 'DESP-'),
        orderNumber: ped.docNumber,
        date: new Date().toISOString(),
        customer: ped.customer,
        items: ped.items,
        paymentMethod: ped.paymentMethod,
        total: ped.total,
        status: 'Preparando Embalaje',
        originAddress: 'Almacén Central (Lurín)',
        destinationAddress: ped.customer.docType === 'RUC' ? 'Obra Principal Constructora S.A.C.' : 'Dirección Domiciliaria Cliente'
      };

      const storedDispatches = localStorage.getItem('inventory_dispatches');
      const dispatchesList = storedDispatches ? JSON.parse(storedDispatches) : [];
      dispatchesList.unshift(dispatch);
      localStorage.setItem('inventory_dispatches', JSON.stringify(dispatchesList));

      // 4. Remove order from inventory_orders
      const updatedOrders = orders.filter(o => o.id !== ped.id);
      setOrders(updatedOrders);
      localStorage.setItem('inventory_orders', JSON.stringify(updatedOrders));

      alert(`Pedido ${ped.docNumber} confirmado con éxito. Se ha enviado al submódulo de Despachos y se ha actualizado el stock.`);
      setShowDetailModal(false);
    } catch (err) {
      console.error('Error confirming dispatch:', err);
      alert('Error al confirmar despacho: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  const handleOpenDetails = (ped) => {
    setSelectedPed(ped);
    setShowDetailModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Pedidos de Venta" subtitle="Gestión y seguimiento de órdenes cobradas en el Punto de Venta (POS) pendientes de entrega" />

      {orders.length === 0 ? (
        <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--accent)' }} />
          <p style={{ fontWeight: '600', fontSize: '1rem' }}>No hay pedidos registrados.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Puedes emitir un pedido seleccionando "Pedido" como Tipo de Operación en el Punto de Venta (POS) y procesando el cobro.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {orders.map((ped) => (
            <div 
              key={ped.id}
              className="luxury-card interactive"
              onClick={() => handleOpenDetails(ped)}
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
              <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-gold)' }} />
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: '800', background: 'rgba(255,107,0,0.08)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      PEDIDO PENDIENTE
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {ped.docNumber}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(ped.id, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                    title="Eliminar pedido"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} /> {formatDate(ped.date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <User size={12} /> {ped.customer.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                    {ped.customer.docType}: {ped.customer.docNumber} &bull; Método: {ped.paymentMethod}
                  </span>
                  {ped.paymentReference && (
                    <span style={{ fontSize: '0.72rem', color: '#16794c', paddingLeft: '18px', fontWeight: '700' }}>
                      Pago {ped.paymentStatus || 'APROBADO'} &bull; Ref: {ped.paymentReference}
                    </span>
                  )}
                  {ped.paymentBankName && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                      Cuenta: {ped.paymentBankName} - {ped.paymentBankAccountAlias}
                    </span>
                  )}
                </div>

                {/* Items summary */}
                <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.02)', fontSize: '0.75rem', marginBottom: '1.2rem' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase', fontSize: '0.65rem' }}>Productos Solicitados:</div>
                  {ped.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: 'var(--text-primary)' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                        {it.name}
                      </span>
                      <strong>x{parseFloat(it.qty).toFixed(0)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Importe Cobrado</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent)' }}>
                    S/ {parseFloat(ped.total).toFixed(2)}
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={(e) => handleConfirmDispatch(ped, e)}
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: 'none',
                    boxShadow: '0 4px 10px rgba(34, 197, 94, 0.15)',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={12} /> Despachar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedPed && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)', fontWeight: '800' }}>
                Detalles del Pedido {selectedPed.docNumber}
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
              <div><strong>Cliente:</strong> {selectedPed.customer.name}</div>
              <div><strong>Documento:</strong> {selectedPed.customer.docType} {selectedPed.customer.docNumber}</div>
              <div><strong>Fecha de Pedido:</strong> {formatDate(selectedPed.date)}</div>
              <div><strong>Método de Pago:</strong> {selectedPed.paymentMethod}</div>
              <div><strong>Estado:</strong> <span style={{ color: 'var(--accent-gold)', fontWeight: '800' }}>PAGADO &bull; PENDIENTE DE DESPACHO</span></div>
              <div style={{ color: '#0056b3', fontSize: '0.72rem', borderTop: '1px dashed #cbd5e1', paddingTop: '4px', marginTop: '4px', fontWeight: '600' }}>
                💡 Al confirmar despacho, el stock de los productos se actualizará automáticamente en la base de datos real y se generará su Guía de Remisión.
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#0a1629', marginBottom: '0.4rem' }}>
                Artículos Solicitados
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
                    {selectedPed.items.map((it, idx) => (
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
              Total Cobrado: S/ {parseFloat(selectedPed.total).toFixed(2)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
              <button 
                disabled={loading}
                onClick={() => handleConfirmDispatch(selectedPed)}
                className="btn-premium" 
                style={{ background: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Check size={16} /> Confirmar Despacho
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
