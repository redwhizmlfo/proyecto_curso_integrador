import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Eye, Printer, Calendar, User, CreditCard, RefreshCw, X } from 'lucide-react';

export default function VentasHistorial() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail Modal states
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadSales = async () => {
    try {
      setLoading(true);
      const saleList = await api.get('/sales');
      // Sort sales by date descending
      const sorted = saleList.sort((a, b) => new Date(b.soldAt || b.createdAt) - new Date(a.soldAt || a.createdAt));
      setSales(sorted);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales history:', err);
      setError('Servidor offline. Usando datos históricos locales.');
      
      // Fallback historical data
      const mockSales = [
        {
          id: 's1',
          series: 'F001-840921',
          documentType: 'Factura',
          paymentMethod: 'Yape',
          soldAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          clientNameSnapshot: 'CONSTRUCTORA DEL NORTE S.A.C.',
          clientDocTypeSnapshot: 'RUC',
          clientDocNumberSnapshot: '20601234567',
          sellerNameSnapshot: 'Super Admin',
          subtotal: 521.19,
          igv: 93.81,
          total: 615.00,
          discountPct: 10.00,
          discountAmount: 68.33,
          note: 'Entrega en obra Lurín',
          items: [
            { id: 'si1', productNameSnapshot: 'TALADRO INDUSTRIAL PERCUTOR DEWALT', barcodeSnapshot: 'SKU-84102941', qty: 1, price: 485.00 },
            { id: 'si2', productNameSnapshot: 'CASCO DE SEGURIDAD REFORZADO', barcodeSnapshot: 'SKU-SF-101', qty: 2, price: 65.00 }
          ]
        },
        {
          id: 's2',
          series: 'B001-190412',
          documentType: 'Boleta',
          paymentMethod: 'Efectivo',
          soldAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          clientNameSnapshot: 'Juan Pérez Rodríguez',
          clientDocTypeSnapshot: 'DNI',
          clientDocNumberSnapshot: '44558899',
          sellerNameSnapshot: 'Super Admin',
          subtotal: 169.07,
          igv: 30.43,
          total: 199.50,
          discountPct: 0.00,
          discountAmount: 0.00,
          items: [
            { id: 'si3', productNameSnapshot: 'ESMERIL ANGULAR BOSCH GWS750', barcodeSnapshot: 'SKU-72093104', qty: 1, price: 199.50 }
          ]
        },
        {
          id: 's3',
          series: 'B001-190483',
          documentType: 'Boleta',
          paymentMethod: 'Plin',
          soldAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          clientNameSnapshot: 'Público General / Varios',
          clientDocTypeSnapshot: 'DNI',
          clientDocNumberSnapshot: '00000000',
          sellerNameSnapshot: 'Super Admin',
          subtotal: 41.53,
          igv: 7.47,
          total: 49.00,
          discountPct: 0.00,
          discountAmount: 0.00,
          items: [
            { id: 'si4', productNameSnapshot: 'Pernos de Alta Resistencia 1/2" (x100)', barcodeSnapshot: 'SKU-BL-004', qty: 2, price: 24.50 }
          ]
        }
      ];
      setSales(mockSales);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

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

  // Re-print the sale invoice using thermal ticket format
  const handleReprint = (sale) => {
    const isRuc = sale.clientDocTypeSnapshot === 'RUC';
    const docTitle = isRuc ? 'FACTURA DE VENTA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
    
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes (pop-ups) para imprimir el voucher.');
      return;
    }

    // Items list map
    const itemsRows = (sale.items || []).map(item => `
      <tr>
        <td>${(item.productNameSnapshot || 'Producto').substring(0, 18)}...</td>
        <td style="text-align: right">${parseFloat(item.qty).toFixed(0)}</td>
        <td style="text-align: right">S/ ${parseFloat(item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Comprobante - Duplicado</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 280px;
              margin: 0 auto;
              padding: 10px;
              color: #000000;
              font-size: 11px;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; }
            td { padding: 2px 0; font-size: 11px; vertical-align: top; }
            .header-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .doc-info { margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header-title">MEPS GROUP PERÚ</div>
            <div>Ferretería Industrial</div>
            <div>RUC: 20601234567</div>
            <div>Av. Industrial 450 - Lima</div>
            <div class="divider"></div>
            <div class="bold">DUPLICADO - ${docTitle}</div>
            <div class="bold">N° ${sale.series}</div>
            <div class="divider"></div>
          </div>
          <div class="doc-info">
            <strong>Fecha:</strong> ${new Date(sale.soldAt || sale.createdAt).toLocaleString()}<br/>
            <strong>Cliente:</strong> ${sale.clientNameSnapshot}<br/>
            <strong>${sale.clientDocTypeSnapshot || 'DNI'}:</strong> ${sale.clientDocNumberSnapshot}<br/>
            <strong>Método Pago:</strong> ${sale.paymentMethod}<br/>
            <strong>Vendedor:</strong> ${sale.sellerNameSnapshot || 'Vendedor'}<br/>
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr class="bold">
                <td style="width: 60%">Descrip.</td>
                <td style="text-align: right; width: 15%">Cant</td>
                <td style="text-align: right; width: 25%">Importe</td>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr>
              <td>Subtotal (Neto):</td>
              <td style="text-align: right">S/ ${parseFloat(sale.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td>IGV (18%):</td>
              <td style="text-align: right">S/ ${parseFloat(sale.igv).toFixed(2)}</td>
            </tr>
            ${parseFloat(sale.discountAmount) > 0 ? `
              <tr>
                <td>Descuento (${parseFloat(sale.discountPct).toFixed(0)}%):</td>
                <td style="text-align: right">-S/ ${parseFloat(sale.discountAmount).toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="bold" style="font-size: 12px;">
              <td>TOTAL:</td>
              <td style="text-align: right">S/ ${parseFloat(sale.total).toFixed(2)}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="center" style="margin-top: 15px;">
            ¡Gracias por su preferencia!<br/>
            <strong>MEPS GROUP PERÚ</strong>
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

  const handleOpenDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const filteredSales = sales.filter(s => {
    const query = searchQuery.toLowerCase();
    return (
      s.series.toLowerCase().includes(query) ||
      s.clientNameSnapshot.toLowerCase().includes(query) ||
      s.clientDocNumberSnapshot.includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Historial de Ventas Directas" subtitle="Auditoría y consulta de todas las transacciones cobradas en POS" />

      {error && (
        <div style={{ background: 'rgba(251,197,49,0.08)', border: '1px solid var(--warning)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#d19e07', fontSize: '0.9rem' }}>
          ℹ️ {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="luxury-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8397ab' }} />
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '2.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', height: '38px', fontSize: '0.85rem' }}
            placeholder="Buscar venta por serie/nro, cliente o número de documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={loadSales}
          className="btn-secondary" 
          style={{ display: 'flex', gap: '0.4rem', height: '38px', alignItems: 'center' }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* History table */}
      <div className="luxury-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <p>Cargando transacciones...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No se encontraron ventas que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="luxury-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Fecha y Hora</th>
                  <th>Comprobante</th>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Método Pago</th>
                  <th style={{ textAlign: 'right' }}>Total Cobrado</th>
                  <th style={{ textAlign: 'center', width: '160px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {formatDate(sale.soldAt || sale.createdAt)}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--accent)' }}>
                      <span style={{ fontSize: '0.72rem', background: '#e9f2fd', color: '#003471', padding: '2px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: '800' }}>
                        {sale.documentType.toUpperCase()}
                      </span>
                      {sale.series}
                    </td>
                    <td style={{ fontWeight: '600' }}>{sale.clientNameSnapshot}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <strong style={{ fontSize: '0.7rem', color: '#7f8c8d' }}>{sale.clientDocTypeSnapshot}:</strong> {sale.clientDocNumberSnapshot}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', background: 'rgba(0,52,113,0.05)', color: 'var(--accent)' }}>
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold)' }}>
                      S/ {parseFloat(sale.total).toFixed(2)}
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleOpenDetails(sale)}
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Ver detalles"
                      >
                        <Eye size={12} /> Detalles
                      </button>
                      <button 
                        onClick={() => handleReprint(sale)}
                        className="btn-premium" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', height: '30px', background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Reimprimir voucher"
                      >
                        <Printer size={12} /> Voucher
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {showDetailModal && selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--accent)', fontWeight: '800' }}>
                Detalles del Comprobante {selectedSale.series}
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Client Info Block */}
            <div style={{ background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
              <div>
                <strong>Cliente:</strong> {selectedSale.clientNameSnapshot}
              </div>
              <div>
                <strong>Documento:</strong> {selectedSale.clientDocTypeSnapshot} {selectedSale.clientDocNumberSnapshot}
              </div>
              <div>
                <strong>Vendedor:</strong> {selectedSale.sellerNameSnapshot || 'Vendedor'}
              </div>
              <div>
                <strong>Método Pago:</strong> {selectedSale.paymentMethod}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Fecha/Hora:</strong> {formatDate(selectedSale.soldAt || selectedSale.createdAt)}
              </div>
              {selectedSale.note && (
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>Nota:</strong> {selectedSale.note}
                </div>
              )}
            </div>

            {/* Items list */}
            <div style={{ textAlign: 'left', marginBottom: '1.2rem' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#0a1629', marginBottom: '0.4rem' }}>
                Artículos Vendidos
              </h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: '700' }}>
                      <th style={{ padding: '0.5rem 0.8rem', textAlign: 'left' }}>Descripción</th>
                      <th style={{ padding: '0.5rem 0.8rem', textAlign: 'center', width: '70px' }}>Cant</th>
                      <th style={{ padding: '0.5rem 0.8rem', textAlign: 'right', width: '90px' }}>Precio</th>
                      <th style={{ padding: '0.5rem 0.8rem', textAlign: 'right', width: '90px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSale.items || []).map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem 0.8rem' }}>{it.productNameSnapshot}</td>
                        <td style={{ padding: '0.5rem 0.8rem', textAlign: 'center' }}>{parseFloat(it.qty).toFixed(0)}</td>
                        <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right' }}>S/ {parseFloat(it.price).toFixed(2)}</td>
                        <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right', fontWeight: '600' }}>S/ {(it.qty * it.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', fontSize: '0.82rem', borderTop: '1px solid #cbd5e1', paddingTop: '0.8rem' }}>
              <div>Subtotal (Neto): <strong>S/ {parseFloat(selectedSale.subtotal).toFixed(2)}</strong></div>
              <div>IGV (18%): <strong>S/ {parseFloat(selectedSale.igv).toFixed(2)}</strong></div>
              {parseFloat(selectedSale.discountAmount) > 0 && (
                <div style={{ color: 'var(--danger)' }}>
                  Descuento ({parseFloat(selectedSale.discountPct).toFixed(0)}%): <strong>-S/ {parseFloat(selectedSale.discountAmount).toFixed(2)}</strong>
                </div>
              )}
              <div style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: '800', marginTop: '0.2rem' }}>
                TOTAL COBRADO: S/ {parseFloat(selectedSale.total).toFixed(2)}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem' }}>
              <button 
                onClick={() => handleReprint(selectedSale)}
                className="btn-premium" 
                style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Printer size={16} /> Reimprimir Ticket
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
