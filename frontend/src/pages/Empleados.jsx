import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Plus, Edit, Briefcase, DollarSign } from 'lucide-react';
import { validateField, registerEmployeeValidators } from '../services/validators';

export default function Empleados() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Form states
  const [form, setForm] = useState({
    initials: '',
    name: '',
    role: '',
    dni: '',
    payPerDay: 0,
    isActive: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form validation   
  const [inputErrors, setInputErrors] = useState({
	  name: '',
	  initials: '',
	  dni: '',
	  role: '',
	  payPerDay: ''
  });
  
  /*
  const handleChange = (field, value) => {
	setForm({...form, [field]: value });
	
	if(registerEmployeeValidators[field]) {
		const isValid = registerEmployeeValidators[field].isValid(value);
		setInputErrors({
			...inputErrors,
			[field]: isValid ? '' : registerEmployeeValidators[field].errorMessage
		});
	}
  };
  */
  
  const handleChange = (field, value) => {
	  setForm(prev => ({
		  ...prev, [field]: value
	  }));
	  setInputErrors(prev => ({
		  ...prev, [field]: validateField(registerEmployeeValidators, field, value)
	  }));
  };
	
	
	
	

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.get('/employees');
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Servidor backend offline. Usando datos demo de empleados.');
      setEmployees([
        { id: 'e1', initials: 'CM', name: 'Carlos Mendoza', role: 'Vendedor Cajero', dni: '45678912', payPerDay: 60.00, workedDays: 14.5, isActive: true },
        { id: 'e2', initials: 'JP', name: 'Juan Pérez Almacén', role: 'Encargado Almacén', dni: '12345678', payPerDay: 65.00, workedDays: 15.0, isActive: true },
        { id: 'e3', initials: 'LL', name: 'Lucía Lima', role: 'Administradora', dni: '87654321', payPerDay: 120.00, workedDays: 16.0, isActive: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm({
      initials: '',
      name: '',
      role: '',
      dni: '',
      payPerDay: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (e) => {
    setEditingEmployee(e);
    setForm({
      initials: e.initials,
      name: e.name,
      role: e.role,
      dni: e.dni,
      payPerDay: e.payPerDay,
      isActive: e.isActive ?? true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
	const isFormValid =  registerEmployeeValidators.name.isValid(form.name)
		&& registerEmployeeValidators.initials.isValid(form.initials)
		&& registerEmployeeValidators.dni.isValid(form.dni)
		&& registerEmployeeValidators.role.isValid(form.role)
		&& registerEmployeeValidators.payPerDay.isValid(form.payPerDay);
		
	if(!isFormValid) {
		alert("Corregir errores antes de guardar datos.");
		return;
	}
    try {		
      if (editingEmployee) {
        if (error) {
          setEmployees(employees.map(emp => emp.id === editingEmployee.id ? { ...emp, ...form } : emp));
        } else {
          await api.put(`/employees/${editingEmployee.id}`, form);
        }
        alert('Empleado actualizado con éxito.');
      } else {
        if (error) {
          const newEmp = {
            id: 'e' + Date.now(),
            ...form,
            workedDays: 0
          };
          setEmployees([...employees, newEmp]);
        } else {
          await api.post('/employees', form);
        }
        alert('Empleado registrado con éxito.');
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      alert('Error al registrar empleado: ' + err.message);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dni.includes(search) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Personal de la Empresa" 
        subtitle="Administra la ficha del personal, salarios por día y cargos"
      >
        <button className="btn-premium" onClick={openAddModal}>
          <Plus size={16} /> Registrar Empleado
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Employees Table */}
      <div className="luxury-card">
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por nombre, DNI o cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Iniciales</th>
                <th>Nombre Completo</th>
                <th>DNI</th>
                <th>Cargo / Rol</th>
                <th style={{ textAlign: 'right' }}>Pago por Día</th>
                <th style={{ textAlign: 'right' }}>Días Trabajados</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se registran empleados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div 
                        style={{ 
                          width: '36px', 
                          height: '36px', 
                          borderRadius: '50%', 
                          background: 'rgba(0, 242, 255, 0.1)', 
                          color: 'var(--accent)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          border: '1px solid rgba(0, 242, 255, 0.3)'
                        }}
                      >
                        {e.initials}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{e.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{e.dni}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                        <Briefcase size={12} color="var(--text-secondary)" />
                        <span>{e.role}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--accent-gold)' }}>
                      S/ {e.payPerDay.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      {e.workedDays}
                    </td>
                    <td>
                      <span className={`badge ${e.isActive ? 'badge-success' : 'badge-muted'}`}>
                        {e.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => openEditModal(e)}
                      >
                        <Edit size={12} /> Editar
                      </button>
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
              {editingEmployee ? 'Editar Ficha de Empleado' : 'Registrar Nuevo Empleado'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}				  
                />
				{inputErrors.name && <span style={{color: 'red' }}>{inputErrors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Iniciales (Ficha) *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    maxLength={4}
                    placeholder="Ej. JC"
                    value={form.initials}
                    onChange={(e) => handleChange('initials', e.target.value.toUpperCase())}
                  />
				  {inputErrors.initials && <span style={{color: 'red' }}>{inputErrors.initials}</span>}
                </div>
                <div className="form-group">
                  <label>DNI *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    maxLength={8}
                    value={form.dni}
                    onChange={(e) => handleChange('dni', e.target.value.replace(/\D/g, ''))}
                  />
				  {inputErrors.dni && <span style={{color: 'red' }}>{inputErrors.dni}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cargo / Rol *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Ej. Almacenero, Vendedor..."
                    value={form.role}
                   onChange={(e) => handleChange('role', e.target.value)}
                  />
				  {inputErrors.role && <span style={{color: 'red' }}>{inputErrors.role}</span>}
                </div>
                <div className="form-group">
                  <label>Tarifa Diaria (S/) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    value={form.payPerDay}
                    onChange={(e) => handleChange('payPerDay', e.target.value)}
                  />
				  {inputErrors.payPerDay && <span style={{color: 'red' }}>{inputErrors.payPerDay}</span>}
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
                <label htmlFor="isActive" style={{ marginBottom: 0, cursor: 'pointer' }}>¿El empleado está en planilla activa?</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium">Guardar Empleado</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
