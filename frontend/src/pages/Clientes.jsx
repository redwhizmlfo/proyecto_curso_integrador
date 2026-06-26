import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Plus, Edit, Trash, UserPlus } from 'lucide-react';

export default function Clientes() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form state (restricting to Minorista and Mayorista only)
  const [form, setForm] = useState({
    name: '',
    docType: 'DNI',
    docNumber: '',
    phone: '',
    email: '',
    address: '',
    preferredDiscount: 0,
    customerType: 'Minorista' // Restricted: Minorista / Mayorista (NO Proveedor)
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to parse type and address
  const parseCustomer = (c) => {
    let type = 'Minorista';
    let cleanAddress = c.address || '';
    
    if (cleanAddress.startsWith('[Minorista] ')) {
      type = 'Minorista';
      cleanAddress = cleanAddress.substring('[Minorista] '.length);
    } else if (cleanAddress.startsWith('[Mayorista] ')) {
      type = 'Mayorista';
      cleanAddress = cleanAddress.substring('[Mayorista] '.length);
    } else {
      // Default fallback based on document type
      type = c.docType === 'RUC' ? 'Mayorista' : 'Minorista';
    }
    
    return {
      ...c,
      customerType: type,
      address: cleanAddress
    };
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/customers');
      // Map and parse each customer
      setCustomers(data.map(parseCustomer));
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Servidor backend offline. Mostrando clientes de respaldo.');
      const backupData = [
        { id: 'c1', name: 'Público General / Varios', docType: 'DNI', docNumber: '00000000', phone: '-', email: '-', address: 'Av. El Sol 123', preferredDiscount: 0, customerType: 'Minorista' },
        { id: 'c2', name: 'Juan Pérez Rodríguez', docType: 'DNI', docNumber: '44558899', phone: '987654321', email: 'juan.perez@gmail.com', address: 'Av. El Sol 123, Lima', preferredDiscount: 5, customerType: 'Minorista' },
        { id: 'c3', name: 'CONSTRUCTORA DEL NORTE S.A.C.', docType: 'RUC', docNumber: '20601234567', phone: '01 4567890', email: 'compras@construalfa.com', address: 'Industrial Area B-12, Callao', preferredDiscount: 10, customerType: 'Mayorista' }
      ];
      setCustomers(backupData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm({
      name: '',
      docType: 'DNI',
      docNumber: '',
      phone: '',
      email: '',
      address: '',
      preferredDiscount: 0,
      customerType: 'Minorista'
    });
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setForm({
      name: c.name,
      docType: c.docType || 'DNI',
      docNumber: c.docNumber || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      preferredDiscount: c.preferredDiscount || 0,
      customerType: c.customerType || 'Minorista'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save customerType in address with a prefix to satisfy no-backend constraint
    const payload = {
      name: form.name,
      docType: form.docType,
      docNumber: form.docNumber,
      phone: form.phone,
      email: form.email,
      address: `[${form.customerType}] ${form.address}`,
      preferredDiscount: form.preferredDiscount
    };

    try {
      if (editingCustomer) {
        if (error) {
          // Simulation local edit
          setCustomers(customers.map(c => c.id === editingCustomer.id ? { ...c, ...form, address: form.address } : c));
        } else {
          await api.put(`/customers/${editingCustomer.id}`, payload);
        }
        alert('Cliente actualizado con éxito.');
      } else {
        if (error) {
          // Simulation local add
          const newCust = {
            id: String(Date.now()),
            ...form
          };
          setCustomers([...customers, newCust]);
        } else {
          await api.post('/customers', payload);
        }
        alert('Cliente registrado con éxito.');
      }
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      alert('Error al registrar cliente: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (id === 'c1' || id === '00000000-0000-0000-0000-000000000001') {
      alert('No se puede eliminar el cliente comodín de público general.');
      return;
    }
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return;
    try {
      if (error) {
        setCustomers(customers.filter(c => c.id !== id));
      } else {
        await api.delete(`/customers/${id}`);
      }
      alert('Cliente eliminado con éxito.');
      loadCustomers();
    } catch (err) {
      alert('Error al eliminar cliente: ' + err.message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.docNumber.includes(search) ||
    c.customerType.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Gestión de Clientes" 
        subtitle="Administra la base de datos de tus clientes mayoristas y minoristas (excluye proveedores)"
      >
        <button className="btn-premium" onClick={openAddModal}>
          <UserPlus size={16} /> Agregar Cliente
        </button>
      </Header>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '1rem', marginBottom: '1.5rem', color: '#b91c1c', fontSize: '0.9rem' }}>
          ℹ️ {error}
        </div>
      )}

      {/* Clientes Table */}
      <div className="luxury-card" style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por nombre, tipo (minorista/mayorista), documento o correo..."
            style={{ border: '1px solid #cbd5e1', background: '#f3f4f6', borderRadius: '4px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container" style={{ border: 'none', width: '100%', overflowX: 'auto' }}>
          <table className="luxury-table">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                <th>Nombre / Razón Social</th>
                <th style={{ width: '100px', minWidth: '100px' }}>Tipo Cliente</th>
                <th style={{ width: '130px', minWidth: '130px' }}>Documento</th>
                <th style={{ width: '120px', minWidth: '120px' }}>Contacto Teléfono</th>
                <th style={{ width: '160px', minWidth: '160px' }}>Correo Electrónico</th>
                <th style={{ width: '180px', minWidth: '180px' }}>Dirección</th>
                <th style={{ textAlign: 'right', width: '90px', minWidth: '90px' }}>Descuento</th>
                <th style={{ textAlign: 'center', width: '100px', minWidth: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '600', color: '#0a1629' }}>{c.name}</td>
                    <td style={{ width: '100px', minWidth: '100px' }}>
                      {c.customerType === 'Mayorista' ? (
                        <span style={{ background: '#e9f2fd', color: '#003471', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          Mayorista
                        </span>
                      ) : (
                        <span style={{ background: '#f1f5f9', color: '#5c6b73', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                          Minorista
                        </span>
                      )}
                    </td>
                    <td style={{ width: '130px', minWidth: '130px' }}>
                      <span className="badge badge-muted" style={{ marginRight: '8px', borderRadius: '4px' }}>{c.docType}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{c.docNumber}</span>
                    </td>
                    <td style={{ width: '120px', minWidth: '120px' }}>{c.phone || '-'}</td>
                    <td style={{ maxWidth: '160px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={c.email || ''}>
                      {c.email || '-'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={c.address || ''}>
                      {c.address || '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#ff6b00', width: '90px', minWidth: '90px' }}>
                      {c.preferredDiscount}%
                    </td>
                    <td style={{ textAlign: 'center', width: '100px', minWidth: '100px' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', borderRadius: '4px', minWidth: 'auto', border: '1px solid #cbd5e1' }}
                          onClick={() => openEditModal(c)}
                          title="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          className="btn-danger" 
                          style={{ padding: '0.4rem', borderRadius: '4px', minWidth: 'auto', background: '#fee2e2', border: '1px solid #fca5a5', color: '#ef4444' }}
                          onClick={() => handleDelete(c.id)}
                          disabled={c.id === 'c1'}
                          title="Eliminar"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: '4px', border: '1px solid #cbd5e1', padding: '2rem' }}>
            <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '800', fontSize: '1.25rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.8rem' }}>
              {editingCustomer ? 'Editar Ficha de Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label style={{ fontWeight: '700' }}>Nombre Completo / Razón Social *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  required 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Tipo Cliente *</label>
                  <select 
                    className="form-select" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    value={form.customerType}
                    onChange={(e) => setForm({ ...form, customerType: e.target.value })}
                  >
                    <option value="Minorista">Minorista (Público general / DNI)</option>
                    <option value="Mayorista">Mayorista (Empresas / RUC)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Descuento Preferencial (%) *</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    className="form-input" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    required 
                    value={form.preferredDiscount}
                    onChange={(e) => setForm({ ...form, preferredDiscount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Tipo Documento *</label>
                  <select 
                    className="form-select" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    value={form.docType}
                    onChange={(e) => setForm({ ...form, docType: e.target.value, docNumber: '' })}
                  >
                    <option value="DNI">DNI (Persona Física)</option>
                    <option value="RUC">RUC (Empresa)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Número Documento *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    required 
                    placeholder={form.docType === 'DNI' ? '8 dígitos' : '11 dígitos'}
                    maxLength={form.docType === 'DNI' ? 8 : 11}
                    value={form.docNumber}
                    onChange={(e) => setForm({ ...form, docNumber: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Teléfono Contacto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700' }}>Dirección Domiciliaria</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
                <button type="button" className="btn-secondary" style={{ borderRadius: '4px', border: '1px solid #cbd5e1' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium" style={{ borderRadius: '4px', background: '#003471' }}>Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
