import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { AlertTriangle, DollarSign, Package, PackageOpen, Users } from 'lucide-react';
import AnimatedKpiValue from '../components/AnimatedKpiValue';

const KPI_TONES = {
  green: {
    bg: '#f1fbef',
    border: '#bdeebc',
    text: '#10a91b',
    iconBg: '#c9f8c5',
    iconBorder: '#a7eba6',
  },
  red: {
    bg: '#fff4ef',
    border: '#ffc4b5',
    text: '#e84118',
    iconBg: '#ffc8bc',
    iconBorder: '#ffad9b',
  },
  blue: {
    bg: '#f3f8ff',
    border: '#c5dcff',
    text: '#003471',
    iconBg: '#dceaff',
    iconBorder: '#bad4ff',
  },
  gold: {
    bg: '#fffaf0',
    border: '#f3dfac',
    text: '#b7791f',
    iconBg: '#fff0bd',
    iconBorder: '#f1d47c',
  },
};

function MiniTrend({ color, points = [30, 42, 37, 51, 48, 62, 58, 74, 70, 86] }) {
  const width = 96;
  const height = 34;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / range) * (height - 8) - 4;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width, height, display: 'block' }} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricCard({ label, value, format = (nextValue) => nextValue, hint, trend, icon: Icon, tone = 'green', spark }) {
  const palette = KPI_TONES[tone] || KPI_TONES.green;

  return (
    <article className="dashboard-metric-card" style={{ background: palette.bg, borderColor: palette.border }}>
      <div className="dashboard-metric-head">
        <p>{label}</p>
        <div
          className="dashboard-metric-icon"
          style={{
            background: palette.iconBg,
            borderColor: palette.iconBorder,
            color: palette.text,
          }}
        >
          <Icon size={18} />
        </div>
      </div>

      <strong style={{ color: palette.text }}>
        <AnimatedKpiValue value={value} format={format} duration={950} />
      </strong>
      <span>{hint}</span>

      <div className="dashboard-metric-foot">
        <div>
          <em style={{ color: palette.text }}>↗ {trend}</em>
          <small>vs mes anterior</small>
        </div>
        <MiniTrend color={palette.text} points={spark} />
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({
    totalProducts: 0,
    lowStockAlerts: 0,
    totalSalesRevenue: 0,
    totalCustomers: 0,
    recentSales: [],
    lowStockItems: [],
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
        setError('No se pudo conectar con el servidor. Los indicadores se muestran vacios hasta recuperar la conexion.');
        setData({
          totalProducts: 0,
          lowStockAlerts: 0,
          totalSalesRevenue: 0,
          totalCustomers: 0,
          recentSales: [],
          lowStockItems: [],
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
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const revenue = Number(data.totalSalesRevenue || 0);
  const criticalTone = data.lowStockAlerts > 0 ? 'red' : 'green';
  const metricCards = [
    {
      label: 'Productos Registrados',
      value: data.totalProducts,
      format: (value) => Math.round(value).toLocaleString('es-PE'),
      hint: 'activos en catalogo',
      trend: '+4.2%',
      icon: Package,
      tone: 'green',
      spark: [22, 20, 27, 25, 31, 29, 36, 34, 42, 48],
    },
    {
      label: 'Ventas Totales',
      value: revenue,
      format: (value) => `S/ ${Math.round(value).toLocaleString('es-PE')}`,
      hint: 'ingresos registrados',
      trend: '+8.3%',
      icon: DollarSign,
      tone: revenue > 0 ? 'green' : 'gold',
      spark: [30, 28, 36, 32, 40, 45, 43, 51, 55, 62],
    },
    {
      label: 'Clientes Activos',
      value: data.totalCustomers,
      format: (value) => Math.round(value).toLocaleString('es-PE'),
      hint: 'clientes registrados',
      trend: '+5.1%',
      icon: Users,
      tone: 'blue',
      spark: [18, 21, 24, 22, 26, 28, 31, 34, 33, 39],
    },
    {
      label: 'Stock Critico',
      value: data.lowStockAlerts,
      format: (value) => Math.round(value).toLocaleString('es-PE'),
      hint: data.lowStockAlerts > 0 ? 'requieren reposicion' : 'sin alertas activas',
      trend: data.lowStockAlerts > 0 ? '+16.7%' : '0.0%',
      icon: data.lowStockAlerts > 0 ? AlertTriangle : PackageOpen,
      tone: criticalTone,
      spark: data.lowStockAlerts > 0
        ? [18, 30, 25, 38, 32, 46, 41, 52, 48, 58]
        : [28, 24, 22, 20, 18, 16, 15, 13, 12, 10],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header title="Dashboard" subtitle="Resumen de rendimiento y estado del negocio" />

      {error && (
        <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid var(--accent-gold)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="dashboard-metric-eyebrow">
        <span>Panel metrico interactivo</span>
        <span>Mostrando: todo</span>
      </div>

      <section className="dashboard-metrics-grid" aria-busy={loading}>
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <div className="dashboard-main-grid">
        <div className="luxury-card" style={{ marginBottom: 0, minWidth: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--accent)' }}>
            Ultimas Ventas Realizadas
          </h2>
          <div className="table-container">
            <table className="luxury-table recent-sales-table">
              <thead>
                <tr>
                  <th>Nro. Boleta/Factura</th>
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
                      <td style={{ fontWeight: '600' }}>{sale.series || `#VEN-${String(sale.id).slice(0, 5)}`}</td>
                      <td>{sale.clientNameSnapshot}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatDate(sale.soldAt)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: 'var(--accent-gold)' }}>
                        S/ {Number(sale.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="luxury-card" style={{ marginBottom: 0, minWidth: 0 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '1px', marginBottom: '1rem', color: 'var(--danger)' }}>
            Alertas de Stock Critico
          </h2>
          <div className="table-container">
            <table className="luxury-table stock-alerts-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ textAlign: 'right' }}>Stock</th>
                  <th style={{ textAlign: 'right' }}>Minimo</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--success)', padding: '2rem', fontWeight: '600' }}>
                      Todo el inventario esta abastecido.
                    </td>
                  </tr>
                ) : (
                  data.lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Categoria: {item.category}</div>
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
