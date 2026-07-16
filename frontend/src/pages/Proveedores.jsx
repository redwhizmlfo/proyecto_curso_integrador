import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import FieldValidationHint from '../components/FieldValidationHint';
import { Search, Plus, Edit, Trash, HelpCircle, Truck } from 'lucide-react';
import { liveFieldValidators, onlyDigits, validateSupplierForm } from '../services/validators';

export default function Proveedores() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    ruc: '',
    contact: '',
    phone: '',
    email: '',
    isActive: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/suppliers');
      setSuppliers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('No se pudo cargar proveedores desde el backend. Las operaciones estan deshabilitadas.');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm({
      name: '',
      ruc: '',
      contact: '',
      phone: '',
      email: '',
      isActive: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSupplier(s);
    setForm({
      name: s.name,
      ruc: s.ruc,
      contact: s.contact || '',
      phone: s.phone || '',
      email: s.email || '',
      isActive: s.isActive ?? true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateSupplierForm(form, suppliers, editingSupplier?.id);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      ...form,
      name: form.name.trim(),
      ruc: onlyDigits(form.ruc),
      contact: form.contact.trim(),
      phone: onlyDigits(form.phone),
      email: form.email.trim(),
    };

    try {
      if (editingSupplier) {
        if (error) {
          throw new Error('No se puede actualizar proveedores sin conexion real con el backend.');
        }
        await api.put(`/suppliers/${editingSupplier.id}`, payload);
        alert('Proveedor actualizado con éxito.');
      } else {
        if (error) {
          throw new Error('No se puede registrar proveedores sin conexion real con el backend.');
        }
        await api.post('/suppliers', payload);
        alert('Proveedor registrado con éxito.');
      }
      setShowModal(false);
      loadSuppliers();
    } catch (err) {
      alert('Error al registrar proveedor: ' + err.message);
    }
  };

  const toggleActiveStatus = async (s) => {
    const nextStatus = !s.isActive;
    const confirmMsg = `¿Está seguro de ${nextStatus ? 'ACTIVAR' : 'DESACTIVAR'} a ${s.name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (error) {
        throw new Error('No se puede cambiar el estado sin conexion real con el backend.');
      }
      await api.put(`/suppliers/${s.id}`, { ...s, isActive: nextStatus });
      alert('Estado actualizado con éxito.');
      loadSuppliers();
    } catch (err) {
      alert('Error al actualizar estado del proveedor: ' + err.message);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ruc.includes(search) ||
    (s.contact && s.contact.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Gestión de Proveedores" 
        subtitle="Administra la red de proveedores mayoristas e importadoras"
      >
        <button className="btn-premium" onClick={openAddModal}>
          <Plus size={16} /> Agregar Proveedor
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Suppliers Table */}
      <div className="luxury-card">
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Filtrar por Razón Social, RUC o contacto directo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th style={{ width: '220px', minWidth: '220px' }}>Razón Social</th>
                <th style={{ width: '120px', minWidth: '120px' }}>RUC</th>
                <th style={{ width: '150px', minWidth: '150px' }}>Contacto Directo</th>
                <th style={{ width: '110px', minWidth: '110px' }}>Teléfono</th>
                <th style={{ width: '180px', minWidth: '180px' }}>Correo Electrónico</th>
                <th style={{ width: '90px', minWidth: '90px' }}>Estado</th>
                <th style={{ textAlign: 'center', width: '140px', minWidth: '140px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se encontraron proveedores registrados.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ width: '220px', minWidth: '220px', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '200px' }}>
                        <Truck size={14} color="var(--accent)" />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={s.name}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ width: '120px', minWidth: '120px', fontFamily: 'monospace' }}>{s.ruc}</td>
                    <td style={{ width: '150px', minWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={s.contact || ''}>{s.contact || '-'}</td>
                    <td style={{ width: '110px', minWidth: '110px' }}>{s.phone || '-'}</td>
                    <td style={{ width: '180px', minWidth: '180px', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={s.email || ''}>{s.email || '-'}</td>
                    <td style={{ width: '90px', minWidth: '90px' }}>
                      <span className={`badge ${s.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {s.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ width: '140px', minWidth: '140px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', borderRadius: '8px', minWidth: 'auto' }}
                          onClick={() => openEditModal(s)}
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          className={s.isActive ? "btn-danger" : "btn-premium"}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', minWidth: '85px', borderRadius: '8px', border: s.isActive ? undefined : 'none', background: s.isActive ? undefined : 'rgba(76, 209, 55, 0.15)', color: s.isActive ? undefined : '#4cd137' }}
                          onClick={() => toggleActiveStatus(s)}
                        >
                          {s.isActive ? 'Desactivar' : 'Activar'}
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
          <div className="modal-content">
            <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '400', letterSpacing: '1px' }}>
              {editingSupplier ? 'Editar Registro de Proveedor' : 'Registrar Nuevo Proveedor'}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Razón Social (Nombre Empresa) *</label>
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
                  validMessage="Correcto. La razon social tiene un formato permitido."
                  invalidMessage="Escribe entre 3 y 180 caracteres. Puedes usar letras, numeros, espacios y estos signos: . , ' & ( ) / -"
                  maxLength={180}
                />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>RUC (Registro Único de Contribuyente) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    maxLength={11}
                    value={form.ruc}
                    onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })}
                  />
                  <FieldValidationHint
                    value={form.ruc}
                    isValid={liveFieldValidators.ruc}
                    validMessage="RUC correcto."
                    invalidMessage="Escribe 11 digitos. El RUC debe empezar con 10, 15, 16, 17 o 20."
                    maxLength={11}
                    unit="digitos"
                  />
                  {formErrors.ruc && <div className="form-error">{formErrors.ruc}</div>}
                </div>
                <div className="form-group">
                  <label>Persona de Contacto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Ing. Juan López"
                    maxLength={180}
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                  <FieldValidationHint
                    value={form.contact}
                    isValid={liveFieldValidators.contact}
                    validMessage="Contacto correcto."
                    invalidMessage="Escribe entre 3 y 180 caracteres. Solo letras, espacios, apostrofe o guion."
                    maxLength={180}
                  />
                  {formErrors.contact && <div className="form-error">{formErrors.contact}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="Ej. 999888777, 014567890 o 4567890"
                    maxLength={9}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  />
                  <FieldValidationHint
                    value={form.phone}
                    isValid={liveFieldValidators.phone}
                    validMessage="Telefono correcto para Peru."
                    invalidMessage="Usa fijo de 7 digitos, fijo Lima 01 + 7 digitos o celular de 9 digitos que empieza con 9."
                    maxLength={9}
                    unit="digitos"
                  />
                  {formErrors.phone && <div className="form-error">{formErrors.phone}</div>}
                </div>
                <div className="form-group">
                  <label>Email de Pedidos</label>
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

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <input 
                  type="checkbox" 
                  id="isActive"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" style={{ marginBottom: 0, cursor: 'pointer' }}>¿El proveedor está activo en el sistema?</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium">Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
