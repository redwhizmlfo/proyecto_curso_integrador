import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { DollarSign, FileText, CheckCircle, Plus, Eye, Printer } from 'lucide-react';

export default function Boletas() {
  const [slips, setSlips] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSlip, setViewingSlip] = useState(null);

  // Form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [workDays, setWorkDays] = useState(15);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setWorkDays(activeEmps[0].workedDays || 15);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading payroll slips data:', err);
      setError('Servidor backend offline. Usando panel demo de boletas de pago.');
      setSlips([
        { id: 'sl1', employeeName: 'Carlos Mendoza', role: 'Vendedor Cajero', pay_per_day: 60.00, workedDays: 14.5, totalPay: 870.00, status: 'pagada', paidAt: '2026-05-15T18:00:00Z', generated_at: '2026-05-15T10:00:00Z', notes: 'Quincena 1 - Mayo 2026' },
        { id: 'sl2', employeeName: 'Juan Pérez Almacén', role: 'Encargado Almacén', pay_per_day: 65.00, workedDays: 15.0, totalPay: 975.00, status: 'pendiente', paidAt: null, generated_at: '2026-05-15T10:00:00Z', notes: 'Quincena 1 - Mayo 2026' }
      ]);
      setEmployees([
        { id: 'e1', name: 'Carlos Mendoza', role: 'Vendedor Cajero', payPerDay: 60.00, workedDays: 14.5 },
        { id: 'e2', name: 'Juan Pérez Almacén', role: 'Encargado Almacén', payPerDay: 65.00, workedDays: 15.0 },
        { id: 'e3', name: 'Lucía Lima', role: 'Administradora', payPerDay: 120.00, workedDays: 16.0 }
      ]);
      setSelectedEmployeeId('e1');
      setWorkDays(14.5);
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
      setWorkDays(emp.workedDays || 15);
    }
  };

  const handleGenerateSlip = async (e) => {
    e.preventDefault();
    const request = {
      employeeId: selectedEmployeeId,
      workDays: parseFloat(workDays),
      calculationNotes: notes,
      generatedByUserId: '00000000-0000-0000-0000-000000000001'
    };

    try {
      if (error) {
        // Simulation
        const emp = employees.find(e => e.id === selectedEmployeeId);
        const newSlip = {
          id: 'sl' + Date.now(),
          employeeName: emp?.name || 'Empleado',
          role: emp?.role || 'Personal',
          pay_per_day: emp?.payPerDay || 50.00,
          workedDays: parseFloat(workDays),
          totalPay: (emp?.payPerDay || 50.00) * parseFloat(workDays),
          status: 'pendiente',
          paidAt: null,
          generated_at: new Date().toISOString(),
          notes: notes
        };
        setSlips([newSlip, ...slips]);
        
        // Reset employee worked days locally
        setEmployees(employees.map(e => e.id === selectedEmployeeId ? { ...e, workedDays: 0 } : e));
      } else {
        await api.post('/slips/generate', request);
      }
      alert('Boleta de pago generada con éxito.');
      setShowCreateModal(false);
      setNotes('');
      loadData();
    } catch (err) {
      alert('Error al generar boleta: ' + err.message);
    }
  };

  const handlePaySlip = async (slipId) => {
    if (!window.confirm('¿Confirmar pago de esta boleta de sueldo?')) return;
    try {
      const dummyPaidBy = '00000000-0000-0000-0000-000000000001';
      if (error) {
        setSlips(slips.map(s => s.id === slipId ? { ...s, status: 'pagada', paidAt: new Date().toISOString() } : s));
      } else {
        await api.post(`/slips/${slipId}/pay?paidByUserId=${dummyPaidBy}`);
      }
      alert('Boleta marcada como PAGADA con éxito.');
      loadData();
    } catch (err) {
      alert('Error al procesar pago: ' + err.message);
    }
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const calculatedTotal = selectedEmployee ? (selectedEmployee.payPerDay * workDays).toFixed(2) : '0.00';

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
      <div className="header">
        <div>
          <h1 className="title-gradient">Boletas de Pago</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Cálculo quincenal/mensual de haberes del personal y comprobantes de abono</p>
        </div>
        <button className="btn-premium" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Generar Boleta
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Slips list */}
      <div className="luxury-card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> Comprobantes Emitidos
        </h2>

        <div className="table-container">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Código Boleta</th>
                <th>Empleado</th>
                <th>Fecha Emisión</th>
                <th style={{ textAlign: 'right' }}>Días Liquidados</th>
                <th style={{ textAlign: 'right' }}>Salario Diario</th>
                <th style={{ textAlign: 'right' }}>Monto Neto a Pagar</th>
                <th>Estado</th>
                <th>Fecha Pago</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {slips.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                    No se registran boletas de pago generadas.
                  </td>
                </tr>
              ) : (
                slips.map((s) => {
                  const isPending = s.status === 'pendiente' || s.status === 'PENDIENTE';
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>#{s.id.slice(0, 8).toUpperCase()}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{s.employeeName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.role}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(s.generated_at)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{s.workedDays}</td>
                      <td style={{ textAlign: 'right' }}>S/ {(s.pay_per_day || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        S/ {s.totalPay.toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${isPending ? 'badge-warning' : 'badge-success'}`}>
                          {isPending ? 'Pendiente' : 'Pagada'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.paidAt ? formatDate(s.paidAt) : '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '8px', minWidth: 'auto' }}
                            onClick={() => setViewingSlip(s)}
                          >
                            <Eye size={12} />
                          </button>
                          {isPending ? (
                            <button 
                              className="btn-premium" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'linear-gradient(45deg, #4cd137, #44bd32)', color: 'white' }}
                              onClick={() => handlePaySlip(s.id)}
                            >
                              <DollarSign size={12} /> Pagar
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>Abonado</span>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '400', letterSpacing: '1px' }}>
              Liquidar Boleta de Sueldo
            </h2>
            <form onSubmit={handleGenerateSlip}>
              <div className="form-group">
                <label>Seleccionar Empleado *</label>
                <select 
                  className="form-select" 
                  value={selectedEmployeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role}) [S/ {e.payPerDay.toFixed(2)}/día]
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Días Trabajados en el Periodo *</label>
                <input 
                  type="number" 
                  step="0.5" 
                  className="form-input" 
                  required 
                  min="0.5"
                  value={workDays}
                  onChange={(e) => setWorkDays(e.target.value)}
                />
                {selectedEmployee && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.3rem' }}>
                    Días acumulados en sistema hoy: <strong>{selectedEmployee.workedDays} días</strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Concepto / Notas de Liquidación</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Ej. Liquidación del 01 al 15 de Mayo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {selectedEmployee && (
                <div style={{ background: 'rgba(212,175,55,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent-gold)', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Previsualización del Pago
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    <span>Costo base diario:</span>
                    <span>S/ {selectedEmployee.payPerDay.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.3rem' }}>
                    <span>Días multiplicados:</span>
                    <span>x {workDays}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '700' }}>
                    <span>Total Neto a Pagar:</span>
                    <span style={{ color: 'var(--accent-gold)' }}>S/ {calculatedTotal}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn-premium">Confirmar y Emitir</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View / Print Slip details */}
      {viewingSlip && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: 0 }}>
            {/* Printable Area */}
            <div id="printable-slip" style={{ padding: '2.5rem', background: '#0a0a0a', color: '#fff' }}>
              <div style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--accent)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Ferretería Luxury</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RUC: 20104829384 | Av. Los Ángeles 452, Lima</p>
                <h4 style={{ margin: '1rem 0 0', fontWeight: '400', fontSize: '1.1rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Boleta de Pago de Haberes</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Código: #{viewingSlip.id.slice(0, 12).toUpperCase()}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Empleado:</span>
                  <span style={{ fontWeight: '600' }}>{viewingSlip.employeeName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cargo:</span>
                  <span>{viewingSlip.role}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Fecha Emisión:</span>
                  <span>{formatDate(viewingSlip.generated_at)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estado:</span>
                  <span style={{ fontWeight: '600', color: viewingSlip.status === 'pagada' ? 'var(--success)' : 'var(--warning)' }}>
                    {viewingSlip.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span>Días Liquidados:</span>
                  <span style={{ fontWeight: '600' }}>{viewingSlip.workedDays}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <span>Jornal Diario:</span>
                  <span>S/ {(viewingSlip.pay_per_day || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700' }}>
                  <span>Total Neto Abonado:</span>
                  <span style={{ color: 'var(--accent-gold)' }}>S/ {viewingSlip.totalPay.toFixed(2)}</span>
                </div>
              </div>

              {viewingSlip.notes && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  <strong>Detalle:</strong> {viewingSlip.notes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: '45%', borderTop: '1px solid var(--text-muted)', paddingTop: '0.5rem', textAlign: 'center' }}>
                  Firma Empleador
                </div>
                <div style={{ width: '45%', borderTop: '1px solid var(--text-muted)', paddingTop: '0.5rem', textAlign: 'center' }}>
                  Firma Empleado
                </div>
              </div>
            </div>

            {/* Modal actions footer */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', padding: '1.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.4)', borderRadius: '0 0 20px 20px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={() => window.print()}
              >
                <Printer size={14} /> Imprimir Comprobante
              </button>
              <button type="button" className="btn-premium" onClick={() => setViewingSlip(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
