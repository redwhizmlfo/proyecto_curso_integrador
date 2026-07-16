import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Clock, Check, LogOut, XOctagon, RefreshCw, Calendar, FileText, Printer, ArrowUpRight, ArrowDownRight, UserMinus, FileClock } from 'lucide-react';

export default function Asistencia() {
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Voucher modal states
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empList, logList] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance')
      ]);
      setEmployees(empList.filter(e => e.isActive));
      setLogs(logList);
      setError(null);
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError('Servidor backend offline. Usando panel demo de asistencia.');
      setEmployees([
        { id: 'e1', initials: 'CM', name: 'Carlos Mendoza', role: 'Vendedor Cajero', dni: '44558899', payPerDay: 80.00, workedDays: 5.0, todayStatus: 'en turno', attendanceToday: true, canMarkExit: true },
        { id: 'e2', initials: 'JP', name: 'Juan Pérez Almacén', role: 'Encargado Almacén', dni: '44558877', payPerDay: 90.00, workedDays: 6.0, todayStatus: 'asistio', attendanceToday: true, canMarkExit: false },
        { id: 'e3', initials: 'LL', name: 'Lucía Lima', role: 'Administradora', dni: '44558855', payPerDay: 120.00, workedDays: 4.0, todayStatus: null, attendanceToday: false, canMarkExit: false }
      ]);
      setLogs([
        { id: 'l1', employeeName: 'Carlos Mendoza', workDate: '2026-05-19', entryAt: '2026-05-19T08:00:00Z', exitAt: null, status: 'en turno', employee: { id: 'e1', name: 'Carlos Mendoza' } },
        { id: 'l2', employeeName: 'Juan Pérez Almacén', workDate: '2026-05-19', entryAt: '2026-05-19T07:55:00Z', exitAt: '2026-05-19T17:00:00Z', status: 'asistio', employee: { id: 'e2', name: 'Juan Pérez Almacén' } },
        { id: 'l3', employeeName: 'Lucía Lima', workDate: '2026-05-18', entryAt: '2026-05-18T08:02:00Z', exitAt: '2026-05-18T18:00:00Z', status: 'asistio', employee: { id: 'e3', name: 'Lucía Lima' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEntry = async (employeeId) => {
    const request = {
      employeeId: employeeId,
      markedByUserId: '00000000-0000-0000-0000-000000000001' // Default Admin
    };

    try {
      if (error) {
        // Simulation
        setEmployees(employees.map(e => {
          if (e.id === employeeId) {
            return { ...e, todayStatus: 'en turno', attendanceToday: true, canMarkExit: true };
          }
          return e;
        }));
        
        const empName = employees.find(e => e.id === employeeId)?.name || 'Empleado';
        const newLog = {
          id: 'log' + Date.now(),
          employeeName: empName,
          workDate: new Date().toISOString().split('T')[0],
          entryAt: new Date().toISOString(),
          exitAt: null,
          status: 'en turno',
          employee: { id: employeeId, name: empName }
        };
        setLogs([newLog, ...logs]);
      } else {
        await api.post('/attendance/entry', request);
      }
      alert('Entrada marcada con éxito.');
      loadData();
    } catch (err) {
      alert('Error al marcar entrada: ' + err.message);
    }
  };

  const handleExit = async (employeeId) => {
    const request = {
      employeeId: employeeId,
      markedByUserId: '00000000-0000-0000-0000-000000000001'
    };

    try {
      if (error) {
        // Simulation
        setEmployees(employees.map(e => {
          if (e.id === employeeId) {
            return { ...e, todayStatus: 'asistio', workedDays: (e.workedDays || 0) + 1, canMarkExit: false };
          }
          return e;
        }));
        
        // Find existing log of today and fill exit
        const todayStr = new Date().toISOString().split('T')[0];
        const updatedLogs = logs.map(l => {
          const emp = employees.find(e => e.id === employeeId);
          if ((l.employee?.id === employeeId || l.employeeName === emp?.name) && l.workDate === todayStr) {
            return { ...l, exitAt: new Date().toISOString(), status: 'asistio' };
          }
          return l;
        });
        setLogs(updatedLogs);
      } else {
        await api.post('/attendance/exit', request);
      }
      alert('Salida marcada con éxito.');
      loadData();
    } catch (err) {
      alert('Error al marcar salida: ' + err.message);
    }
  };

  const handleAbsence = async (employeeId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const request = {
      employeeId: employeeId,
      markedByUserId: '00000000-0000-0000-0000-000000000001',
      workDate: todayStr
    };

    if (!window.confirm('¿Registrar inasistencia (falta) para el empleado seleccionado hoy?')) return;

    try {
      if (error) {
        // Simulation
        setEmployees(employees.map(e => {
          if (e.id === employeeId) {
            return { ...e, todayStatus: 'falto', attendanceToday: true, canMarkExit: false };
          }
          return e;
        }));
        
        const empName = employees.find(e => e.id === employeeId)?.name || 'Empleado';
        const newLog = {
          id: 'log' + Date.now(),
          employeeName: empName,
          workDate: todayStr,
          entryAt: null,
          exitAt: null,
          status: 'falto',
          employee: { id: employeeId, name: empName }
        };
        setLogs([newLog, ...logs]);
      } else {
        await api.post('/attendance/absence', request);
      }
      alert('Falta registrada con éxito.');
      loadData();
    } catch (err) {
      alert('Error al registrar inasistencia: ' + err.message);
    }
  };

  const handlePermission = async (employeeId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const request = {
      employeeId: employeeId,
      markedByUserId: '00000000-0000-0000-0000-000000000001',
      workDate: todayStr
    };

    if (!window.confirm('¿Registrar permiso para el empleado seleccionado hoy?')) return;

    try {
      if (error) {
        // Simulation
        setEmployees(employees.map(e => {
          if (e.id === employeeId) {
            return { ...e, todayStatus: 'permiso', attendanceToday: false, canMarkExit: false };
          }
          return e;
        }));
        
        const empName = employees.find(e => e.id === employeeId)?.name || 'Empleado';
        const newLog = {
          id: 'log' + Date.now(),
          employeeName: empName,
          workDate: todayStr,
          entryAt: null,
          exitAt: null,
          status: 'permiso',
          employee: { id: employeeId, name: empName }
        };
        setLogs([newLog, ...logs]);
      } else {
        await api.post('/attendance/permission', request);
      }
      alert('Permiso registrado con éxito.');
      loadData();
    } catch (err) {
      alert('Error al registrar permiso: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'asistio':
        return <span className="badge badge-success">Asistió</span>;
      case 'en turno':
        return <span className="badge badge-info">En Turno</span>;
      case 'falto':
        return <span className="badge badge-danger">Faltó</span>;
      case 'permiso':
        return <span className="badge badge-warning">Permiso</span>;
      default:
        return <span className="badge badge-muted">Sin marcar</span>;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return new Date(timeStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Handle standard date format conversion safely
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const openVoucher = (emp) => {
    setSelectedEmployee(emp);
    setShowVoucherModal(true);
  };

  const getEmployeeLogs = (emp) => {
    if (!emp) return [];
    return logs.filter(log => {
      return (log.employee?.id === emp.id || 
              log.employeeId === emp.id || 
              log.employeeName === emp.name || 
              log.employee?.name === emp.name);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Control de Asistencia" 
        subtitle="Reporte de días trabajados, salarios diarios y vouchers de pago semanales"
      >
        <button className="btn-secondary" onClick={loadData}>
          <RefreshCw size={14} style={{ marginRight: '4px' }} /> Actualizar
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Side: Daily Clock panel */}
        <div className="luxury-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Marcación y Control de Salarios
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {employees.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
                No hay empleados activos registrados en el sistema.
              </div>
            ) : (
              employees.map((emp) => {
                const status = emp.todayStatus;
                const isEnTurno = status === 'en turno' || status === 'EN_TURNO';
                const isAsistio = status === 'asistio' || status === 'ASISTIO';
                const isFalto = status === 'falto' || status === 'FALTO';
                const isPermiso = status === 'permiso' || status === 'PERMISO';

                return (
                  <div 
                    key={emp.id} 
                    className="luxury-card" 
                    style={{ 
                      marginBottom: 0, 
                      padding: '1.2rem', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      border: isEnTurno ? '1px solid rgba(0, 242, 255, 0.2)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: isEnTurno ? 'rgba(0, 242, 255, 0.15)' : 'rgba(255,255,255,0.05)', 
                          color: isEnTurno ? 'var(--accent)' : 'var(--text-secondary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: '700',
                          border: isEnTurno ? '1px solid var(--accent)' : '1px solid var(--glass-border)'
                        }}
                      >
                        {emp.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.role}</div>
                        <div style={{ fontSize: '0.75rem', color: '#004B93', fontWeight: '600', marginTop: '0.2rem' }}>
                          Pago Diario: S/. {emp.payPerDay?.toFixed(2)} | Días: {Math.round(emp.workedDays || 0)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      {/* Status indicator */}
                      <div>{getStatusBadge(status)}</div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {!status && (
                          <>
                            <button 
                              className="btn-premium" 
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', background: 'linear-gradient(45deg, #4cd137, #44bd32)', color: 'white', borderRadius: '6px', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => handleEntry(emp.id)}
                              title="Marcar Entrada"
                            >
                              <ArrowUpRight size={14} /> Entrada
                            </button>
                            <button 
                              className="btn-danger" 
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => handleAbsence(emp.id)}
                              title="Marcar Falta"
                            >
                              <UserMinus size={14} /> Falta
                            </button>
                            <button 
                              className="btn-secondary" 
                              style={{ 
                                padding: '0.4rem 0.6rem', 
                                fontSize: '0.75rem', 
                                borderRadius: '6px', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.25rem', 
                                border: '1px solid #f59e0b', 
                                background: 'rgba(245, 158, 11, 0.08)', 
                                color: '#d97706',
                                fontWeight: '600'
                              }}
                              onClick={() => handlePermission(emp.id)}
                              title="Registrar Permiso"
                            >
                              <FileClock size={14} /> Permiso
                            </button>
                          </>
                        )}
                        {isEnTurno && (
                          <button 
                            className="btn-premium" 
                            style={{ 
                              padding: '0.4rem 0.6rem', 
                              fontSize: '0.75rem', 
                              background: 'linear-gradient(45deg, #e84118, #c23616)', 
                              color: 'white', 
                              borderRadius: '6px', 
                              minWidth: 'auto', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.2rem' 
                            }}
                            onClick={() => handleExit(emp.id)}
                            title="Marcar Salida"
                          >
                            <ArrowDownRight size={12} /> Salida
                          </button>
                        )}
                        {(isAsistio || isFalto || isPermiso) && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Completado</span>
                        )}

                        {/* Voucher Button */}
                        <button
                          className="btn-secondary"
                          style={{ 
                            padding: '0.4rem 0.6rem', 
                            fontSize: '0.75rem', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.25rem', 
                            border: '1px solid #cbd5e1', 
                            background: '#ffffff', 
                            color: '#004B93',
                            fontWeight: '600'
                          }}
                          onClick={() => openVoucher(emp)}
                          title="Ver Voucher de Asistencia"
                        >
                          <FileText size={12} /> Voucher
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Attendance Logs */}
        <div className="luxury-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} /> Historial Reciente
          </h2>

          <div className="table-container">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Empleado</th>
                  <th>Ingreso</th>
                  <th>Salida</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      No hay registros en el historial.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const empName = log.employeeName || log.employee?.name || 'Empleado';
                    return (
                      <tr key={log.id}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(log.workDate)}</td>
                        <td style={{ fontWeight: '600' }}>{empName}</td>
                        <td style={{ fontFamily: 'monospace' }}>{formatTime(log.entryAt)}</td>
                        <td style={{ fontFamily: 'monospace' }}>{formatTime(log.exitAt)}</td>
                        <td>{getStatusBadge(log.status)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Voucher and Payroll Modal */}
      {showVoucherModal && selectedEmployee && (
        <div style={{
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
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            animation: 'fadeInOnly 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #003471 0%, #001e44 100%)',
              color: '#ffffff',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0, letterSpacing: '0.5px', color: '#ffffff' }}>
                  Voucher y Boleta de Asistencia
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#93c5fd', margin: '4px 0 0 0' }}>
                  Resumen de asistencia y liquidación salarial de {selectedEmployee.name}
                </p>
              </div>
              <button 
                onClick={() => setShowVoucherModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: '800' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Voucher Card (Print area) */}
              <div id="print-voucher-area" style={{
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '1.5rem',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {/* Brand Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #cbd5e1', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#003471', fontSize: '1.1rem', fontWeight: '800' }}>MEPS GROUP PERÚ S.A.C.</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>RUC: 20601234567 | Av. Argentina 1450, Lima</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      DOCUMENTO INTERNO
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                      Fecha emisión: {new Date().toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                {/* Employee info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Colaborador:</p>
                    <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>{selectedEmployee.name}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>N° Documento (DNI):</p>
                    <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>{selectedEmployee.dni || '00000000'}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Cargo/Rol:</p>
                    <p style={{ margin: 0, fontWeight: '600', color: '#334155' }}>{selectedEmployee.role}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', color: '#64748b' }}>Pago por Día:</p>
                    <p style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>S/. {selectedEmployee.payPerDay?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Attendance table */}
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Detalle de Asistencia en el Historial
                </h5>
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '1.2rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Fecha</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Ingreso</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Salida</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600' }}>Estado</th>
                        <th style={{ padding: '8px 12px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const empLogs = getEmployeeLogs(selectedEmployee);
                        if (empLogs.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#94a3b8' }}>
                                No se encontraron registros de asistencia para este empleado.
                              </td>
                            </tr>
                          );
                        }
                        return empLogs.map(log => {
                          const isAsistio = log.status?.toLowerCase() === 'asistio';
                          const isEnTurno = log.status?.toLowerCase() === 'en turno';
                          const isPermiso = log.status?.toLowerCase() === 'permiso';
                          const dailyPay = isAsistio ? selectedEmployee.payPerDay : 0;
                          
                          let bg = '#fee2e2'; // default: falto
                          let fg = '#b91c1c';
                          if (isAsistio) {
                            bg = '#dcfce7';
                            fg = '#15803d';
                          } else if (isEnTurno) {
                            bg = '#e0f2fe';
                            fg = '#0369a1';
                          } else if (isPermiso) {
                            bg = '#fef3c7'; // amber
                            fg = '#b45309';
                          }

                          return (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 12px' }}>{formatDate(log.workDate)}</td>
                              <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{formatTime(log.entryAt)}</td>
                              <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{formatTime(log.exitAt)}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontWeight: '600',
                                  background: bg,
                                  color: fg
                                }}>
                                  {log.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: isAsistio ? '#15803d' : '#94a3b8' }}>
                                S/. {dailyPay.toFixed(2)}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Payment summary grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  {(() => {
                    const empLogs = getEmployeeLogs(selectedEmployee);
                    const totalDays = empLogs.filter(l => l.status?.toLowerCase() === 'asistio').length;
                    
                    // Weekly breakdown (last 7 days)
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const weeklyDays = empLogs.filter(l => {
                      const logDate = new Date(l.workDate + 'T12:00:00');
                      return logDate >= sevenDaysAgo && l.status?.toLowerCase() === 'asistio';
                    }).length;

                    return (
                      <>
                        <div style={{ borderRight: '1px solid #cbd5e1', paddingRight: '1rem' }}>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '600' }}>Pago Semanal (Últimos 7 días)</span>
                          <h4 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>
                            S/. {(weeklyDays * selectedEmployee.payPerDay).toFixed(2)}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#475569' }}>Basado en {weeklyDays} días asistidos</span>
                        </div>
                        <div style={{ paddingLeft: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '600' }}>Total Acumulado (Historial)</span>
                          <h4 style={{ margin: '4px 0 0 0', color: '#003471', fontSize: '1.25rem', fontWeight: '800' }}>
                            S/. {(totalDays * selectedEmployee.payPerDay).toFixed(2)}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#475569' }}>Basado en {totalDays} días asistidos</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Signature line for printing */}
                <div style={{ display: 'none', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid #cbd5e1', paddingTop: '1.5rem' }} className="print-only-signatures">
                  <div style={{ textAlign: 'center', width: '45%' }}>
                    <div style={{ height: '50px' }}></div>
                    <div style={{ borderTop: '1px solid #94a3b8', fontSize: '0.75rem', color: '#475569' }}>Firma del Empleado</div>
                  </div>
                  <div style={{ textAlign: 'center', width: '45%' }}>
                    <div style={{ height: '50px' }}></div>
                    <div style={{ borderTop: '1px solid #94a3b8', fontSize: '0.75rem', color: '#475569' }}>Firma del Administrador</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem'
            }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowVoucherModal(false)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Cerrar
              </button>
              <button 
                className="btn-premium"
                onClick={() => {
                  const printContent = document.getElementById('print-voucher-area').innerHTML;
                  const styleStr = `
                    <style>
                      body { background: white; color: black; padding: 2cm; font-family: sans-serif; }
                      .print-only-signatures { display: flex !important; }
                      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                      th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                      th { background-color: #f1f5f9; }
                    </style>
                  `;
                  const win = window.open('', '_blank');
                  win.document.write('<html><head><title>Boleta de Asistencia y Pago</title>' + styleStr + '</head><body>' + printContent + '</body></html>');
                  win.document.close();
                  win.focus();
                  win.print();
                  win.close();
                }}
                style={{ background: 'linear-gradient(135deg, #003471 0%, #002856 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: '600' }}
              >
                Imprimir Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
