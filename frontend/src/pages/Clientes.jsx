import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import FieldValidationHint from '../components/FieldValidationHint';
import { Search, Edit, Trash, UserPlus } from 'lucide-react';
import { liveFieldValidators, onlyDigits, validateCustomerForm } from '../services/validators';

const parseCustomer = (c) => {
  let cleanAddress = c.address || '';
  let type = c.docType === 'RUC' ? 'Mayorista' : 'Minorista';

  if (cleanAddress.startsWith('[Minorista] ')) {
    type = 'Minorista';
    cleanAddress = cleanAddress.substring('[Minorista] '.length);
  } else if (cleanAddress.startsWith('[Mayorista] ')) {
    type = 'Mayorista';
    cleanAddress = cleanAddress.substring('[Mayorista] '.length);
  }

  return {
    ...c,
    customerType: type,
    address: cleanAddress
  };
};

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

  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadCustomers = useCallback(async () => {
    try {
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
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCustomers();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCustomers]);

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
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateCustomerForm(form, customers, editingCustomer?.id);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    
    // Save customerType in address with a prefix to satisfy no-backend constraint
    const payload = {
      name: form.name.trim(),
      docType: form.docType,
      docNumber: onlyDigits(form.docNumber),
      phone: onlyDigits(form.phone),
      email: form.email.trim(),
      address: `[${form.customerType}] ${form.address}`,
      preferredDiscount: Number(form.preferredDiscount)
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
  const totalCustomers = customers.length;
  const wholesaleCustomers = customers.filter(c => c.customerType === 'Mayorista').length;
  const retailCustomers = customers.filter(c => c.customerType !== 'Mayorista').length;

  return (
    <div className="content-page customers-page">
      <Header 
        title="Gestión de Clientes" 
        subtitle="Administra la base de datos de tus clientes mayoristas y minoristas (excluye proveedores)"
      >
        <button className="btn-premium" onClick={openAddModal}>
          <UserPlus size={16} /> Agregar Cliente
        </button>
      </Header>

      {error && (
        <div className="content-alert danger">
          ℹ️ {error}
        </div>
      )}

      <section className="content-summary-grid">
        <article className="content-summary-card">
          <span>Total clientes</span>
          <strong>{totalCustomers}</strong>
          <small>registros en la base comercial</small>
        </article>
        <article className="content-summary-card accent">
          <span>Mayoristas</span>
          <strong>{wholesaleCustomers}</strong>
          <small>empresas, RUC y compras recurrentes</small>
        </article>
        <article className="content-summary-card muted">
          <span>Minoristas</span>
          <strong>{retailCustomers}</strong>
          <small>atencion directa y publico general</small>
        </article>
      </section>

      {/* Clientes Table */}
      <div className="content-panel customers-panel">
        <div className="content-panel-header">
          <div>
            <span className="content-eyebrow">Directorio comercial</span>
            <h2>Clientes registrados</h2>
            <p>{filteredCustomers.length} resultados visibles segun el filtro actual.</p>
          </div>
          <div className="content-panel-meta">
            <span>{totalCustomers} total</span>
          </div>
        </div>

        <div className="search-container content-search">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por nombre, tipo (minorista/mayorista), documento o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container content-table-container">
          <table className="luxury-table">
            <thead>
              <tr>
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
                  <td colSpan="8">
                    <div className="content-empty-state">
                      <strong>No hay clientes para mostrar</strong>
                      <span>Prueba con otro termino de busqueda o registra un nuevo cliente.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-name-cell">
                        <span>{c.name}</span>
                        <small>{c.customerType} · {c.docType} {c.docNumber}</small>
                      </div>
                    </td>
                    <td style={{ width: '100px', minWidth: '100px' }}>
                      {c.customerType === 'Mayorista' ? (
                        <span className="customer-type-badge wholesale">
                          Mayorista
                        </span>
                      ) : (
                        <span className="customer-type-badge retail">
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
                      <div className="row-actions">
                        <button 
                          className="action-icon-btn"
                          onClick={() => openEditModal(c)}
                          title="Editar"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          className="action-icon-btn danger"
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
          <div className="modal-content content-modal">
            <h2 className="content-modal-title">
              {editingCustomer ? 'Editar Ficha de Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              
              <div className="form-group">
                <label style={{ fontWeight: '700' }}>Nombre Completo / Razón Social *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  maxLength={180}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <FieldValidationHint
                  value={form.name}
                  isValid={liveFieldValidators.customerName}
                  validMessage="Correcto. El nombre tiene un formato permitido."
                  invalidMessage="Escribe entre 3 y 180 caracteres. Puedes usar letras, numeros, espacios y estos signos: . , ' & ( ) / -"
                  maxLength={180}
                />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Tipo Cliente *</label>
                  <select 
                    className="form-select" 
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
                    required 
                    value={form.preferredDiscount}
                    onChange={(e) => setForm({ ...form, preferredDiscount: parseFloat(e.target.value) })}
                  />
                  {formErrors.preferredDiscount && <div className="form-error">{formErrors.preferredDiscount}</div>}
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Tipo Documento *</label>
                  <select 
                    className="form-select" 
                    value={form.docType}
                    onChange={(e) => {
                      setForm({ ...form, docType: e.target.value, docNumber: '' });
                      setFormErrors({ ...formErrors, docType: '', docNumber: '' });
                    }}
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
                    required 
                    placeholder={form.docType === 'DNI' ? '8 dígitos' : '11 dígitos'}
                    maxLength={form.docType === 'DNI' ? 8 : 11}
                    value={form.docNumber}
                    onChange={(e) => setForm({ ...form, docNumber: e.target.value.replace(/\D/g, '') })}
                  />
                  <FieldValidationHint
                    value={form.docNumber}
                    isValid={(value) => liveFieldValidators.docByType(value, form.docType)}
                    validMessage={`${form.docType} correcto.`}
                    invalidMessage={form.docType === 'RUC' ? 'Escribe 11 digitos. El RUC debe empezar con 10 o 20.' : 'Escribe exactamente 8 digitos para el DNI.'}
                    maxLength={form.docType === 'DNI' ? 8 : 11}
                    unit="digitos"
                  />
                  {formErrors.docNumber && <div className="form-error">{formErrors.docNumber}</div>}
                </div>
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Teléfono Contacto</label>
                  <input 
                    type="text" 
                  className="form-input" 
                  maxLength={15}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                />
                <FieldValidationHint
                  value={form.phone}
                  isValid={liveFieldValidators.phone}
                  validMessage="Telefono correcto."
                  invalidMessage="Escribe solo numeros, entre 7 y 15 digitos."
                  maxLength={15}
                  unit="digitos"
                />
                  {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: '700' }}>Correo Electrónico</label>
                  <input 
                  type="email" 
                  className="form-input" 
                  maxLength={120}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <FieldValidationHint
                  value={form.email}
                  isValid={liveFieldValidators.email}
                  validMessage="Correo correcto."
                  invalidMessage="Usa un correo valido, por ejemplo nombre@dominio.com. Maximo 120 caracteres."
                  maxLength={120}
                />
                  {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '700' }}>Dirección Domiciliaria *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  maxLength={500}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <FieldValidationHint
                  value={form.address}
                  isValid={liveFieldValidators.address}
                  validMessage="Direccion correcta."
                  invalidMessage="Escribe entre 3 y 500 caracteres. Puedes usar letras, numeros, #, -, /, parentesis y punto."
                  maxLength={500}
                />
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>

              <div className="content-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium">Guardar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
