import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  ClipboardList, Clock, Truck, AlertTriangle,
  CheckCircle, DollarSign, Calendar, BarChart2,
  TrendingUp, TrendingDown, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AnimatedKpiValue from '../../components/AnimatedKpiValue';
import SummaryControls, { downloadCsv, makeCsv } from '../../components/SummaryControls';

/* ─── Datos simulados ─────────────────────────────────────────── */

const KPI_DATA = [
  {
    id: 'registrados',
    label: 'Pedidos Registrados',
    value: 44,
    valueSub: 'mes',
    trend: +10,
    alert: 'green',
    icon: ClipboardList,
    format: (v) => v.toString(),
    sparkData: [28, 30, 29, 32, 31, 34, 33, 36, 35, 38, 40, 44],
  },
  {
    id: 'pendientes',
    label: 'Pedidos Pendientes',
    value: 12,
    valueSub: 'proveedor',
    trend: +9.1,
    alert: 'yellow',
    icon: Clock,
    format: (v) => v.toString(),
    sparkData: [6, 7, 8, 7, 9, 8, 10, 9, 11, 10, 11, 12],
  },
  {
    id: 'transito',
    label: 'En Tránsito',
    value: 7,
    valueSub: 'seguimiento',
    trend: +16.7,
    alert: 'yellow',
    icon: Truck,
    format: (v) => v.toString(),
    sparkData: [3, 3, 4, 4, 5, 4, 5, 6, 5, 6, 6, 7],
  },
  {
    id: 'parcial',
    label: 'Recibidos Parcial',
    value: 3,
    valueSub: 'control',
    trend: +50,
    alert: 'red',
    icon: AlertTriangle,
    format: (v) => v.toString(),
    sparkData: [1, 1, 2, 1, 2, 2, 3, 2, 2, 3, 2, 3],
  },
  {
    id: 'completados',
    label: 'Completados',
    value: 21,
    valueSub: 'mes',
    trend: +23.5,
    alert: 'green',
    icon: CheckCircle,
    format: (v) => v.toString(),
    sparkData: [10, 11, 12, 13, 13, 14, 15, 16, 17, 18, 19, 21],
  },
  {
    id: 'valorAcumulado',
    label: 'Valor Acumulado',
    value: 325800,
    valueSub: 'compras',
    trend: +14.2,
    alert: 'green',
    icon: DollarSign,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [210000, 225000, 232000, 248000, 255000, 268000, 275000, 288000, 295000, 308000, 316000, 325800],
  },
  {
    id: 'tiempoEntrega',
    label: 'Tiempo Entrega',
    value: 4.8,
    valueSub: '-0.4',
    trend: -7.7,
    alert: 'green',
    icon: Calendar,
    format: (v) => v.toFixed(1) + ' días',
    sparkData: [6.2, 6.0, 5.8, 5.8, 5.6, 5.5, 5.4, 5.3, 5.2, 5.1, 5.0, 4.8],
  },
  {
    id: 'comparativaCostos',
    label: 'Comparativa Costos',
    value: -1.2,
    valueSub: 'promedio',
    trend: -1.2,
    alert: 'green',
    icon: BarChart2,
    format: (v) => (v > 0 ? '+' : '') + v.toFixed(1) + '%',
    sparkData: [3.2, 2.8, 2.5, 2.1, 1.8, 1.4, 1.0, 0.5, 0.1, -0.4, -0.8, -1.2],
  },
];

/* Pedidos por mes */
const PEDIDOS_MENSUALES = [
  { mes: 'Nov', registrados: 28, completados: 22 },
  { mes: 'Dic', registrados: 32, completados: 25 },
  { mes: 'Ene', registrados: 30, completados: 24 },
  { mes: 'Feb', registrados: 35, completados: 28 },
  { mes: 'Mar', registrados: 38, completados: 30 },
  { mes: 'Abr', registrados: 40, completados: 32 },
  { mes: 'May', registrados: 44, completados: 21 },
];

/* Valor acumulado mensual */
const VALOR_MENSUAL = [
  { mes: 'Nov', monto: 210000 },
  { mes: 'Dic', monto: 238000 },
  { mes: 'Ene', monto: 225000 },
  { mes: 'Feb', monto: 260000 },
  { mes: 'Mar', monto: 285000 },
  { mes: 'Abr', monto: 298000 },
  { mes: 'May', monto: 325800 },
];

/* Tiempo de entrega mensual */
const TIEMPO_MENSUAL = [
  { mes: 'Nov', dias: 6.2 },
  { mes: 'Dic', dias: 5.9 },
  { mes: 'Ene', dias: 5.8 },
  { mes: 'Feb', dias: 5.5 },
  { mes: 'Mar', dias: 5.2 },
  { mes: 'Abr', dias: 5.0 },
  { mes: 'May', dias: 4.8 },
];

/* Estado actual de pedidos */
const ESTADO_PEDIDOS = [
  { label: 'Completados',      count: 21, pct: 48, color: '#2fb01e' },
  { label: 'Pendientes',       count: 12, pct: 27, color: '#d19e07' },
  { label: 'En Tránsito',      count:  7, pct: 16, color: '#003471' },
  { label: 'Recibido Parcial', count:  3, pct:  7, color: '#e84118' },
  { label: 'En Revisión',      count:  1, pct:  2, color: '#8397ab' },
];

/* Top proveedores por pedidos */
const TOP_PEDIDOS = [
  { nombre: 'Distribuidora Andina SAC',   pedidos: 12, monto: 88400, pct: 100 },
  { nombre: 'Aceros del Perú EIRL',        pedidos:  9, monto: 72100, pct: 82  },
  { nombre: 'Importaciones Lima SRL',      pedidos:  8, monto: 58600, pct: 66  },
  { nombre: 'Comercial Huanca SA',         pedidos:  7, monto: 43200, pct: 49  },
  { nombre: 'Ferromax Perú SAC',           pedidos:  5, monto: 28900, pct: 33  },
];

/* ─── Alert tokens ────────────────────────────────────────────── */

const ALERT_TOKENS = {
  green:  { bg: 'rgba(76,209,55,0.07)',  border: 'rgba(76,209,55,0.22)',  text: '#2fb01e' },
  yellow: { bg: 'rgba(251,197,49,0.07)', border: 'rgba(251,197,49,0.28)', text: '#d19e07' },
  red:    { bg: 'rgba(232,65,24,0.07)',  border: 'rgba(232,65,24,0.25)',  text: '#e84118' },
};

/* KPIs donde bajar es bueno */
const GOOD_DOWN = ['tiempoEntrega', 'comparativaCostos'];
const BAD_UP    = ['pendientes', 'transito', 'parcial'];

/* ─── Sparkline ───────────────────────────────────────────────── */

function Sparkline({ data, color }) {
  const W = 88, H = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 4) - 2,
  }));
  const pathD = 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
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
  const goodDown = GOOD_DOWN.includes(kpi.id);
  const badUp = BAD_UP.includes(kpi.id);
  const trendColor = goodDown
    ? (!up ? 'var(--success)' : 'var(--danger)')
    : badUp
      ? (up ? 'var(--danger)' : 'var(--success)')
      : (up ? 'var(--success)' : 'var(--danger)');

  const isLarge = kpi.value >= 10000;

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
        fontSize: isLarge ? '1.5rem' : '1.85rem',
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

/* ─── Grouped Bar Chart — Pedidos por mes ────────────────────── */

function GroupedBarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 540, H = 210, PAD_L = 42, PAD_B = 32, PAD_T = 16, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const maxVal = Math.max(...data.flatMap(d => [d.registrados, d.completados]));
  const groupW = chartW / data.length;
  const barW = groupW * 0.32;
  const gap = groupW * 0.06;
  const yTicks = [0, 10, 20, 30, 40, 50];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {yTicks.map(t => {
        const y = PAD_T + chartH - (t / maxVal) * chartH;
        return (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#8397ab">{t}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const gx = PAD_L + i * groupW + groupW * 0.1;
        const isLast = i === data.length - 1;

        const bh1 = (d.registrados / maxVal) * chartH;
        const by1 = PAD_T + chartH - bh1;
        const bh2 = (d.completados / maxVal) * chartH;
        const by2 = PAD_T + chartH - bh2;

        const isHov = hovered === i;

        return (
          <g key={d.mes}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            {/* Registrados */}
            <rect x={gx} y={by1} width={barW} height={bh1} rx={4}
              fill={isHov ? '#002856' : '#003471'}
              opacity={hovered !== null && !isHov ? 0.35 : 1}
              style={{ transition: 'all 0.2s' }} />
            {/* Completados */}
            <rect x={gx + barW + gap} y={by2} width={barW} height={bh2} rx={4}
              fill={isHov ? '#cc5500' : (isLast ? '#ff6b00' : '#2fb01e')}
              opacity={hovered !== null && !isHov ? 0.35 : 1}
              style={{ transition: 'all 0.2s' }} />

            {isHov && (
              <>
                <text x={gx + barW / 2} y={by1 - 4} textAnchor="middle"
                  fontSize={9} fontWeight={700} fill="#003471">{d.registrados}</text>
                <text x={gx + barW + gap + barW / 2} y={by2 - 4} textAnchor="middle"
                  fontSize={9} fontWeight={700} fill={isLast ? '#ff6b00' : '#2fb01e'}>{d.completados}</text>
              </>
            )}

            <text x={gx + barW + gap / 2} y={H - 6} textAnchor="middle"
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

/* ─── Dual Line — Valor + Tiempo entrega ─────────────────────── */

function LineChartValor({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 460, H = 195, PAD_L = 56, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const minV = 190000, maxV = 340000;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.monto)}`).join(' ');
  const areaD = `${pathD} L${px(data.length - 1)},${PAD_T + chartH} L${px(0)},${PAD_T + chartH} Z`;
  const yTicks = [210000, 250000, 290000, 325000];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="pedValGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003471" stopOpacity={0.13} />
          <stop offset="100%" stopColor="#003471" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yTicks.map(t => {
        const y = py(t);
        return (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={8} fill="#8397ab">
              S/{(t / 1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#pedValGrad)" />
      <path d={pathD} fill="none" stroke="#003471" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = px(i), y = py(d.monto);
        const isHov = hovered === i;
        const isLast = i === data.length - 1;
        return (
          <g key={d.mes}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={isHov ? 7 : (isLast ? 5.5 : 4)}
              fill={isLast ? '#ff6b00' : (isHov ? '#ff6b00' : '#003471')}
              stroke="#fff" strokeWidth={2}
              style={{ transition: 'all 0.18s' }} />
            {isHov && (
              <g>
                <rect x={x - 28} y={y - 30} width={56} height={20} rx={5} fill="#003471" />
                <text x={x} y={y - 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                  S/{(d.monto / 1000).toFixed(0)}k
                </text>
              </g>
            )}
            <text x={x} y={H - 6} textAnchor="middle" fontSize={9}
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

/* ─── Donut — Estado de pedidos ───────────────────────────────── */

function DonutEstado({ data }) {
  const [hovered, setHovered] = useState(null);
  const CX = 85, CY = 85, R = 68, r = 40;
  const total = data.reduce((s, d) => s + d.count, 0);
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const a1 = angle, a2 = angle + sweep;
    const large = sweep > Math.PI ? 1 : 0;
    const cos1 = Math.cos(a1), sin1 = Math.sin(a1);
    const cos2 = Math.cos(a2), sin2 = Math.sin(a2);
    const pathD = [
      `M ${CX + R * cos1} ${CY + R * sin1}`,
      `A ${R} ${R} 0 ${large} 1 ${CX + R * cos2} ${CY + R * sin2}`,
      `L ${CX + r * cos2} ${CY + r * sin2}`,
      `A ${r} ${r} 0 ${large} 0 ${CX + r * cos1} ${CY + r * sin1}`,
      'Z',
    ].join(' ');
    const mid = angle + sweep / 2;
    angle += sweep;
    return { ...d, pathD, mid, i };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
      <svg viewBox={`0 0 ${CX * 2} ${CY * 2}`} style={{ width: 170, height: 170, flexShrink: 0 }}>
        {slices.map((s) => {
          const isHov = hovered === s.i;
          return (
            <path key={s.label} d={s.pathD}
              fill={s.color}
              opacity={hovered !== null && !isHov ? 0.35 : 1}
              style={{
                transform: isHov
                  ? `translate(${Math.cos(s.mid) * 4}px, ${Math.sin(s.mid) * 4}px)`
                  : 'none',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(s.i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={17} fontWeight={800} fill="#0a1629">
          {total}
        </text>
        <text x={CX} y={CY + 11} textAnchor="middle" fontSize={8} fill="#5c6b73" fontWeight={600}>
          PEDIDOS
        </text>
      </svg>

      <div style={{ flex: 1 }}>
        {slices.map((s) => (
          <div key={s.label}
            onMouseEnter={() => setHovered(s.i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.45rem 0.55rem', borderRadius: 8,
              background: hovered === s.i ? 'var(--hover-bg)' : 'transparent',
              cursor: 'pointer', transition: 'background 0.15s',
              marginBottom: '0.2rem',
            }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {s.label}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.count}</span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, color: s.color,
              background: `${s.color}14`, border: `1px solid ${s.color}30`,
              borderRadius: 20, padding: '1px 7px',
            }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tiempo entrega line ─────────────────────────────────────── */

function LineChartTiempo({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 420, H = 170, PAD_L = 42, PAD_B = 30, PAD_T = 16, PAD_R = 20;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const minV = 4.0, maxV = 6.8;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.dias)}`).join(' ');
  const areaD = `${pathD} L${px(data.length - 1)},${PAD_T + chartH} L${px(0)},${PAD_T + chartH} Z`;
  const yTicks = [4.5, 5.0, 5.5, 6.0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="tiempoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2fb01e" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#2fb01e" stopOpacity={0} />
        </linearGradient>
      </defs>
      {yTicks.map(t => {
        const y = py(t);
        return (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#8397ab">{t}d</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#tiempoGrad)" />
      <path d={pathD} fill="none" stroke="#2fb01e" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => {
        const x = px(i), y = py(d.dias);
        const isHov = hovered === i;
        const isLast = i === data.length - 1;
        return (
          <g key={d.mes}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={isHov ? 6 : (isLast ? 5 : 3.5)}
              fill={isLast ? '#ff6b00' : (isHov ? '#ff6b00' : '#2fb01e')}
              stroke="#fff" strokeWidth={2}
              style={{ transition: 'all 0.18s' }} />
            {isHov && (
              <g>
                <rect x={x - 22} y={y - 28} width={44} height={19} rx={5} fill="#003471" />
                <text x={x} y={y - 15} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                  {d.dias}d
                </text>
              </g>
            )}
            <text x={x} y={H - 5} textAnchor="middle" fontSize={9}
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

/* ─── Top proveedores por pedidos ─────────────────────────────── */

function TopPedidos({ data }) {
  return (
    <div>
      {data.map((p, i) => (
        <div key={p.nombre} style={{
          display: 'flex', alignItems: 'center', gap: '0.9rem',
          padding: '0.7rem 0',
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
              marginBottom: '0.28rem',
            }}>
              {p.nombre}
            </div>
            <div style={{ height: 5, borderRadius: 4, background: 'var(--hover-bg)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: `${p.pct}%`,
                background: i === 0
                  ? 'linear-gradient(90deg,#ff6b00,#ffaa60)'
                  : 'linear-gradient(90deg,#003471,#1a5ca8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
              S/ {p.monto.toLocaleString('es-PE')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {p.pedidos} pedidos
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function ResumenPedidos() {
  const [dbData, setDbData] = useState(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('Todos');
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const fetchDbSummary = async () => {
      try {
        const data = await api.get('/dashboard/resumen/pedidos-compra');
        setDbData(data);
      } catch (err) {
        console.error('Error fetching purchase orders summary from DB:', err);
      }
    };
    fetchDbSummary();
  }, []);

  const getBaseKpiValue = (kpiId, defaultValue) => {
    if (!dbData || !dbData.kpis) return defaultValue;
    switch (kpiId) {
      case 'registrados':
        return dbData.kpis[0]?.value ?? defaultValue;
      case 'pendientes':
        return dbData.kpis[1]?.value ?? defaultValue;
      case 'completados':
        return dbData.kpis[2]?.value ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  const statusFactor = selectedOrderStatus === 'Pendientes' ? 0.34 : selectedOrderStatus === 'Completados' ? 0.52 : selectedOrderStatus === 'Transito' ? 0.24 : selectedOrderStatus === 'Parciales' ? 0.16 : 1;
  const rangeFactor = dateRange === '7' ? 0.35 : dateRange === '365' ? 2.35 : 1;

  const currentKpis = KPI_DATA.map(kpi => {
    const baseValue = getBaseKpiValue(kpi.id, kpi.value);
    const shouldScale = typeof baseValue === 'number' && ['registrados', 'pendientes', 'transito', 'parcial', 'completados', 'valorAcumulado'].includes(kpi.id);
    const value = shouldScale ? Math.max(0, Math.round(baseValue * statusFactor * rangeFactor)) : baseValue;
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
      downloadCsv(`reporte_pedidos_${selectedOrderStatus.toLowerCase()}_${dateRange}dias.csv`, makeCsv(
        ['ID', 'Metrica', 'Valor', 'Detalle', 'Estado', 'Rango'],
        currentKpis.map(kpi => [kpi.id, kpi.label, kpi.format(kpi.value), kpi.valueSub, selectedOrderStatus, `${dateRange} dias`])
      ));
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2200);
    }, 350);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header
        title="Resumen de Pedidos"
        subtitle="KPIs, estado de órdenes y evolución de compras"
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
          filterValue={selectedOrderStatus}
          onFilterChange={setSelectedOrderStatus}
          filterOptions={[
            { value: 'Todos', label: 'Todos los Pedidos' },
            { value: 'Pendientes', label: 'Pendientes' },
            { value: 'Transito', label: 'En transito' },
            { value: 'Parciales', label: 'Parciales' },
            { value: 'Completados', label: 'Completados' },
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
        Dashboard Desglosado - Mostrando: {selectedOrderStatus} / {dateRange} dias
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

      {/* ── Fila 1: barras agrupadas + valor mensual ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '1.5rem', marginBottom: '1.5rem',
      }}>
        {/* Barras agrupadas */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                Pedidos por Mes
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Registrados vs completados
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              {[
                { color: '#003471', label: 'Registrados' },
                { color: '#2fb01e', label: 'Completados' },
              ].map(l => (
                <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <GroupedBarChart data={PEDIDOS_MENSUALES} />
        </div>

        {/* Valor acumulado */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Valor Acumulado Mensual
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Monto total de compras por mes
            </p>
          </div>
          <LineChartValor data={VALOR_MENSUAL} />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.7rem',
            marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { label: 'Mín.', value: 'S/' + (Math.min(...VALOR_MENSUAL.map(d=>d.monto))/1000).toFixed(0)+'k', color: 'var(--danger)' },
              { label: 'Prom.', value: 'S/' + (VALOR_MENSUAL.reduce((s,d)=>s+d.monto,0)/VALOR_MENSUAL.length/1000).toFixed(0)+'k', color: '#ff6b00' },
              { label: 'Máx.', value: 'S/' + (Math.max(...VALOR_MENSUAL.map(d=>d.monto))/1000).toFixed(0)+'k', color: 'var(--success)' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--hover-bg)', border: '1px solid var(--glass-border)',
                borderRadius: 10, padding: '0.5rem 0.7rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>{stat.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color, marginTop: '0.1rem' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila 2: donut estado + tiempo entrega + top proveedores ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: '1.5rem',
      }}>
        {/* Donut estado */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Estado de Pedidos
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Distribución de los 44 pedidos del mes
            </p>
          </div>
          <DonutEstado data={ESTADO_PEDIDOS} />
        </div>

        {/* Tiempo de entrega */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Tiempo de Entrega
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Días promedio por mes — tendencia a la baja ↓
            </p>
          </div>
          <LineChartTiempo data={TIEMPO_MENSUAL} />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.6rem',
            marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { label: 'Inicio período', value: TIEMPO_MENSUAL[0].dias + 'd', color: 'var(--danger)' },
              { label: 'Actual', value: TIEMPO_MENSUAL[TIEMPO_MENSUAL.length-1].dias + 'd', color: 'var(--success)' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--hover-bg)', border: '1px solid var(--glass-border)',
                borderRadius: 10, padding: '0.5rem 0.7rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>{stat.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color, marginTop: '0.1rem' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top proveedores */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                Top 5 por Volumen
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Proveedores con mayor valor en órdenes
              </p>
            </div>
            <span style={{
              background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.25)',
              borderRadius: 20, padding: '3px 12px', fontSize: '0.7rem',
              fontWeight: 700, color: '#ff6b00',
            }}>
              Mayo 2026
            </span>
          </div>
          <TopPedidos data={TOP_PEDIDOS} />
        </div>
      </div>
    </div>
  );
}
