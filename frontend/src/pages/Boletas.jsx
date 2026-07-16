import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { DollarSign, FileText, Plus, Eye, Printer } from 'lucide-react';
import { validatePayrollSlipForm } from '../services/validators';

export default function Boletas() {
  const [slips, setSlips] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSlip, setViewingSlip] = useState(null);

  // Form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [workDays, setWorkDays] = useState(15);
  const [periodLabel, setPeriodLabel] = useState('');
  const [notes, setNotes] = useState('');

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
      const [slipList, empList] = await Promise.all([
        api.get('/slips'),
        api.get('/employees')
      ]);
      setSlips(slipList);
      const activeEmps = empList.filter(e => e.isActive);
      setEmployees(activeEmps);
      if (activeEmps.length > 0) {
        setSelectedEmployeeId(activeEmps[0].id);
        setWorkDays(activeEmps[0].workedDays || 0);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading payroll slips data:', err);
      setError('No se pudo cargar boletas desde el backend. Las operaciones estan deshabilitadas.');
      setSlips([]);
      setEmployees([]);
      setSelectedEmployeeId('');
      setWorkDays(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEmployeeChange = (empId) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setWorkDays(emp.workedDays || 0);
    }
  };

  const handleGenerateSlip = async (e) => {
    e.preventDefault();
    const validationErrors = validatePayrollSlipForm({
      selectedEmployeeId,
      periodLabel,
      workDays,
      slips,
    });
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    
    const cleanPeriod = periodLabel.trim() || `Periodo-${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    const createdByUserId = getAuthenticatedUserId();
    if (!createdByUserId) {
      alert('Error al generar boleta: No se pudo identificar el usuario autenticado.');
      return;
    }
    
    const request = {
      employeeId: selectedEmployeeId,
      createdByUserId,
      periodLabel: cleanPeriod
    };

    try {
      if (error) {
        throw new Error('No se puede generar boletas sin conexion real con el backend.');
      }
      await api.post('/slips', request);
      alert('Boleta de pago generada con éxito.');
      setShowCreateModal(false);
      setFormErrors({});
      setPeriodLabel('');
      setNotes('');
      loadData();
    } catch (err) {
      alert('Error al generar boleta: ' + err.message);
    }
  };

  const handlePaySlip = (slipId) => {
    if (!window.confirm('¿Confirmar pago de esta boleta de sueldo?')) return;
    
    alert('El backend aun no tiene un endpoint para registrar pago de boletas. No se aplico ningun cambio local.');
  };

  const handleUnpaySlip = (slipId) => {
    if (!window.confirm('¿Cambiar estado de esta boleta a pendiente?')) return;
    
    alert('El backend aun no tiene un endpoint para cambiar el estado de pago. No se aplico ningun cambio local.');
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const calculatedTotal = selectedEmployee ? (selectedEmployee.payPerDay * (parseFloat(workDays) || 0)).toFixed(2) : '0.00';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Boletas de Pago" 
        subtitle="Cálculo e historial de abonos, salarios por días trabajados y periodos de liquidación"
      >
        <button className="btn-premium" onClick={() => {
          if (employees.length > 0) {
            setSelectedEmployeeId(employees[0].id);
            setWorkDays(employees[0].workedDays || 0);
          }
          setShowCreateModal(true);
        }}>
          <Plus size={16} /> Generar Boleta
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Slips list */}
      <div className="luxury-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> Comprobantes de Pago Emitidos
        </h2>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Boleta / N°</th>
                <th>Empleado / Rol</th>
                <th>Periodo Liquidado</th>
                <th>Fecha Emisión</th>
                <th style={{ textAlign: 'right' }}>Días</th>
                <th style={{ textAlign: 'right' }}>Jornal Diario</th>
                <th style={{ textAlign: 'right' }}>Monto Liquidado</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {slips.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se registran boletas de pago generadas en el sistema.
                  </td>
                </tr>
              ) : (
                slips.map((s) => {
                  const slipIdStr = s.id ? String(s.id) : '';
                  const shortId = slipIdStr.includes('-') ? slipIdStr.split('-')[0].toUpperCase() : slipIdStr.slice(0, 8).toUpperCase();
                  const isPaid = s.status === 'pagada' || s.status === 'PAGADA';
                  
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '750', fontFamily: 'monospace', color: '#004B93' }}>
                        <div>#{shortId}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{s.slipNumber || 'BP-NEW'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{s.employeeNameSnapshot || s.employeeName || 'Empleado'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {s.employeeRoleSnapshot || s.role} | DNI: {s.employeeDniSnapshot || s.employeeDni || '00000000'}
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>{s.periodLabel || 'N/A'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(s.issuedAt || s.generated_at)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>{s.workedDaysSnapshot ?? s.workedDays ?? 0}</td>
                      <td style={{ textAlign: 'right' }}>S/ {(s.payPerDaySnapshot ?? s.pay_per_day ?? 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '750', color: '#004B93', fontSize: '0.95rem' }}>
                        S/ {(s.totalAmount ?? s.totalPay ?? 0).toFixed(2)}
                      </td>
                      <td>
                        <span 
                          onClick={() => isPaid ? handleUnpaySlip(s.id) : handlePaySlip(s.id)}
                          className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`}
                          style={{ cursor: 'pointer' }}
                          title={isPaid ? 'Clic para marcar como pendiente' : 'Clic para marcar como pagada'}
                        >
                          {isPaid ? 'Pagada' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', minWidth: 'auto', border: '1px solid #cbd5e1', color: '#475569' }}
                            onClick={() => setViewingSlip(s)}
                            title="Ver Detalle de Boleta"
                          >
                            <Eye size={12} />
                          </button>
                          {!isPaid ? (
                            <button 
                              className="btn-premium" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(45deg, #4cd137, #44bd32)', color: 'white' }}
                              onClick={() => handlePaySlip(s.id)}
                              title="Registrar Pago"
                            >
                              <DollarSign size={12} /> Pagar
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700', alignSelf: 'center', padding: '0 4px' }}>Cobrado</span>
                          )}
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

      {/* Modal Generate Slip */}
      {showCreateModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            width: '90%',
            maxWidth: '500px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            color: '#1e293b'
          }}>
            <h2 style={{ color: '#003471', marginBottom: '1.5rem', fontWeight: '700', fontSize: '1.4rem' }}>
              Emitir Boleta de Pago
            </h2>
            <form onSubmit={handleGenerateSlip} noValidate>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Seleccionar Empleado *</label>
                <select 
                  className="form-select" 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  value={selectedEmployeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role}) [S/ {e.payPerDay?.toFixed(2)}/día]
                    </option>
                  ))}
                </select>
                {formErrors.selectedEmployeeId && <div className="form-error">{formErrors.selectedEmployeeId}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Periodo de Liquidación *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                  placeholder="Ej. Mayo-2026-Quincena-2"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                />
                {formErrors.periodLabel && <div className="form-error">{formErrors.periodLabel}</div>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Días Trabajados a Liquidar</label>
                <input 
                  type="number" 
                  step="0.5" 
                  className="form-input" 
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: error ? '#ffffff' : '#f1f5f9' }}
                  required 
                  min="0"
                  disabled
                  value={workDays}
                  onChange={(e) => setWorkDays(e.target.value)}
                />
                {formErrors.workDays && <div className="form-error">{formErrors.workDays}</div>}
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                  <span><strong>Automático:</strong> Se liquidarán los <strong>{selectedEmployee?.workedDays ?? 0} días</strong> registrados en el sistema para este colaborador y se restablecerán a 0.</span>
                </div>
              </div>

              {selectedEmployee && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                    Resumen de Liquidación
                  </h3>
                  <div style={{ display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                    <span>Jornal Diario:</span>
                    <span style={{ fontWeight: '600' }}>S/ {selectedEmployee.payPerDay?.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.3rem' }}>
                    <span>Días acumulados:</span>
                    <span style={{ fontWeight: '600' }}>x {workDays}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '800' }}>
                    <span>Pago Neto Estimado:</span>
                    <span style={{ color: '#003471' }}>S/ {calculatedTotal}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-premium"
                  style={{ background: 'linear-gradient(135deg, #003471 0%, #002856 100%)', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Confirmar y Emitir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View / Print Slip details */}
      {viewingSlip && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{ maxWidth: '550px', padding: 0, background: '#ffffff', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Printable Area */}
            <div id="printable-slip" style={{ padding: '2rem', background: '#ffffff', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div style={{ borderBottom: '2px solid #cbd5e1', paddingBottom: '1.2rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#003471', fontWeight: '800', margin: 0, fontSize: '1.2rem' }}>MEPS GROUP PERÚ S.A.C.</h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>RUC: 20601234567 | Av. Argentina 1450, Lima</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#475569' }}>BOLETA DE PAGO</h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
                    N° {viewingSlip.slipNumber || `BP-GEN-${viewingSlip.id?.slice(0, 8).toUpperCase()}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.8rem', fontSize: '0.85rem', marginBottom: '1.2rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Empleado:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{viewingSlip.employeeNameSnapshot || viewingSlip.employeeName}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>DNI N°:</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{viewingSlip.employeeDniSnapshot || viewingSlip.employeeDni || '00000000'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Cargo:</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{viewingSlip.employeeRoleSnapshot || viewingSlip.role}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Fecha Emisión:</span>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{formatDate(viewingSlip.issuedAt || viewingSlip.generated_at)}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Periodo Liquidado:</span>
                  <span style={{ fontWeight: '700', color: '#003471' }}>{viewingSlip.periodLabel || 'Mayo-2026'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Estado:</span>
                  <span style={{ 
                    fontWeight: '700', 
                    color: (viewingSlip.status === 'pagada' || viewingSlip.status === 'PAGADA') ? '#16a34a' : '#ea580c'
                  }}>
                    {(viewingSlip.status === 'pagada' || viewingSlip.status === 'PAGADA') ? 'PAGADA' : 'PENDIENTE'}
                  </span>
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', color: '#475569' }}>Concepto Liquidado</th>
                      <th style={{ padding: '10px 12px', color: '#475569', textAlign: 'center' }}>Cantidad</th>
                      <th style={{ padding: '10px 12px', color: '#475569', textAlign: 'right' }}>Tarifa</th>
                      <th style={{ padding: '10px 12px', color: '#475569', textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '500' }}>Haberes por Jornal de Asistencia</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{viewingSlip.workedDaysSnapshot ?? viewingSlip.workedDays ?? 0} días</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>S/ {(viewingSlip.payPerDaySnapshot ?? viewingSlip.pay_per_day ?? 0).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>
                        S/ {(viewingSlip.totalAmount ?? viewingSlip.totalPay ?? 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
                      <td colSpan="3" style={{ padding: '10px 12px', textAlign: 'right' }}>Total Neto Recibido:</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#003471', fontSize: '1rem' }}>
                        S/ {(viewingSlip.totalAmount ?? viewingSlip.totalPay ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {viewingSlip.notes && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginBottom: '1.5rem', background: '#f1f5f9', padding: '8px 12px', borderRadius: '6px' }}>
                  <strong>Concepto:</strong> {viewingSlip.notes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', fontSize: '0.75rem', color: '#475569' }}>
                <div style={{ width: '45%', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', textAlign: 'center' }}>
                  Firma Empleador (Administrador)
                </div>
                <div style={{ width: '45%', borderTop: '1px solid #cbd5e1', paddingTop: '0.5rem', textAlign: 'center' }}>
                  Firma del Colaborador
                </div>
              </div>
            </div>

            {/* Modal actions footer */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}
                onClick={() => {
                  const printContent = document.getElementById('printable-slip').innerHTML;
                  const styleStr = `
                    <style>
                      body { background: white; color: black; padding: 2cm; font-family: sans-serif; }
                      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                      th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                      th { background-color: #f1f5f9; }
                    </style>
                  `;
                  const win = window.open('', '_blank');
                  win.document.write('<html><head><title>Boleta de Pago de Haberes</title>' + styleStr + '</head><body>' + printContent + '</body></html>');
                  win.document.close();
                  win.focus();
                  win.print();
                  win.close();
                }}
              >
                <Printer size={14} /> Imprimir Boleta
              </button>
              <button 
                type="button" 
                className="btn-premium" 
                style={{ background: 'linear-gradient(135deg, #003471 0%, #002856 100%)', color: 'white', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => setViewingSlip(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
