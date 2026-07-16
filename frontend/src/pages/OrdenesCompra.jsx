import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Plus, CheckCircle, Search, FileText, ShoppingBag, Trash2 } from 'lucide-react';
import { validatePurchaseOrderForm } from '../services/validators';

export default function OrdenesCompra() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [priority, setPriority] = useState('media');
  const [note, setNote] = useState('');
  const [orderItems, setOrderItems] = useState([]); // Array of { productId, qty }
  
  // Selection helpers
  const [tempProductId, setTempProductId] = useState('');
  const [tempQty, setTempQty] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordList, suppList, prodList] = await Promise.all([
        api.get('/orders'),
        api.get('/suppliers'),
        api.get('/products')
      ]);
      setOrders(ordList);
      setSuppliers(suppList.filter(s => s.isActive));
      setProducts(prodList.filter(p => p.isActive));
      if (suppList.length > 0) {
        setSelectedSupplierId(suppList[0].id);
      }
      if (prodList.length > 0) {
        setTempProductId(prodList[0].id);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading purchase orders data:', err);
      setError('Servidor backend offline. Usando datos demo de órdenes de compra.');
      setOrders([
        { id: 'o1', supplier_name_snapshot: 'Cementos del Perú SA', ordered_at: '2026-05-18T10:00:00Z', status: 'pendiente', priority: 'alta', total_units: 50, total_lines: 1, note: 'Abastecimiento de cemento para fin de mes' },
        { id: 'o2', supplier_name_snapshot: 'Ferre-Mayorista SAC', ordered_at: '2026-05-10T12:00:00Z', status: 'recibido', priority: 'media', total_units: 120, total_lines: 3, note: 'Pedido ordinario de tornillos y destornilladores', received_at: '2026-05-12T15:00:00Z' }
      ]);
      setSuppliers([
        { id: 's1', name: 'Ferre-Mayorista SAC' },
        { id: 's2', name: 'Cementos del Perú SA' }
      ]);
      setProducts([
        { id: '101', name: 'Martillo de Acero 16oz', unit: 'pza' },
        { id: '102', name: 'Cemento Sol Tipo 1 (42.5kg)', unit: 'bolsa' },
        { id: '103', name: 'Tornillo de Madera 2" (x100)', unit: 'caja' }
      ]);
      setSelectedSupplierId('s1');
      setTempProductId('101');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    if (!tempProductId) return;
    if (Number(tempQty) <= 0) {
      setFormErrors(prev => ({ ...prev, tempQty: 'La cantidad debe ser mayor a cero.' }));
      return;
    }
    setFormErrors(prev => ({ ...prev, tempQty: '', orderItems: '' }));
    const existingIdx = orderItems.findIndex(i => i.productId === tempProductId);
    const prod = products.find(p => p.id === tempProductId);
    
    if (existingIdx > -1) {
      const updated = [...orderItems];
      updated[existingIdx].qty += parseFloat(tempQty);
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, {
        productId: tempProductId,
        name: prod?.name || 'Producto',
        unit: prod?.unit || 'und',
        qty: parseFloat(tempQty)
      }]);
    }
  };

  const handleRemoveItem = (idx) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const validationErrors = validatePurchaseOrderForm({
      selectedSupplierId,
      orderItems,
      tempQty,
      note,
    });
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const orderRequest = {
      supplierId: selectedSupplierId,
      createdByUserId: '00000000-0000-0000-0000-000000000001', // Default Admin
      priority: priority,
      note: note,
      items: orderItems.map(item => ({
        productId: item.productId,
        qty: item.qty
      }))
    };

    try {
      if (error) {
        // Mock
        const suppName = suppliers.find(s => s.id === selectedSupplierId)?.name || 'Proveedor';
        const newOrder = {
          id: 'o' + Date.now(),
          supplier_name_snapshot: suppName,
          ordered_at: new Date().toISOString(),
          status: 'pendiente',
          priority: priority,
          total_units: orderItems.reduce((acc, item) => acc + item.qty, 0),
          total_lines: orderItems.length,
          note: note
        };
        setOrders([newOrder, ...orders]);
      } else {
        await api.post('/orders', orderRequest);
      }
      alert('Orden de compra creada con éxito.');
      setShowModal(false);
      setFormErrors({});
      setOrderItems([]);
      setNote('');
      loadData();
    } catch (err) {
      alert('Error al crear la orden de compra: ' + err.message);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    if (!window.confirm('¿Confirmar que ha recibido físicamente la mercadería? Esto incrementará el stock de los productos.')) return;
    try {
      const dummyReceivedBy = '00000000-0000-0000-0000-000000000001';
      if (error) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'recibido', received_at: new Date().toISOString() } : o));
      } else {
        await api.put(`/orders/${orderId}/receive?receivedBy=${dummyReceivedBy}`);
      }
      alert('Orden de compra registrada como RECIBIDA. Stock actualizado en el almacén.');
      loadData();
    } catch (err) {
      alert('Error al recepcionar la orden: ' + err.message);
    }
  };

  const getPriorityBadgeClass = (prio) => {
    switch (prio?.toLowerCase()) {
      case 'urgente':
        return 'badge-danger';
      case 'alta':
        return 'badge-warning';
      case 'media':
        return 'badge-info';
      case 'baja':
      default:
        return 'badge-muted';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'recibido':
        return 'badge-success';
      case 'pendiente':
        return 'badge-warning';
      case 'enviado':
        return 'badge-info';
      case 'cancelado':
      default:
        return 'badge-muted';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(o => 
    o.supplier_name_snapshot.toLowerCase().includes(search.toLowerCase()) ||
    (o.note && o.note.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Órdenes de Compra" 
        subtitle="Genera requerimientos de abastecimiento y recepciona stock en almacén"
      >
        <button className="btn-premium" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva Orden
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="luxury-card">
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Filtrar por Razón Social de proveedor o notas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Código Orden</th>
                <th>Proveedor</th>
                <th>Fecha Pedido</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Productos/Líneas</th>
                <th style={{ textAlign: 'right' }}>Total Unidades</th>
                <th>Fecha Recepción</th>
                <th style={{ textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se registran órdenes de compra.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isPending = o.status === 'pendiente' || o.status === 'PENDIENTE';
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td>{o.supplier_name_snapshot}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(o.ordered_at)}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(o.priority)}`}>
                          {o.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{o.total_lines}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{o.total_units}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(o.received_at)}</td>
                      <td style={{ textAlign: 'center' }}>
                        {isPending ? (
                          <button 
                            className="btn-premium" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(45deg, #4cd137, #44bd32)', color: 'white' }}
                            onClick={() => handleReceiveOrder(o.id)}
                          >
                            <CheckCircle size={12} /> Recibir Stock
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>Completado</span>
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

      {/* Modal Add Order */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '400', letterSpacing: '1px' }}>
              Redactar Nueva Orden de Compra
            </h2>
            <form onSubmit={handleCreateOrder} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label>Seleccionar Proveedor *</label>
                  <select 
                    className="form-select" 
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {formErrors.selectedSupplierId && <div className="form-error">{formErrors.selectedSupplierId}</div>}
                </div>
                <div className="form-group">
                  <label>Prioridad *</label>
                  <select 
                    className="form-select" 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notas de la Orden</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '60px' }}
                  placeholder="Ej. Entregar antes del mediodía..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                {formErrors.note && <div className="form-error">{formErrors.note}</div>}
              </div>

              {/* Add item to Order row */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--accent-gold)' }}>Añadir Artículos a la lista</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', alignItems: 'end' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Producto</label>
                    <select 
                      className="form-select"
                      value={tempProductId}
                      onChange={(e) => setTempProductId(e.target.value)}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Cantidad</label>
                    <input 
                      type="number" 
                      min="1"
                      className="form-input"
                      value={tempQty}
                      onChange={(e) => setTempQty(e.target.value)}
                    />
                    {formErrors.tempQty && <div className="form-error">{formErrors.tempQty}</div>}
                  </div>
                  <button 
                    type="button" 
                    className="btn-premium"
                    style={{ padding: '0.8rem', height: '42px', minWidth: 'auto' }}
                    onClick={handleAddItem}
                  >
                    Agregar
                  </button>
                </div>
              </div>

              {/* Order items list */}
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Detalle de Artículos Pedidos</label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                {orderItems.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem', textAlign: 'center' }}>
                    Agregue productos desde el panel de arriba
                  </div>
                ) : (
                  orderItems.map((item, index) => (
                    <div 
                      key={item.productId}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <span>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: '600' }}>{item.qty} {item.unit}</span>
                        <button 
                          type="button" 
                          className="btn-danger" 
                          style={{ padding: '0.3rem', borderRadius: '6px' }}
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {formErrors.orderItems && <div className="form-error">{formErrors.orderItems}</div>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium" disabled={orderItems.length === 0}>Enviar Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
