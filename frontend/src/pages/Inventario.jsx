import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Plus, AlertOctagon, Trash, Edit, RefreshCw } from 'lucide-react';

export default function Inventario() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Forms state
  const [productForm, setProductForm] = useState({
    name: '',
    barcode: '',
    category: '',
    supplierId: '',
    unit: 'pza',
    cost: 0,
    price: 0,
    minStock: 5,
    stock: 0
  });

  const [lossForm, setLossForm] = useState({
    qty: 1,
    responsible: '',
    reason: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodList, suppList] = await Promise.all([
        api.get('/products'),
        api.get('/suppliers')
      ]);
      setProducts(prodList.filter(p => p.isActive));
      setSuppliers(suppList);
      setError(null);
    } catch (err) {
      console.error('Error loading inventory data:', err);
      setError('Servidor backend offline. Utilizando datos de demostración.');
      // Demo fallbacks
      setProducts([
        { id: '101', name: 'Martillo de Acero 16oz', barcode: '75010324', category: 'Herramientas', unit: 'pza', cost: 12.00, price: 24.50, stock: 12, minStock: 5, supplierNameSnapshot: 'Ferre-Mayorista SAC', isActive: true },
        { id: '102', name: 'Cemento Sol Tipo 1 (42.5kg)', barcode: '77502310', category: 'Materiales', unit: 'bolsa', cost: 22.00, price: 28.00, stock: 8, minStock: 20, supplierNameSnapshot: 'Cementos del Perú SA', isActive: true },
        { id: '103', name: 'Tornillo de Madera 2" (x100)', barcode: '84102941', category: 'Tornillería', unit: 'caja', cost: 8.50, price: 15.00, stock: 45, minStock: 10, supplierNameSnapshot: 'Ferre-Mayorista SAC', isActive: true },
        { id: '104', name: 'Cinta Métrica 5m Stanley', barcode: '72093104', category: 'Herramientas', unit: 'pza', cost: 18.00, price: 32.20, stock: 4, minStock: 5, supplierNameSnapshot: 'Ferre-Mayorista SAC', isActive: true }
      ]);
      setSuppliers([
        { id: 's1', name: 'Ferre-Mayorista SAC' },
        { id: 's2', name: 'Cementos del Perú SA' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        if (error) {
          // Mock update
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productForm } : p));
        } else {
          await api.put(`/products/${editingProduct.id}`, productForm);
        }
        alert('Producto actualizado con éxito.');
      } else {
        if (error) {
          // Mock create
          const newProduct = {
            id: String(Date.now()),
            ...productForm,
            supplierNameSnapshot: suppliers.find(s => s.id === productForm.supplierId)?.name || 'Proveedor Nuevo',
            isActive: true
          };
          setProducts([...products, newProduct]);
        } else {
          await api.post('/products', productForm);
        }
        alert('Producto creado con éxito.');
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadData();
    } catch (err) {
      alert('Error al guardar el producto: ' + err.message);
    }
  };

  const handleLossSubmit = async (e) => {
    e.preventDefault();
    if (lossForm.qty > selectedProduct.stock) {
      alert('La cantidad de merma no puede ser mayor que el stock actual.');
      return;
    }

    const lossRequest = {
      productId: selectedProduct.id,
      userId: '00000000-0000-0000-0000-000000000001', // Example default user
      qty: parseFloat(lossForm.qty),
      reason: lossForm.reason,
      responsible: lossForm.responsible
    };

    try {
      if (error) {
        // Mock loss creation
        alert(`[MODO DEMO] Pérdida registrada con éxito. Se restarán ${lossRequest.qty} unidades.`);
        setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, stock: p.stock - lossRequest.qty } : p));
      } else {
        await api.post('/losses', lossRequest);
        alert('Pérdida registrada con éxito.');
      }
      setShowLossModal(false);
      loadData();
    } catch (err) {
      alert('Error al reportar la pérdida: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      barcode: '',
      category: '',
      supplierId: suppliers[0]?.id || '',
      unit: 'pza',
      cost: '',
      price: '',
      minStock: 5,
      stock: ''
    });
    setShowProductModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      supplierId: p.supplierId || suppliers[0]?.id || '',
      unit: p.unit,
      cost: p.cost,
      price: p.price,
      minStock: p.minStock,
      stock: p.stock
    });
    setShowProductModal(true);
  };

  const openLossModal = (p) => {
    setSelectedProduct(p);
    setLossForm({
      qty: 1,
      responsible: '',
      reason: ''
    });
    setShowLossModal(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este producto?')) return;
    try {
      if (error) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        await api.delete(`/products/${id}`);
      }
      alert('Producto eliminado de la vista.');
      loadData();
    } catch (err) {
      alert('Error al desactivar el producto: ' + err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <div className="header">
        <div>
          <h1 className="title-gradient">Inventario & Stock</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Administra tu catálogo de mercancías y reporta incidencias</p>
        </div>
        <button className="btn-premium" onClick={openAddModal}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Product List */}
      <div className="luxury-card">
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Filtrar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock Actual</th>
                <th>Proveedor</th>
                <th style={{ textAlign: 'right' }}>Costo</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se encontraron productos en el inventario.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock <= p.minStock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SKU: {p.barcode}</div>
                      </td>
                      <td>
                        <span className="badge badge-muted">{p.category}</span>
                      </td>
                      <td style={{ fontWeight: '600', color: isLowStock ? 'var(--danger)' : 'var(--accent)' }}>
                        {p.stock} {p.unit}
                        {isLowStock && (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 'normal' }}>
                            (Mín: {p.minStock})
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {p.supplierNameSnapshot || 'Sin proveedor'}
                      </td>
                      <td style={{ textAlign: 'right' }}>S/ {p.cost.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--accent-gold)' }}>
                        S/ {p.price.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-premium" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', minWidth: 'auto', borderRadius: '8px' }}
                            onClick={() => openLossModal(p)}
                          >
                            <AlertOctagon size={12} style={{ marginRight: '4px' }} /> Merma
                          </button>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', minWidth: 'auto' }}
                            onClick={() => openEditModal(p)}
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            className="btn-danger" 
                            style={{ padding: '0.4rem', borderRadius: '8px', minWidth: 'auto' }}
                            onClick={() => deleteProduct(p.id)}
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Product ADD / EDIT */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '400', letterSpacing: '1px' }}>
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Código de Barras (SKU) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Herramientas, Pintura..."
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Proveedor *</label>
                  <select 
                    className="form-select" 
                    value={productForm.supplierId}
                    onChange={(e) => setProductForm({ ...productForm, supplierId: e.target.value })}
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Unidad de Medida *</label>
                  <select 
                    className="form-select" 
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  >
                    <option value="pza">Pieza (pza)</option>
                    <option value="bolsa">Bolsa</option>
                    <option value="caja">Caja</option>
                    <option value="galon">Galón</option>
                    <option value="metro">Metro</option>
                    <option value="kg">Kilogramo</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Costo de Compra (S/) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    value={productForm.cost}
                    onChange={(e) => setProductForm({ ...productForm, cost: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Precio de Venta (S/) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Mínimo Alerta *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Stock Inicial *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    disabled={editingProduct !== null}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowProductModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Report LOSS */}
      {showLossModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: 'var(--danger)', marginBottom: '1.5rem', fontWeight: '400', letterSpacing: '1px' }}>
              Reportar Pérdida / Merma
            </h2>
            <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px dashed var(--glass-border)' }}>
              <strong>Producto:</strong> {selectedProduct.name} <br />
              <strong>Stock actual:</strong> {selectedProduct.stock} {selectedProduct.unit}
            </div>
            <form onSubmit={handleLossSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Cantidad Perdida *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    min="0.01"
                    value={lossForm.qty}
                    onChange={(e) => setLossForm({ ...lossForm, qty: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Responsable *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Nombre del empleado"
                    value={lossForm.responsible}
                    onChange={(e) => setLossForm({ ...lossForm, responsible: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Detalle / Motivo de la pérdida *</label>
                <textarea 
                  className="form-textarea" 
                  required 
                  placeholder="Ej. Producto roto durante traslado en almacén..."
                  value={lossForm.reason}
                  onChange={(e) => setLossForm({ ...lossForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowLossModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium" style={{ background: 'linear-gradient(45deg, #ff5252, #e84118)', color: 'white' }}>Registrar Pérdida</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
