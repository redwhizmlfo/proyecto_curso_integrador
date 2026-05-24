import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Clock, Check, LogOut, XOctagon, RefreshCw, Calendar } from 'lucide-react';

export default function Asistencia() {
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        { id: 'e1', initials: 'CM', name: 'Carlos Mendoza', role: 'Vendedor Cajero', todayStatus: 'en turno', attendanceToday: true, canMarkExit: true },
        { id: 'e2', initials: 'JP', name: 'Juan Pérez Almacén', role: 'Encargado Almacén', todayStatus: 'asistio', attendanceToday: true, canMarkExit: false },
        { id: 'e3', initials: 'LL', name: 'Lucía Lima', role: 'Administradora', todayStatus: null, attendanceToday: false, canMarkExit: false }
      ]);
      setLogs([
        { id: 'l1', employeeName: 'Carlos Mendoza', workDate: '2026-05-19', entryAt: '2026-05-19T08:00:00Z', exitAt: null, status: 'en turno' },
        { id: 'l2', employeeName: 'Juan Pérez Almacén', workDate: '2026-05-19', entryAt: '2026-05-19T07:55:00Z', exitAt: '2026-05-19T17:00:00Z', status: 'asistio' },
        { id: 'l3', employeeName: 'Lucía Lima', workDate: '2026-05-18', entryAt: '2026-05-18T08:02:00Z', exitAt: '2026-05-18T18:00:00Z', status: 'asistio' }
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
          status: 'en turno'
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
            return { ...e, todayStatus: 'asistio', canMarkExit: false };
          }
          return e;
        }));
        
        // Find existing log of today and fill exit
        const todayStr = new Date().toISOString().split('T')[0];
        const updatedLogs = logs.map(l => {
          if (l.employeeName === employees.find(e => e.id === employeeId)?.name && l.workDate === todayStr) {
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
          status: 'falto'
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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'asistio':
        return <span className="badge badge-success">Asistió</span>;
      case 'en turno':
        return <span className="badge badge-info">En Turno</span>;
      case 'falto':
        return <span className="badge badge-danger">Faltó</span>;
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
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Control de Asistencia" 
        subtitle="Marcación de ingresos/salidas diarias y registro de inasistencias"
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Side: Daily Clock panel */}
        <div className="luxury-card">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: 'var(--accent)', letterSpacing: '1px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Marcación de Asistencia Diaria
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
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Status indicator */}
                      <div>{getStatusBadge(status)}</div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {!status && (
                          <>
                            <button 
                              className="btn-premium" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'linear-gradient(45deg, #4cd137, #44bd32)', color: 'white', borderRadius: '6px', minWidth: 'auto' }}
                              onClick={() => handleEntry(emp.id)}
                            >
                              Entrada
                            </button>
                            <button 
                              className="btn-danger" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px' }}
                              onClick={() => handleAbsence(emp.id)}
                            >
                              Falta
                            </button>
                          </>
                        )}
                        {isEnTurno && (
                          <button 
                            className="btn-premium" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'linear-gradient(45deg, #fbc531, #e1b12c)', color: 'black', borderRadius: '6px', minWidth: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            onClick={() => handleExit(emp.id)}
                          >
                            <LogOut size={12} /> Salida
                          </button>
                        )}
                        {(isAsistio || isFalto) && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completado</span>
                        )}
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
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(log.workDate)}</td>
                      <td style={{ fontWeight: '600' }}>{log.employeeName}</td>
                      <td style={{ fontFamily: 'monospace' }}>{formatTime(log.entryAt)}</td>
                      <td style={{ fontFamily: 'monospace' }}>{formatTime(log.exitAt)}</td>
                      <td>{getStatusBadge(log.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
