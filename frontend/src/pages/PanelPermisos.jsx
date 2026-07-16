import { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import { Copy, Eye, EyeOff, KeyRound, Lock, ShieldCheck, UserPlus } from 'lucide-react';

const ACCESS_MODULES = [
  {
    id: 'seguridad',
    label: 'Seguridad',
    items: [
      { id: 'seguridad:panel-permisos', label: 'Panel de Permisos' },
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { id: 'dashboard:home', label: 'Panel principal' },
      { id: 'dashboard:ventas', label: 'Resumen ventas' },
      { id: 'dashboard:inventario', label: 'Resumen inventario' },
      { id: 'dashboard:usuarios', label: 'Usuarios y roles' },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    items: [
      { id: 'ventas:pos', label: 'POS' },
      { id: 'ventas:historial', label: 'Historial' },
      { id: 'ventas:cotizaciones', label: 'Cotizaciones' },
      { id: 'ventas:pedidos', label: 'Pedidos' },
      { id: 'ventas:devoluciones', label: 'Devoluciones' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    items: [
      { id: 'inventario:catalogo', label: 'Catalogo' },
      { id: 'inventario:stock', label: 'Stock en vivo' },
      { id: 'inventario:movimientos', label: 'Movimientos' },
      { id: 'inventario:alertas', label: 'Alertas' },
      { id: 'inventario:kardex', label: 'Kardex' },
    ],
  },
  {
    id: 'rrhh',
    label: 'RR.HH.',
    items: [
      { id: 'rrhh:empleados', label: 'Empleados' },
      { id: 'rrhh:asistencia', label: 'Asistencia' },
      { id: 'rrhh:boletas', label: 'Boletas' },
    ],
  },
  {
    id: 'operaciones',
    label: 'Operaciones',
    items: [
      { id: 'clientes', label: 'Clientes' },
      { id: 'proveedores', label: 'Proveedores' },
      { id: 'ordenes-compra', label: 'Ordenes de compra' },
    ],
  },
];

const normalizeCredentialText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

const generateUsername = (employee) => {
  if (!employee) return '';
  const parts = normalizeCredentialText(employee.name).split('.').filter(Boolean);
  const first = parts[0] || 'usuario';
  const last = parts.length > 1 ? parts[parts.length - 1] : employee.dni || 'meps';
  return `${first}.${last}`.slice(0, 80);
};

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const random = new Uint32Array(14);
  window.crypto.getRandomValues(random);
  return Array.from(random, n => chars[n % chars.length]).join('');
};

export default function PanelPermisos() {
  const [employees, setEmployees] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');
  const [roleDraft, setRoleDraft] = useState('USER');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessData = async () => {
      try {
        setLoading(true);
        const [employeeList, userList] = await Promise.all([
          api.get('/employees'),
          api.get('/users'),
        ]);
        setEmployees(employeeList);
        setSystemUsers(userList);
        if (employeeList.length > 0) {
          const firstEmployee = employeeList[0];
          const existingUser = userList.find(user => user.employee?.id === firstEmployee.id);
          setSelectedEmployeeId(firstEmployee.id);
          setUsernameDraft(existingUser?.username || generateUsername(firstEmployee));
          setRoleDraft((existingUser?.role || firstEmployee.role || 'USER').toUpperCase().replace(/\s+/g, '_'));
        }
        setMessage('');
      } catch (err) {
        console.error('Error cargando panel de permisos:', err);
        setMessage('No se pudo cargar el panel. Verifique que la sesion sea ADMIN.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessData();
  }, []);

  const selectedEmployee = employees.find(employee => employee.id === selectedEmployeeId);
  const selectedUser = systemUsers.find(user => user.employee?.id === selectedEmployeeId);
  const enabledPermissions = selectedUser?.modulePermissions || [];

  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(item => item.id === employeeId);
    const existingUser = systemUsers.find(user => user.employee?.id === employeeId);
    setSelectedEmployeeId(employeeId);
    setUsernameDraft(existingUser?.username || generateUsername(employee));
    setRoleDraft((existingUser?.role || employee?.role || 'USER').toUpperCase().replace(/\s+/g, '_'));
    setGeneratedPassword('');
    setShowPassword(false);
    setMessage('');
  };

  const handleGenerateCredentials = () => {
    if (!selectedEmployee || selectedUser) return;
    setUsernameDraft(generateUsername(selectedEmployee));
    setGeneratedPassword(generatePassword());
    setShowPassword(true);
  };

  const handleCreateUser = async () => {
    if (!selectedEmployee || selectedUser) return;
    const password = generatedPassword || generatePassword();
    try {
      const created = await api.post('/users', {
        employeeId: selectedEmployee.id,
        username: usernameDraft.trim(),
        role: roleDraft.trim() || 'USER',
        password,
      });
      setSystemUsers(prev => [created, ...prev]);
      setGeneratedPassword(password);
      setShowPassword(true);
      setMessage('Usuario creado. Entregue la contrasena solo una vez y pida cambio en el primer ingreso.');
    } catch (err) {
      setMessage(err.message || 'No se pudo crear el usuario.');
    }
  };

  const handleUpdateUser = async (patch) => {
    if (!selectedUser) return;
    try {
      const updated = await api.put(`/users/${selectedUser.id}`, patch);
      setSystemUsers(prev => prev.map(user => user.id === updated.id ? updated : user));
      setMessage('Cuenta actualizada correctamente.');
    } catch (err) {
      setMessage(err.message || 'No se pudo actualizar el usuario.');
    }
  };

  const persistPermissions = async (nextPermissions) => {
    if (!selectedUser) return;
    try {
      const updated = await api.put(`/users/${selectedUser.id}/permissions`, {
        permissions: nextPermissions,
      });
      setSystemUsers(prev => prev.map(user => user.id === updated.id ? updated : user));
      setMessage('Permisos guardados en la base de datos.');
    } catch (err) {
      setMessage(err.message || 'No se pudieron guardar los permisos.');
    }
  };

  const togglePermission = (permissionId) => {
    if (!selectedUser) return;
    const current = selectedUser.modulePermissions || [];
    const nextPermissions = current.includes(permissionId)
      ? current.filter(id => id !== permissionId)
      : [...current, permissionId];
    persistPermissions(nextPermissions);
  };

  const setModulePermissions = (module, enabled) => {
    if (!selectedUser) return;
    const current = selectedUser.modulePermissions || [];
    const itemIds = module.items.map(item => item.id);
    const nextPermissions = enabled
      ? Array.from(new Set([...current, ...itemIds]))
      : current.filter(id => !itemIds.includes(id));
    persistPermissions(nextPermissions);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header
        title="Panel de Permisos"
        subtitle="Control de accesos por empleado, usuario y modulo del sistema"
      />

      <section className="luxury-card" style={{ marginBottom: '1.5rem', padding: '1.2rem', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Control de Usuario por Empleado
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: 780 }}>
              Selecciona un empleado, genera credenciales solo si aun no tiene cuenta y asigna permisos por modulo o submodulo.
            </p>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.65rem',
            borderRadius: 8,
            background: selectedUser ? 'rgba(47,176,30,0.08)' : 'rgba(251,197,49,0.10)',
            color: selectedUser ? 'var(--success)' : '#9a6a00',
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}>
            <ShieldCheck size={14} />
            {selectedUser ? 'Cuenta activa' : 'Sin cuenta'}
          </div>
        </div>

        {message && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.7rem 0.8rem',
            borderRadius: 8,
            background: 'rgba(0,52,113,0.06)',
            border: '1px solid rgba(0,52,113,0.14)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: 650,
          }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>
            Cargando empleados y usuarios...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', alignItems: 'start' }}>
            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 12, padding: '1rem', background: '#ffffff' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Empleado
              </label>
              <select className="form-input" value={selectedEmployeeId} onChange={(event) => handleEmployeeSelect(event.target.value)}>
                <option value="">Selecciona un empleado</option>
                {employees.map(employee => {
                  const hasAccount = systemUsers.some(user => user.employee?.id === employee.id);
                  return (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.role} {hasAccount ? '(con usuario)' : '(sin usuario)'}
                    </option>
                  );
                })}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.7rem', marginTop: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Username
                  </label>
                  <input
                    className="form-input"
                    value={usernameDraft}
                    onChange={(event) => setUsernameDraft(event.target.value)}
                    disabled={!!selectedUser}
                    placeholder="usuario.apellido"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Rol
                  </label>
                  <select className="form-input" value={roleDraft} onChange={(event) => {
                    setRoleDraft(event.target.value);
                    if (selectedUser) handleUpdateUser({ role: event.target.value });
                  }}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="VENDEDOR">VENDEDOR</option>
                    <option value="ALMACENERO">ALMACENERO</option>
                    <option value="CAJERO">CAJERO</option>
                    <option value="USER">USER</option>
                  </select>
                </div>
              </div>

              {!selectedUser && (
                <div style={{ marginTop: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Contrasena generada
                  </label>
                  <div style={{ display: 'flex', gap: '0.45rem' }}>
                    <input
                      className="form-input"
                      value={generatedPassword}
                      onChange={(event) => setGeneratedPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Genere una contrasena segura"
                    />
                    <button type="button" className="btn-secondary" onClick={() => setShowPassword(value => !value)} style={{ padding: '0 0.75rem' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => navigator.clipboard?.writeText(generatedPassword)} style={{ padding: '0 0.75rem' }} disabled={!generatedPassword}>
                      <Copy size={16} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                    <button type="button" className="btn-secondary" onClick={handleGenerateCredentials} disabled={!selectedEmployee}>
                      <KeyRound size={15} /> Generar
                    </button>
                    <button type="button" className="btn-premium" onClick={handleCreateUser} disabled={!selectedEmployee || !usernameDraft.trim()}>
                      <UserPlus size={15} /> Crear usuario
                    </button>
                  </div>
                </div>
              )}

              {selectedUser && (
                <div style={{ marginTop: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.6rem' }}>
                  <button type="button" className={selectedUser.status === 'active' ? 'btn-secondary' : 'btn-premium'} onClick={() => handleUpdateUser({ status: selectedUser.status === 'active' ? 'inactive' : 'active', active: selectedUser.status !== 'active' })}>
                    {selectedUser.status === 'active' ? 'Desactivar acceso' : 'Activar acceso'}
                  </button>
                  <div style={{ padding: '0.65rem', borderRadius: 8, background: 'var(--hover-bg)', border: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    Usuario: {selectedUser.username}
                  </div>
                </div>
              )}
            </div>

            <div style={{ border: '1px solid var(--glass-border)', borderRadius: 12, padding: '1rem', background: selectedUser ? '#ffffff' : '#f8fafc', opacity: selectedUser ? 1 : 0.62 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--accent)', fontWeight: 800 }}>Permisos de navegacion</h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedUser ? `${enabledPermissions.length} submodulos habilitados` : 'Cree una cuenta para habilitar permisos'}
                  </p>
                </div>
                <Lock size={18} style={{ color: selectedUser ? 'var(--accent)' : 'var(--text-muted)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.7rem' }}>
                {ACCESS_MODULES.map(module => {
                  const moduleIds = module.items.map(item => item.id);
                  const allEnabled = moduleIds.every(id => enabledPermissions.includes(id));
                  return (
                    <div key={module.id} style={{ border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem', background: '#ffffff' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                        {module.label}
                        <input type="checkbox" checked={allEnabled} disabled={!selectedUser} onChange={(event) => setModulePermissions(module, event.target.checked)} />
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.6rem' }}>
                        {module.items.map(item => (
                          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 650 }}>
                            <input type="checkbox" checked={enabledPermissions.includes(item.id)} disabled={!selectedUser} onChange={() => togglePermission(item.id)} />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
