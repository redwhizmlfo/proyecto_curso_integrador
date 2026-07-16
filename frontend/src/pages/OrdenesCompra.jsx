import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { CheckCircle, FileText, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { validatePurchaseOrderForm } from '../services/validators';

export default function OrdenesCompra() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [priority, setPriority] = useState('media');
  const [note, setNote] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [tempProductId, setTempProductId] = useState('');
  const [tempQty, setTempQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const getAuthenticatedUserId = () => {
    try {
      return JSON.parse(localStorage.getItem('current_user') || 'null')?.userId || null;
    } catch {
      return null;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordList, suppList, prodList] = await Promise.all([
        api.get('/orders'),
        api.get('/suppliers'),
        api.get('/products')
      ]);

      const activeSuppliers = suppList.filter((supplier) => supplier.isActive);
      const activeProducts = prodList.filter((product) => product.isActive);

      setOrders(ordList);
      setSuppliers(activeSuppliers);
      setProducts(activeProducts);
      setSelectedSupplierId(activeSuppliers[0]?.id || '');
      setTempProductId(activeProducts[0]?.id || '');
      setError(null);
    } catch (err) {
      console.error('Error loading purchase orders data:', err);
      setError('No se pudo cargar órdenes de compra desde el backend. Las operaciones están deshabilitadas.');
      setOrders([]);
      setSuppliers([]);
      setProducts([]);
      setSelectedSupplierId('');
      setTempProductId('');
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
      setFormErrors((prev) => ({ ...prev, tempQty: 'La cantidad debe ser mayor a cero.' }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, tempQty: '', orderItems: '' }));
    const product = products.find((item) => item.id === tempProductId);
    const existingIndex = orderItems.findIndex((item) => item.productId === tempProductId);

    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        qty: updated[existingIndex].qty + Number(tempQty)
      };
      setOrderItems(updated);
      return;
    }

    setOrderItems((prev) => [
      ...prev,
      {
        productId: tempProductId,
        name: product?.name || 'Producto',
        unit: product?.unit || 'und',
        qty: Number(tempQty)
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    setOrderItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();

    const validationErrors = validatePurchaseOrderForm({
      selectedSupplierId,
      orderItems,
      tempQty,
      note,
    });
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (error) {
        throw new Error('No se puede crear una orden sin conexión real con el backend.');
      }

      const userId = getAuthenticatedUserId();
      if (!userId) {
        throw new Error('No se pudo identificar el usuario autenticado.');
      }

      await api.post('/orders', {
        supplierId: selectedSupplierId,
        createdByUserId: userId,
        priority,
        note,
        items: orderItems.map((item) => ({
          productId: item.productId,
          qty: item.qty
        }))
      });

      alert('Orden de compra creada con éxito.');
      setShowModal(false);
      setFormErrors({});
      setOrderItems([]);
      setNote('');
      await loadData();
    } catch (err) {
      alert('Error al crear la orden de compra: ' + err.message);
    }
  };

  const handleReceiveOrder = async (orderId) => {
    if (!window.confirm('¿Confirmar que ha recibido físicamente la mercadería? Esto incrementará el stock de los productos.')) return;

    try {
      if (error) {
        throw new Error('No se puede recepcionar una orden sin conexión real con el backend.');
      }

      const receivedBy = getAuthenticatedUserId();
      if (!receivedBy) {
        throw new Error('No se pudo identificar el usuario autenticado.');
      }

      await api.put(`/orders/${orderId}/receive?receivedBy=${receivedBy}`);
      alert('Orden de compra registrada como recibida. Stock actualizado en el almacén.');
      await loadData();
    } catch (err) {
      alert('Error al recepcionar la orden: ' + err.message);
    }
  };

  const getPriorityBadgeClass = (priorityValue) => {
    switch (priorityValue?.toLowerCase()) {
      case 'urgente':
        return 'badge-danger';
      case 'alta':
        return 'badge-warning';
      case 'media':
        return 'badge-info';
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

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return orders.filter((order) =>
      order.supplier_name_snapshot?.toLowerCase().includes(normalizedSearch) ||
      order.supplierNameSnapshot?.toLowerCase().includes(normalizedSearch) ||
      order.note?.toLowerCase().includes(normalizedSearch)
    );
  }, [orders, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header
        title="Órdenes de Compra"
        subtitle="Genera requerimientos de abastecimiento y recepciona stock en almacén"
      >
        <button className="btn-premium" onClick={() => setShowModal(true)} disabled={!!error}>
          <Plus size={16} /> Nueva Orden
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(251,197,49,0.08)', border: '1px solid var(--warning)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#d19e07', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="luxury-card">
        <div className="search-container" style={{ marginBottom: '1.5rem' }}>
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por proveedor o nota..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Unidades</th>
                <th>Nota</th>
                <th style={{ textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Cargando órdenes de compra...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No hay órdenes de compra registradas.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = order.status || '';
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.supplier_name_snapshot || order.supplierNameSnapshot}</td>
                      <td>{formatDate(order.ordered_at || order.orderedAt)}</td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{order.total_units || order.totalUnits || 0}</td>
                      <td>{order.note || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {status.toLowerCase() === 'enviado' ? (
                          <button className="btn-success" style={{ padding: '0.45rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => handleReceiveOrder(order.id)}>
                            <CheckCircle size={14} /> Recibir
                          </button>
                        ) : (
                          <FileText size={16} style={{ color: 'var(--text-muted)' }} />
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} /> Nueva Orden de Compra
            </h2>

            <form onSubmit={handleCreateOrder}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Proveedor</label>
                  <select className="form-input" value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                  {formErrors.selectedSupplierId && <span className="error-text">{formErrors.selectedSupplierId}</span>}
                </div>

                <div className="form-group">
                  <label>Prioridad</label>
                  <select className="form-input" value={priority} onChange={(event) => setPriority(event.target.value)}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Agregar producto</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.75rem' }}>
                  <select className="form-input" value={tempProductId} onChange={(event) => setTempProductId(event.target.value)}>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <input className="form-input" type="number" min="1" step="1" value={tempQty} onChange={(event) => setTempQty(event.target.value)} />
                  <button type="button" className="btn-secondary" onClick={handleAddItem}>Agregar</button>
                </div>
                {formErrors.orderItems && <span className="error-text">{formErrors.orderItems}</span>}
                {formErrors.tempQty && <span className="error-text">{formErrors.tempQty}</span>}
              </div>

              {orderItems.length > 0 && (
                <div className="table-container" style={{ margin: '1rem 0' }}>
                  <table className="luxury-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th style={{ textAlign: 'right' }}>Cantidad</th>
                        <th>Unidad</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item, index) => (
                        <tr key={`${item.productId}-${index}`}>
                          <td>{item.name}</td>
                          <td style={{ textAlign: 'right' }}>{item.qty}</td>
                          <td>{item.unit}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="btn-danger" style={{ padding: '0.35rem 0.55rem' }} onClick={() => handleRemoveItem(index)}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form-group">
                <label>Nota</label>
                <textarea className="form-input" rows="3" value={note} onChange={(event) => setNote(event.target.value)} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium">Crear Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
