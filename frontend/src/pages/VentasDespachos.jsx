import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { Truck, Calendar, User, Printer, Trash2, CheckCircle2, ChevronRight, X, MapPin } from 'lucide-react';

export default function VentasDespachos() {
  const [dispatches, setDispatches] = useState([]);
  const [selectedDesp, setSelectedDesp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadDispatches = () => {
    const stored = localStorage.getItem('inventory_dispatches');
    if (stored) {
      setDispatches(JSON.parse(stored));
    } else {
      setDispatches([]);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este registro de despacho?')) {
      const updated = dispatches.filter(d => d.id !== id);
      setDispatches(updated);
      localStorage.setItem('inventory_dispatches', JSON.stringify(updated));
    }
  };

  const updateStatus = (id, newStatus, e) => {
    if (e) e.stopPropagation();
    const updated = dispatches.map(d => d.id === id ? { ...d, status: newStatus } : d);
    setDispatches(updated);
    localStorage.setItem('inventory_dispatches', JSON.stringify(updated));
    
    if (selectedDesp && selectedDesp.id === id) {
      setSelectedDesp({ ...selectedDesp, status: newStatus });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleOpenDetails = (desp) => {
    setSelectedDesp(desp);
    setShowDetailModal(true);
  };

  // Print a formal Guía de Remisión de Remitente (remission guide) in A4/thermal format
  const handlePrintGuide = (desp) => {
    const printWindow = window.open('', '_blank', 'width=650,height=800');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes (pop-ups) para imprimir la guía.');
      return;
    }

    const itemsRows = desp.items.map((item, idx) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; text-align: center;">${parseInt(item.qty)}</td>
        <td style="padding: 8px; text-align: center;">PZA</td>
        <td style="padding: 8px;">${item.name}</td>
        <td style="padding: 8px; text-align: center;">${item.barcode}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Guía de Remisión Electrónica - ${desp.docNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 30px;
              color: #333;
              font-size: 12px;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #003471;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .logo-area {
              flex: 1;
            }
            .logo-title {
              font-size: 22px;
              font-weight: bold;
              color: #003471;
            }
            .ruc-box {
              border: 2px solid #003471;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              min-width: 220px;
              background: #f8fafc;
            }
            .ruc-title {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .doc-number {
              font-size: 16px;
              font-weight: bold;
              color: #ff6b00;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              color: #003471;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin: 15px 0 8px 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-card {
              background: #fdfdfd;
              border: 1px solid #e2e8f0;
              padding: 10px;
              border-radius: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              margin-bottom: 30px;
            }
            th {
              background: #003471;
              color: white;
              padding: 8px;
              font-size: 11px;
              text-transform: uppercase;
            }
            .signature-section {
              display: flex;
              justify-content: space-around;
              margin-top: 80px;
            }
            .signature-box {
              border-top: 1px solid #333;
              width: 200px;
              text-align: center;
              padding-top: 8px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="logo-area">
              <div class="logo-title">MEPS GROUP PERÚ S.A.C.</div>
              <div style="font-size: 11px; color: #5c6b73; margin-top: 4px;">
                Ferretería Industrial & Materiales de Construcción<br/>
                Av. Industrial 450 - Lima, Perú<br/>
                Telf: (01) 450-8080 &bull; ventas@mepsgroup.pe
              </div>
            </div>
            <div class="ruc-box">
              <div class="ruc-title">R.U.C. 20601234567</div>
              <div style="font-weight: bold; font-size: 12px; margin: 5px 0;">GUÍA DE REMISIÓN REMITENTE</div>
              <div class="doc-number">${desp.docNumber}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="section-title">DATOS DE TRASLADO</div>
              <strong>Fecha de Emisión:</strong> ${new Date(desp.date).toLocaleDateString()}<br/>
              <strong>Motivo de Traslado:</strong> Venta con entrega a domicilio/obra<br/>
              <strong>Modalidad de Transporte:</strong> Transporte Privado / Terrestre<br/>
              <strong>Nro Pedido Asociado:</strong> ${desp.orderNumber}<br/>
            </div>
            <div class="info-card">
              <div class="section-title">DESTINATARIO</div>
              <strong>Razón Social/Nombre:</strong> ${desp.customer.name}<br/>
              <strong>Documento (${desp.customer.docType}):</strong> ${desp.customer.docNumber}<br/>
              <strong>Dirección de Partida:</strong> Av. Industrial 450, Lima (Almacén Lurín)<br/>
              <strong>Dirección de Destino:</strong> ${desp.destinationAddress}<br/>
            </div>
          </div>

          <div class="section-title">DETALLE DE LOS BIENES A DESPACHAR</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">Ítem</th>
                <th style="width: 80px;">Cantidad</th>
                <th style="width: 80px;">Medida</th>
                <th>Descripción del Producto</th>
                <th style="width: 120px;">Código/SKU</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="font-size: 11px; background: #fffbeb; border: 1px solid #fef3c7; padding: 10px; border-radius: 6px; color: #b45309; margin-bottom: 40px;">
            <strong>Nota Importante:</strong> El transportista y el cliente final deben firmar en señal de conformidad al entregar/recibir los materiales en la obra correspondiente. Cualquier disconformidad con el embalaje o piezas físicas debe reportarse en esta misma guía.
          </div>

          <div class="signature-section">
            <div class="signature-box">
              <strong>Firma del Transportista</strong><br/>
              Nombre:<br/>
              DNI:
            </div>
            <div class="signature-box">
              <strong>Recibido por (Cliente)</strong><br/>
              Nombre:<br/>
              DNI/RUC:
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Preparando Embalaje':
        return '#fbc531'; // Warning Yellow
      case 'En Ruta':
        return '#0096ff'; // Blue
      case 'Entregado':
        return '#4cd137'; // Green
      default:
        return '#8397ab';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Despacho de Pedidos" subtitle="Seguimiento de envío de materiales y emisión de guías de remisión de remitente" />

      {dispatches.length === 0 ? (
        <div className="luxury-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Truck size={48} style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--accent)' }} />
          <p style={{ fontWeight: '600', fontSize: '1rem' }}>No se registran despachos generados.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>Los despachos se crean al presionar "Despachar" en las órdenes confirmadas del submódulo de Pedidos.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
          {dispatches.map((desp) => (
            <div 
              key={desp.id}
              className="luxury-card interactive"
              onClick={() => handleOpenDetails(desp)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                border: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left'
              }}
            >
              {/* Decorative top border colored by status */}
              <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: getStatusColor(desp.status) }} />
              
              <div>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '800', 
                      background: 'rgba(0,52,113,0.05)', 
                      color: 'var(--accent)', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      textTransform: 'uppercase' 
                    }}>
                      DESPACHO
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {desp.docNumber}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(desp.id, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', marginLeft: 'auto' }}
                    title="Eliminar despacho"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} /> {formatDate(desp.date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    <User size={12} /> {desp.customer.name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <MapPin size={12} /> {desp.destinationAddress.substring(0, 32)}...
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '18px' }}>
                    Pedido Origen: {desp.orderNumber} &bull; Método: {desp.paymentMethod}
                  </span>
                </div>

                {/* Status selector */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Estado del Envío:
                  </label>
                  <select 
                    value={desp.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateStatus(desp.id, e.target.value, e)}
                    style={{ 
                      width: '100%', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '6px', 
                      height: '32px', 
                      fontSize: '0.78rem', 
                      padding: '0 0.5rem',
                      fontWeight: '700',
                      color: getStatusColor(desp.status),
                      background: '#f8fafc'
                    }}
                  >
                    <option value="Preparando Embalaje" style={{ color: '#fbc531' }}>📦 Preparando Embalaje</option>
                    <option value="En Ruta" style={{ color: '#0096ff' }}>🚚 En Ruta de Despacho</option>
                    <option value="Entregado" style={{ color: '#4cd137' }}>✅ Entregado a Cliente</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Importe</span>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent)' }}>
                    S/ {parseFloat(desp.total).toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handlePrintGuide(desp); }}
                  className="btn-secondary"
                  style={{
                    fontWeight: '700',
                    fontSize: '0.72rem',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer',
                    height: '30px'
                  }}
                >
                  <Printer size={12} /> Imprimir Guía
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedDesp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)', fontWeight: '800' }}>
                Guía Interna de Despacho {selectedDesp.docNumber}
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
              <div><strong>Destinatario:</strong> {selectedDesp.customer.name}</div>
              <div><strong>Documento:</strong> {selectedDesp.customer.docType} {selectedDesp.customer.docNumber}</div>
              <div><strong>Fecha de Envío:</strong> {formatDate(selectedDesp.date)}</div>
              <div><strong>Punto de Partida:</strong> {selectedDesp.originAddress}</div>
              <div><strong>Punto de Llegada:</strong> {selectedDesp.destinationAddress}</div>
              <div><strong>Método de Cobro:</strong> {selectedDesp.paymentMethod}</div>
              
              <div style={{ marginTop: '0.4rem' }}>
                <strong>Estado Logístico:</strong> 
                <span style={{ marginLeft: '6px', fontWeight: '800', color: getStatusColor(selectedDesp.status) }}>
                  {selectedDesp.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: '#0a1629', marginBottom: '0.4rem' }}>
                Bienes para Entrega
              </h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'left' }}>Descripción</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '70px' }}>Cant</th>
                      <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center', width: '120px' }}>Código/SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDesp.items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.4rem 0.6rem' }}>{it.name}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: '700' }}>{parseFloat(it.qty).toFixed(0)}</td>
                        <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center', color: '#7f8c8d' }}>{it.barcode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
              <button 
                onClick={() => handlePrintGuide(selectedDesp)}
                className="btn-premium" 
                style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Printer size={16} /> Imprimir Guía de Remisión
              </button>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="btn-secondary"
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
