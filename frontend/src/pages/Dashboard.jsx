import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { DollarSign, PackageOpen, Users, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    totalProducts: 0,
    lowStockAlerts: 0,
    totalSalesRevenue: 0,
    totalCustomers: 0,
    recentSales: [],
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const result = await api.get('/dashboard/summary');
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        setError('No se pudo conectar con el servidor. Mostrando datos locales de respaldo.');
        // Populate fallback luxury demonstration data
        setData({
          totalProducts: 45,
          lowStockAlerts: 3,
          totalSalesRevenue: 12450.80,
          totalCustomers: 18,
          recentSales: [
            { id: '1', clientNameSnapshot: 'Juan Pérez', soldAt: '2026-05-19T18:30:00Z', total: 420.50, series: 'F001-00021' },
            { id: '2', clientNameSnapshot: 'Maria Garcia', soldAt: '2026-05-19T14:15:00Z', total: 185.00, series: 'B001-00045' },
            { id: '3', clientNameSnapshot: 'Carlos Mendoza', soldAt: '2026-05-18T16:45:00Z', total: 1250.00, series: 'F001-00020' },
            { id: '4', clientNameSnapshot: 'Sofía Castro', soldAt: '2026-05-18T10:05:00Z', total: 95.80, series: 'B001-00044' },
            { id: '5', clientNameSnapshot: 'Distribuidora Norte', soldAt: '2026-05-17T11:20:00Z', total: 3200.00, series: 'F001-00019' }
          ],
          lowStockItems: [
            { id: '101', name: 'Martillo de Acero 16oz', barcode: '75010324', category: 'Herramientas', stock: 2, minStock: 5, unit: 'pza' },
            { id: '102', name: 'Cemento Sol Tipo 1 (42.5kg)', barcode: '77502310', category: 'Materiales', stock: 8, minStock: 20, unit: 'bolsa' },
            { id: '103', name: 'Tornillo de Madera 2"', barcode: '84102941', category: 'Tornillería', stock: 12, minStock: 50, unit: 'caja' }
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Dashboard" subtitle="Resumen de rendimiento y estado del negocio" />

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <section className="stats-grid">
        <div className="luxury-card interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ventas Totales</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0.5rem 0', color: 'var(--accent-gold)' }}>
                S/ {data.totalSalesRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
              <DollarSign color="var(--accent-gold)" />
            </div>
          </div>
          <div style={{ color: 'var(--success)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
            <TrendingUp size={14} /> <span>+12.4% vs mes anterior</span>
          </div>
        </div>

        <div className="luxury-card interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Stock Crítico</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0.5rem 0', color: data.lowStockAlerts > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {data.lowStockAlerts} {data.lowStockAlerts === 1 ? 'Producto' : 'Productos'}
              </div>
            </div>
            <div style={{ background: data.lowStockAlerts > 0 ? 'rgba(232, 65, 24, 0.1)' : 'rgba(76, 209, 55, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
              <PackageOpen color={data.lowStockAlerts > 0 ? 'var(--danger)' : 'var(--success)'} />
            </div>
          </div>
          <div style={{ color: data.lowStockAlerts > 0 ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            {data.lowStockAlerts > 0 ? '⚠️ Requieren reposición inmediata' : '✓ Niveles de stock estables'}
          </div>
        </div>

        <div className="luxury-card interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Clientes Activos</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0.5rem 0', color: 'var(--accent)' }}>
                {data.totalCustomers}
              </div>
            </div>
            <div style={{ background: 'rgba(0, 242, 255, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>
              <Users color="var(--accent)" />
            </div>
          </div>
          <div style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Clientes registrados en el sistema
          </div>
        </div>
      </section>

      {/* Main Content Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
        {/* Left Side: Recent Sales */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--accent)' }}>
            Últimas Ventas Realizadas
          </h2>
          <div className="table-container">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Nº Boleta/Factura</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      No se han registrado ventas recientemente.
                    </td>
                  </tr>
                ) : (
                  data.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td style={{ fontWeight: '600' }}>{sale.series || `#VEN-${sale.id.slice(0,5)}`}</td>
                      <td>{sale.clientNameSnapshot}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(sale.soldAt)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--accent-gold)' }}>
                        S/ {sale.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Low Stock Items */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--danger)' }}>
            Alertas de Stock Crítico
          </h2>
          <div className="table-container">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ textAlign: 'right' }}>Stock</th>
                  <th style={{ textAlign: 'right' }}>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--success)', padding: '2rem', fontWeight: '600' }}>
                      ✓ Todo el inventario está abastecido.
                    </td>
                  </tr>
                ) : (
                  data.lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Categoría: {item.category}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--danger)' }}>
                        {item.stock} {item.unit}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {item.minStock} {item.unit}
                      </td>
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
