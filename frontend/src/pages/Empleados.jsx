import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import FieldValidationHint from '../components/FieldValidationHint';
import { Search, Plus, Edit, Briefcase, DollarSign } from 'lucide-react';
import { liveFieldValidators, onlyDigits, validateEmployeeForm } from '../services/validators';

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
  const [formErrors, setFormErrors] = useState({});

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.get('/employees');
      setEmployees(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('No se pudo cargar empleados desde el backend. Las operaciones estan deshabilitadas.');
      setEmployees([]);
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
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateEmployeeForm(form, employees, editingEmployee?.id);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      ...form,
      initials: form.initials.trim().toUpperCase(),
      name: form.name.trim(),
      role: form.role.trim(),
      dni: onlyDigits(form.dni),
      payPerDay: Number(form.payPerDay),
    };

    try {
      if (editingEmployee) {
        if (error) {
          throw new Error('No se puede actualizar empleados sin conexion real con el backend.');
        }
        await api.put(`/employees/${editingEmployee.id}`, payload);
        alert('Empleado actualizado con éxito.');
      } else {
        if (error) {
          throw new Error('No se puede registrar empleados sin conexion real con el backend.');
        }
        await api.post('/employees', payload);
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
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Nombre Completo *</label>
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
                  isValid={liveFieldValidators.employeeName}
                  validMessage="Nombre correcto."
                  invalidMessage="Escribe entre 3 y 180 caracteres. Solo letras, espacios, apostrofe o guion."
                  maxLength={180}
                />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
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
                    onChange={(e) => setForm({ ...form, initials: e.target.value.toUpperCase() })}
                  />
                  <FieldValidationHint
                    value={form.initials}
                    isValid={liveFieldValidators.initials}
                    validMessage="Iniciales correctas."
                    invalidMessage="Escribe de 2 a 4 letras mayusculas, sin espacios ni numeros."
                    maxLength={4}
                  />
                  {formErrors.initials && <div className="form-error">{formErrors.initials}</div>}
                </div>
                <div className="form-group">
                  <label>DNI *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    maxLength={8}
                    value={form.dni}
                    onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, '') })}
                  />
                  <FieldValidationHint
                    value={form.dni}
                    isValid={liveFieldValidators.dni}
                    validMessage="DNI correcto."
                    invalidMessage="Escribe exactamente 8 digitos para el DNI."
                    maxLength={8}
                    unit="digitos"
                  />
                  {formErrors.dni && <div className="form-error">{formErrors.dni}</div>}
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
                    maxLength={80}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                  <FieldValidationHint
                    value={form.role}
                    isValid={liveFieldValidators.role}
                    validMessage="Cargo correcto."
                    invalidMessage="Escribe entre 3 y 80 caracteres. Solo letras y espacios."
                    maxLength={80}
                  />
                  {formErrors.role && <div className="form-error">{formErrors.role}</div>}
                </div>
                <div className="form-group">
                  <label>Tarifa Diaria (S/) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    value={form.payPerDay}
                    onChange={(e) => setForm({ ...form, payPerDay: parseFloat(e.target.value) })}
                  />
                  <FieldValidationHint
                    value={form.payPerDay}
                    isValid={liveFieldValidators.payPerDay}
                    validMessage="Tarifa correcta."
                    invalidMessage="Escribe un monto mayor a 0. Puedes usar hasta 2 decimales."
                    limitLabel="Formato: 999.99"
                  />
                  {formErrors.payPerDay && <div className="form-error">{formErrors.payPerDay}</div>}
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
