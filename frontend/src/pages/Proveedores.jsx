import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Plus, Edit, Trash, HelpCircle, Truck } from 'lucide-react';
import { validateField, commonValidators } from '../services/validators';

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
  
  // Form validation   
  const [inputErrors, setInputErrors] = useState({
	name: '',
	ruc: '',
	contact: '',
    phone: '',
    email: ''   
  });
  
   const handleChange = (field, value) => {
	  setForm(prev => ({
		  ...prev, [field]: value
	  }));
	  setInputErrors(prev => ({
		  ...prev, [field]: validateField(commonValidators, field, value)
	  }));
  };
  
  

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/suppliers');
      setSuppliers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Servidor backend offline. Usando datos demo de proveedores.');
      setSuppliers([
        { id: 's1', name: 'Ferre-Mayorista SAC', ruc: '20503040506', contact: 'Ing. Carlos Castillo', phone: '988552211', email: 'ventas@ferremayor.com', isActive: true },
        { id: 's2', name: 'Cementos del Perú SA', ruc: '20102030405', contact: 'Sra. Lucia Lopez', phone: '977443322', email: 'pedidos@cementosperu.pe', isActive: true },
        { id: 's3', name: 'Pinturas Vencedor Distribuciones', ruc: '20493827162', contact: 'Don Alfredo Diaz', phone: '955331100', email: 'adiaz@vencedordist.com', isActive: false }
      ]);
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
	setInputErrors({
		name: '',
		ruc: '',
		contact: '',
		phone: '',
		email: ''
	});
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
	setInputErrors({
		name: '',
		ruc: '',
		contact: '',
		phone: '',
		email: ''
	});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
	const isFormValid =  commonValidators.ruc.isValid(form.ruc)		
		&& commonValidators.phone.isValid(form.phone)
		&& commonValidators.name.isValid(form.name)
		&& commonValidators.contact.isValid(form.contact)
		&& commonValidators.email.isValid(form.email);
		
	if(!isFormValid) {
		alert("Corregir errores antes de guardar datos.");
		return;
	}
		
    try {
      if (editingSupplier) {
        if (error) {
          setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...s, ...form } : s));
        } else {
          await api.put(`/suppliers/${editingSupplier.id}`, form);
        }
        alert('Proveedor actualizado con éxito.');
      } else {
        if (error) {
          const newSupp = {
            id: String(Date.now()),
            ...form
          };
          setSuppliers([...suppliers, newSupp]);
        } else {
          await api.post('/suppliers', form);
        }
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
        setSuppliers(suppliers.map(item => item.id === s.id ? { ...item, isActive: nextStatus } : item));
      } else {
        await api.put(`/suppliers/${s.id}`, { ...s, isActive: nextStatus });
      }
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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Razón Social (Nombre Empresa) *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={form.name}
                  //onChange={(e) => setForm({ ...form, name: e.target.value })}
				  onChange={(e) => handleChange('name', e.target.value)}
                />
				{inputErrors.name && <span style={{color: 'red' }}>{inputErrors.name}</span>}
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
                    //onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })}
					onChange={(e) => handleChange('ruc', e.target.value)}
                  />
				  {inputErrors.ruc && <span style={{color: 'red' }}>{inputErrors.ruc}</span>}
                </div>
                <div className="form-group">
                  <label>Persona de Contacto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Ing. Juan López"
                    value={form.contact}
                    //onChange={(e) => setForm({ ...form, contact: e.target.value })}
					onChange={(e) => handleChange('contact', e.target.value)}
                  />
				  {inputErrors.contact && <span style={{color: 'red' }}>{inputErrors.contact}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={form.phone}
                    //onChange={(e) => setForm({ ...form, phone: e.target.value })}
					onChange={(e) => handleChange('phone', e.target.value)}
                  />
				  {inputErrors.phone && <span style={{color: 'red' }}>{inputErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Email de Pedidos</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={form.email}
                    //onChange={(e) => setForm({ ...form, email: e.target.value })}
					onChange={(e) => handleChange('email', e.target.value)}
                  />
				  {inputErrors.email && <span style={{color: 'red' }}>{inputErrors.email}</span>}
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
