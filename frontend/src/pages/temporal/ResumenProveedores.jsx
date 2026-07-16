import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  Truck, RefreshCw, ShoppingBag, CalendarCheck,
  Database, AlertTriangle, ShieldCheck, ClipboardList,
  TrendingUp, TrendingDown, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AnimatedKpiValue from '../../components/AnimatedKpiValue';
import SummaryControls, { downloadCsv, makeCsv } from '../../components/SummaryControls';

/* ─── Datos simulados ─────────────────────────────────────────── */

const KPI_DATA = [
  {
    id: 'activos',
    label: 'Proveedores Activos',
    value: 36,
    valueSub: 'homologados',
    trend: +9.1,
    alert: 'green',
    icon: Truck,
    format: (v) => v.toString(),
    sparkData: [22, 24, 25, 27, 26, 28, 29, 31, 30, 33, 34, 36],
  },
  {
    id: 'frecuentes',
    label: 'Proveedores Frecuentes',
    value: 12,
    valueSub: 'recurrentes',
    trend: +20,
    alert: 'green',
    icon: RefreshCw,
    format: (v) => v.toString(),
    sparkData: [6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12],
  },
  {
    id: 'volumen',
    label: 'Volumen Compras',
    value: 214900,
    valueSub: 'mes',
    trend: +11.4,
    alert: 'green',
    icon: ShoppingBag,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [140000, 148000, 152000, 160000, 158000, 168000, 172000, 180000, 185000, 195000, 205000, 214900],
  },
  {
    id: 'cumplimiento',
    label: 'Cumplimiento Entrega',
    value: 91,
    valueSub: '+3%',
    trend: +3,
    alert: 'green',
    icon: CalendarCheck,
    format: (v) => v + '%',
    sparkData: [78, 80, 79, 82, 81, 84, 83, 86, 85, 88, 89, 91],
  },
  {
    id: 'costos',
    label: 'Costos Acumulados',
    value: 214900,
    valueSub: 'mes',
    trend: +11.4,
    alert: 'yellow',
    icon: Database,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [130000, 140000, 145000, 155000, 152000, 162000, 168000, 175000, 182000, 192000, 202000, 214900],
  },
  {
    id: 'incidencias',
    label: 'Incidencias',
    value: 7,
    valueSub: 'seguimiento',
    trend: +40,
    alert: 'red',
    icon: AlertTriangle,
    format: (v) => v.toString(),
    sparkData: [2, 3, 2, 4, 3, 5, 4, 6, 5, 6, 6, 7],
  },
  {
    id: 'confiabilidad',
    label: 'Confiabilidad',
    value: 89,
    valueSub: 'promedio',
    trend: +4.7,
    alert: 'green',
    icon: ShieldCheck,
    format: (v) => v + '%',
    sparkData: [74, 76, 75, 78, 77, 80, 79, 82, 83, 85, 87, 89],
  },
  {
    id: 'ordenes',
    label: 'Órdenes Pendientes',
    value: 22,
    valueSub: 'abastecimiento',
    trend: +10,
    alert: 'yellow',
    icon: ClipboardList,
    format: (v) => v.toString(),
    sparkData: [10, 12, 11, 14, 13, 15, 14, 16, 17, 18, 20, 22],
  },
];

/* Volumen de compras mensual */
const VOLUMEN_MENSUAL = [
  { mes: 'Nov', monto: 148000 },
  { mes: 'Dic', monto: 162000 },
  { mes: 'Ene', monto: 155000 },
  { mes: 'Feb', monto: 174000 },
  { mes: 'Mar', monto: 188000 },
  { mes: 'Abr', monto: 196000 },
  { mes: 'May', monto: 214900 },
];

/* Cumplimiento vs confiabilidad mensual */
const RENDIMIENTO_MENSUAL = [
  { mes: 'Nov', cumplimiento: 78, confiabilidad: 74 },
  { mes: 'Dic', cumplimiento: 80, confiabilidad: 77 },
  { mes: 'Ene', cumplimiento: 82, confiabilidad: 79 },
  { mes: 'Feb', cumplimiento: 84, confiabilidad: 82 },
  { mes: 'Mar', cumplimiento: 87, confiabilidad: 84 },
  { mes: 'Abr', cumplimiento: 89, confiabilidad: 87 },
  { mes: 'May', cumplimiento: 91, confiabilidad: 89 },
];

/* Top proveedores por volumen */
const TOP_PROVEEDORES = [
  { nombre: 'Distribuidora Andina SAC',   ordenes: 18, monto: 52400, pct: 100 },
  { nombre: 'Aceros del Perú EIRL',        ordenes: 14, monto: 38700, pct: 74  },
  { nombre: 'Importaciones Lima SRL',      ordenes: 11, monto: 29100, pct: 56  },
  { nombre: 'Comercial Huanca SA',         ordenes:  9, monto: 18600, pct: 36  },
  { nombre: 'Ferromax Perú SAC',           ordenes:  7, monto: 12400, pct: 24  },
];

/* Incidencias por tipo */
const INCIDENCIAS_TIPO = [
  { label: 'Retraso en entrega', count: 3, pct: 43, color: '#e84118' },
  { label: 'Producto defectuoso', count: 2, pct: 29, color: '#ff6b00' },
  { label: 'Error en cantidad',  count: 1, pct: 14, color: '#fbc531' },
  { label: 'Facturación',        count: 1, pct: 14, color: '#003471' },
];

/* ─── Alert tokens ────────────────────────────────────────────── */

const ALERT_TOKENS = {
  green:  { bg: 'rgba(76,209,55,0.07)',  border: 'rgba(76,209,55,0.22)',  text: '#2fb01e' },
  yellow: { bg: 'rgba(251,197,49,0.07)', border: 'rgba(251,197,49,0.28)', text: '#d19e07' },
  red:    { bg: 'rgba(232,65,24,0.07)',  border: 'rgba(232,65,24,0.25)',  text: '#e84118' },
};

const BAD_KPIS = ['incidencias'];

/* ─── Sparkline ───────────────────────────────────────────────── */

function Sparkline({ data, color }) {
  const W = 88, H = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = 'M ' + pts.join(' L ');
  const areaD = `${pathD} L ${W},${H} L 0,${H} Z`;
  const uid = `spk${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 88, height: 32, display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${uid})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ─── KPI Card ────────────────────────────────────────────────── */

function KpiCard({ kpi, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const tok = ALERT_TOKENS[kpi.alert];
  const Icon = kpi.icon;
  const up = kpi.trend >= 0;
  const isBad = BAD_KPIS.includes(kpi.id);
  const trendColor = isBad
    ? (up ? 'var(--danger)' : 'var(--success)')
    : (up ? 'var(--success)' : 'var(--danger)');
  const isLargeVal = kpi.value >= 10000;

  return (
    <div
      className="luxury-card interactive"
      style={{
        background: tok.bg,
        border: `1px solid ${tok.border}`,
        borderRadius: 18,
        padding: '1.4rem 1.5rem',
        marginBottom: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          color: 'var(--text-secondary)', fontSize: '0.7rem',
          textTransform: 'uppercase', letterSpacing: '1.1px', fontWeight: 700,
        }}>
          {kpi.label}
        </div>
        <div style={{
          background: tok.border, border: `1px solid ${tok.border}`,
          borderRadius: 10, padding: '0.45rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={tok.text} />
        </div>
      </div>

      <div style={{
        fontSize: isLargeVal ? '1.5rem' : '1.85rem',
        fontWeight: 800, color: tok.text,
        lineHeight: 1.1, margin: '0.5rem 0 0.1rem',
      }}>
        <AnimatedKpiValue value={kpi.value} format={kpi.format} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.7rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
          fontSize: '0.7rem', fontWeight: 700, color: trendColor,
        }}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {kpi.valueSub}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs mes anterior</div>
        <Sparkline data={kpi.sparkData} color={tok.text} />
      </div>
    </div>
  );
}

/* ─── Bar Chart — Volumen mensual ─────────────────────────────── */

function BarChartVolumen({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 520, H = 210, PAD_L = 58, PAD_B = 32, PAD_T = 16, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const maxVal = Math.max(...data.map(d => d.monto));
  const barW = chartW / data.length;
  const yTicks = [0, 60000, 120000, 180000, 220000];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {yTicks.map(t => {
        const y = PAD_T + chartH - (t / maxVal) * chartH;
        return (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={8.5} fill="#8397ab">
              {t >= 1000 ? 'S/' + (t / 1000).toFixed(0) + 'k' : t}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bw = barW * 0.6;
        const bx = PAD_L + i * barW + (barW - bw) / 2;
        const bh = (d.monto / maxVal) * chartH;
        const by = PAD_T + chartH - bh;
        const isHov = hovered === i;
        const isLast = i === data.length - 1;
        const fill = isLast ? '#ff6b00' : '#003471';
        return (
          <g key={d.mes}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <rect x={bx} y={by} width={bw} height={bh} rx={5}
              fill={isHov ? (isLast ? '#cc5500' : '#002856') : fill}
              opacity={hovered !== null && !isHov ? 0.35 : 1}
              style={{ transition: 'all 0.2s' }} />
            {isHov && (
              <text x={bx + bw / 2} y={by - 5} textAnchor="middle"
                fontSize={9} fontWeight={700} fill={isLast ? '#ff6b00' : '#003471'}>
                S/{(d.monto / 1000).toFixed(0)}k
              </text>
            )}
            <text x={bx + bw / 2} y={H - 6} textAnchor="middle"
              fontSize={9}
              fill={isLast ? '#ff6b00' : (isHov ? '#003471' : '#5c6b73')}
              fontWeight={isLast || isHov ? 700 : 400}>
              {d.mes}
            </text>
          </g>
        );
      })}
      <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + chartH} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
    </svg>
  );
}

/* ─── Dual Line Chart — Cumplimiento vs Confiabilidad ────────── */

function DualLineChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 480, H = 200, PAD_L = 44, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const minV = 65, maxV = 95;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const pathC = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.cumplimiento)}`).join(' ');
  const pathK = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.confiabilidad)}`).join(' ');
  const areaC = `${pathC} L${px(data.length-1)},${PAD_T+chartH} L${px(0)},${PAD_T+chartH} Z`;
  const yTicks = [70, 75, 80, 85, 90];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="dualGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003471" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#003471" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yTicks.map(t => {
        const y = py(t);
        return (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#8397ab">{t}%</text>
          </g>
        );
      })}
      <path d={areaC} fill="url(#dualGrad)" />
      {/* Cumplimiento line (azul) */}
      <path d={pathC} fill="none" stroke="#003471" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {/* Confiabilidad line (naranja) */}
      <path d={pathK} fill="none" stroke="#ff6b00" strokeWidth={2}
        strokeDasharray="6 3" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots cumplimiento */}
      {data.map((d, i) => {
        const x = px(i), y = py(d.cumplimiento);
        const isHov = hovered === i;
        const isLast = i === data.length - 1;
        return (
          <g key={`c${i}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={isHov ? 6 : (isLast ? 5 : 3.5)}
              fill={isLast ? '#003471' : (isHov ? '#003471' : '#003471')}
              stroke="#fff" strokeWidth={2}
              style={{ transition: 'all 0.18s' }} />
            {isHov && (
              <g>
                <rect x={x - 24} y={y - 32} width={48} height={22} rx={5} fill="#003471" />
                <text x={x} y={y - 17} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                  {d.cumplimiento}%
                </text>
              </g>
            )}
          </g>
        );
      })}
      {/* Dots confiabilidad */}
      {data.map((d, i) => {
        const x = px(i), y = py(d.confiabilidad);
        const isHov = hovered === i;
        const isLast = i === data.length - 1;
        return (
          <g key={`k${i}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={isHov ? 6 : (isLast ? 5 : 3.5)}
              fill="#ff6b00" stroke="#fff" strokeWidth={2}
              style={{ transition: 'all 0.18s' }} />
            {isHov && (
              <g>
                <rect x={x - 24} y={y + 6} width={48} height={22} rx={5} fill="#ff6b00" />
                <text x={x} y={y + 21} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                  {d.confiabilidad}%
                </text>
              </g>
            )}
            <text x={x} y={H - 6} textAnchor="middle" fontSize={9}
              fill={isHov ? '#003471' : '#5c6b73'}
              fontWeight={isHov || isLast ? 700 : 400}>
              {d.mes}
            </text>
          </g>
        );
      })}
      <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T+chartH} stroke="#cbd5e1" strokeWidth={1} />
      <line x1={PAD_L} x2={W-PAD_R} y1={PAD_T+chartH} y2={PAD_T+chartH} stroke="#cbd5e1" strokeWidth={1} />
    </svg>
  );
}

/* ─── Incidencias por tipo ────────────────────────────────────── */

function IncidenciasBars({ data }) {
  const max = Math.max(...data.map(d => d.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      {data.map((d, i) => (
        <div key={d.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {d.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, color: d.color,
                background: `${d.color}14`, border: `1px solid ${d.color}30`,
                borderRadius: 20, padding: '1px 8px',
              }}>
                {d.pct}%
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', minWidth: 16, textAlign: 'right' }}>
                {d.count}
              </span>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--hover-bg)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${(d.count / max) * 100}%`,
              background: `linear-gradient(90deg, ${d.color}, ${d.color}aa)`,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Top Proveedores ─────────────────────────────────────────── */

function TopProveedores({ data }) {
  return (
    <div>
      {data.map((p, i) => (
        <div key={p.nombre} style={{
          display: 'flex', alignItems: 'center', gap: '0.9rem',
          padding: '0.75rem 0',
          borderBottom: i < data.length - 1 ? '1px solid var(--glass-border)' : 'none',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: i === 0 ? 'rgba(255,107,0,0.12)' : 'rgba(0,52,113,0.07)',
            border: `1px solid ${i === 0 ? 'rgba(255,107,0,0.3)' : 'rgba(0,52,113,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 800,
            color: i === 0 ? '#ff6b00' : 'var(--accent)',
          }}>
            {i + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              marginBottom: '0.3rem',
            }}>
              {p.nombre}
            </div>
            <div style={{ height: 5, borderRadius: 4, background: 'var(--hover-bg)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: `${p.pct}%`,
                background: i === 0
                  ? 'linear-gradient(90deg, #ff6b00, #ffaa60)'
                  : 'linear-gradient(90deg, #003471, #1a5ca8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
              S/ {p.monto.toLocaleString('es-PE')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {p.ordenes} órdenes
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function ResumenProveedores() {
  const [dbData, setDbData] = useState(null);
  const [selectedSupplierView, setSelectedSupplierView] = useState('Todos');
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const fetchDbSummary = async () => {
      try {
        const data = await api.get('/dashboard/resumen/proveedores');
        setDbData(data);
      } catch (err) {
        console.error('Error fetching suppliers summary from DB:', err);
      }
    };
    fetchDbSummary();
  }, []);

  const getBaseKpiValue = (kpiId, defaultValue) => {
    if (!dbData || !dbData.kpis) return defaultValue;
    switch (kpiId) {
      case 'activos':
        return dbData.kpis[0]?.value ?? defaultValue;
      case 'frecuentes':
        return dbData.kpis[1]?.value ?? defaultValue;
      case 'ordenes':
        return dbData.kpis[2]?.value ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  const viewFactor = selectedSupplierView === 'Activos' ? 0.82 : selectedSupplierView === 'Con ordenes' ? 0.46 : selectedSupplierView === 'Incidencias' ? 0.22 : 1;
  const rangeFactor = dateRange === '7' ? 0.4 : dateRange === '365' ? 2.2 : 1;

  const currentKpis = KPI_DATA.map(kpi => {
    const baseValue = getBaseKpiValue(kpi.id, kpi.value);
    const shouldScale = typeof baseValue === 'number' && ['activos', 'frecuentes', 'volumen', 'costos', 'incidencias'].includes(kpi.id);
    const value = shouldScale ? Math.max(0, Math.round(baseValue * viewFactor * rangeFactor)) : baseValue;
    return {
      ...kpi,
      value,
      sparkData: typeof kpi.value === 'number' && value !== kpi.value
        ? kpi.sparkData.map(v => Math.round(v * (value / kpi.value)))
        : kpi.sparkData
    };
  });

  const handleExport = () => {
    setExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      downloadCsv(`reporte_proveedores_${selectedSupplierView.toLowerCase().replace(/\s+/g, '-')}_${dateRange}dias.csv`, makeCsv(
        ['ID', 'Metrica', 'Valor', 'Detalle', 'Vista', 'Rango'],
        currentKpis.map(kpi => [kpi.id, kpi.label, kpi.format(kpi.value), kpi.valueSub, selectedSupplierView, `${dateRange} dias`])
      ));
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2200);
    }, 350);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header
        title="Resumen de Proveedores"
        subtitle="KPIs, rendimiento y volumen de compras del período"
      />

      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--accent-gold)', textDecoration: 'none',
          fontSize: '0.82rem', fontWeight: 700,
        }}>
          <ArrowLeft size={14} /> Volver al Dashboard
        </Link>
        <SummaryControls
          filterValue={selectedSupplierView}
          onFilterChange={setSelectedSupplierView}
          filterOptions={[
            { value: 'Todos', label: 'Todos los Proveedores' },
            { value: 'Activos', label: 'Proveedores Activos' },
            { value: 'Con ordenes', label: 'Con ordenes' },
            { value: 'Incidencias', label: 'Incidencias' },
          ]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
          exporting={exporting}
          exportSuccess={exportSuccess}
        />
      </div>

      <div style={{
        fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        marginBottom: '0.8rem',
      }}>
        Dashboard Desglosado - Mostrando: {selectedSupplierView} / {dateRange} dias
      </div>

      {/* ── 8 KPI Cards ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
        gap: '1.1rem',
        marginBottom: '2rem',
      }}>
        {currentKpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} delay={i * 45} />
        ))}
      </section>

      {/* ── Gráficos fila 1 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        {/* Barras — volumen mensual */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
              }}>
                Volumen de Compras Mensual
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Monto total de órdenes por mes
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#003471', display: 'inline-block' }} />
                Meses anteriores
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ff6b00', display: 'inline-block' }} />
                Mes actual
              </span>
            </div>
          </div>
          <BarChartVolumen data={VOLUMEN_MENSUAL} />
        </div>

        {/* Dual line — cumplimiento vs confiabilidad */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
            }}>
              Cumplimiento vs Confiabilidad
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Evolución mensual de indicadores de rendimiento
            </p>
          </div>
          <DualLineChart data={RENDIMIENTO_MENSUAL} />
          <div style={{
            display: 'flex', gap: '1.5rem', marginTop: '0.8rem',
            paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 18, height: 3, background: '#003471', borderRadius: 2, display: 'inline-block' }} />
              Cumplimiento entrega
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: 18, height: 2, background: '#ff6b00', borderRadius: 2, display: 'inline-block', borderTop: '2px dashed #ff6b00' }} />
              Confiabilidad
            </div>
          </div>
        </div>
      </div>

      {/* ── Gráficos fila 2 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '1.5rem',
      }}>
        {/* Incidencias por tipo */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
              }}>
                Incidencias por Tipo
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Desglose de los 7 casos activos
              </p>
            </div>
            <span style={{
              background: 'rgba(232,65,24,0.08)', border: '1px solid rgba(232,65,24,0.25)',
              borderRadius: 20, padding: '3px 12px', fontSize: '0.7rem',
              fontWeight: 700, color: '#e84118',
            }}>
              7 activos
            </span>
          </div>
          <IncidenciasBars data={INCIDENCIAS_TIPO} />
        </div>

        {/* Top proveedores */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
              }}>
                Top 5 Proveedores por Volumen
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Ranking por monto de órdenes este mes
              </p>
            </div>
            <span style={{
              background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.25)',
              borderRadius: 20, padding: '3px 14px', fontSize: '0.7rem',
              fontWeight: 700, color: '#ff6b00',
            }}>
              Mayo 2026
            </span>
          </div>
          <TopProveedores data={TOP_PROVEEDORES} />
        </div>
      </div>
    </div>
  );
}
