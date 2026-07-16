import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  CalendarCheck, UserPlus, LayoutGrid, AlertTriangle,
  Clock, CreditCard, BarChart2, ShoppingBag,
  TrendingUp, TrendingDown, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AnimatedKpiValue from '../../components/AnimatedKpiValue';
import SummaryControls, { downloadCsv, makeCsv } from '../../components/SummaryControls';

/* ─── Datos simulados base ─────────────────────────────────────── */

const KPI_DATA = [
  {
    id: 'activos',
    label: 'Empleados Activos',
    value: 28,
    valueSub: '98% asistencia',
    trend: +3.7,
    alert: 'green',
    icon: CalendarCheck,
    format: (v) => v.toString(),
    sparkData: [22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28],
  },
  {
    id: 'nuevos',
    label: 'Nuevos Ingresos',
    value: 2,
    valueSub: 'mes',
    trend: +100,
    alert: 'green',
    icon: UserPlus,
    format: (v) => v.toString(),
    sparkData: [0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 2],
  },
  {
    id: 'areas',
    label: 'Personal por Área',
    value: '6 áreas',
    valueSub: 'operativo',
    trend: null,
    alert: 'green',
    icon: LayoutGrid,
    format: (v) => v,
    sparkData: [4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6],
  },
  {
    id: 'ausencias',
    label: 'Ausencias y Tardanzas',
    value: 4,
    valueSub: 'hoy',
    trend: +33.3,
    alert: 'red',
    icon: AlertTriangle,
    format: (v) => v.toString(),
    sparkData: [1, 2, 1, 3, 2, 3, 2, 4, 3, 3, 4, 4],
  },
  {
    id: 'horas',
    label: 'Horas Trabajadas',
    value: 216,
    valueSub: 'hoy',
    trend: +8.0,
    alert: 'green',
    icon: Clock,
    format: (v) => v.toString(),
    sparkData: [160, 165, 168, 172, 175, 180, 185, 190, 195, 200, 208, 216],
  },
  {
    id: 'nomina',
    label: 'Nómina Pendiente',
    value: 18200,
    valueSub: 'planilla',
    trend: +5.2,
    alert: 'yellow',
    icon: CreditCard,
    format: (v) => 'S/ ' + Number(v).toLocaleString('es-PE'),
    sparkData: [14000, 14500, 15000, 15200, 15800, 16000, 16500, 17000, 17200, 17600, 18000, 18200],
  },
  {
    id: 'productividad',
    label: 'Productividad',
    value: 42800,
    valueSub: 'top ventas',
    trend: +12.6,
    alert: 'green',
    icon: BarChart2,
    format: (v) => 'S/ ' + Number(v).toLocaleString('es-PE'),
    sparkData: [28000, 30000, 31000, 33000, 34000, 36000, 37000, 38500, 40000, 41000, 42000, 42800],
  },
  {
    id: 'costo',
    label: 'Costo Personal',
    value: 86700,
    valueSub: 'mes',
    trend: +5.5,
    alert: 'yellow',
    icon: ShoppingBag,
    format: (v) => 'S/ ' + Number(v).toLocaleString('es-PE'),
    sparkData: [72000, 74000, 75000, 77000, 78000, 80000, 81000, 82500, 83000, 84500, 85500, 86700],
  },
];

/* Asistencia mensual */
const ASISTENCIA_MENSUAL = [
  { mes: 'Nov', pct: 94 },
  { mes: 'Dic', pct: 92 },
  { mes: 'Ene', pct: 95 },
  { mes: 'Feb', pct: 96 },
  { mes: 'Mar', pct: 97 },
  { mes: 'Abr', pct: 97 },
  { mes: 'May', pct: 98 },
];

/* Horas trabajadas por semana (mes actual) */
const HORAS_SEMANA = [
  { sem: 'S1', horas: 188 },
  { sem: 'S2', horas: 195 },
  { sem: 'S3', horas: 202 },
  { sem: 'S4', horas: 216 },
];

/* Personal por área */
const PERSONAL_AREAS = [
  { area: 'Ventas',       count: 8, color: '#003471' },
  { area: 'Almacén',      count: 6, color: '#ff6b00' },
  { area: 'Caja',         count: 4, color: '#2fb01e' },
  { area: 'Logística',    count: 4, color: '#fbc531' },
  { area: 'Administración', count: 3, color: '#00b8d4' },
  { area: 'Gerencia',     count: 3, color: '#9c27b0' },
];

/* Costo vs productividad mensual */
const COSTO_PRODUCTIVIDAD = [
  { mes: 'Nov', costo: 72000, prod: 28000 },
  { mes: 'Dic', costo: 75000, prod: 31000 },
  { mes: 'Ene', costo: 77000, prod: 33000 },
  { mes: 'Feb', costo: 80000, prod: 36000 },
  { mes: 'Mar', costo: 82000, prod: 39000 },
  { mes: 'Abr', costo: 84500, prod: 41000 },
  { mes: 'May', costo: 86700, prod: 42800 },
];

/* Top empleados por productividad */
const TOP_EMPLEADOS = [
  { nombre: 'Carlos Mamani Quispe',   area: 'Ventas',    monto: 42800, pct: 100 },
  { nombre: 'Rosa Huanca Flores',     area: 'Ventas',    monto: 38600, pct: 90  },
  { nombre: 'Jorge Tafur Ríos',       area: 'Almacén',   monto: 31200, pct: 73  },
  { nombre: 'Ana Lucía Vargas',       area: 'Caja',      monto: 26900, pct: 63  },
  { nombre: 'Miguel Ángel Condori',   area: 'Logística', monto: 21400, pct: 50  },
];

/* ─── Alert tokens ────────────────────────────────────────────── */

const ALERT_TOKENS = {
  green:  { bg: 'rgba(76,209,55,0.07)',  border: 'rgba(76,209,55,0.22)',  text: '#2fb01e' },
  yellow: { bg: 'rgba(251,197,49,0.07)', border: 'rgba(251,197,49,0.28)', text: '#d19e07' },
  red:    { bg: 'rgba(232,65,24,0.07)',  border: 'rgba(232,65,24,0.25)',  text: '#e84118' },
};

const BAD_UP = ['ausencias'];

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
  const uid = `spk${color.replace(/[^a-z0-9]/gi, '')}${data.slice(0, 3).join('')}`;
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

function KpiCard({ kpi, delay, isSelected, onClick }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const tok = ALERT_TOKENS[kpi.alert];
  const Icon = kpi.icon;
  const hasNum = kpi.trend !== null;
  const up = hasNum && kpi.trend >= 0;
  const isBad = BAD_UP.includes(kpi.id);
  const trendColor = isBad
    ? (up ? 'var(--danger)' : 'var(--success)')
    : (up ? 'var(--success)' : 'var(--danger)');
  const isLarge = typeof kpi.value === 'number' && kpi.value >= 10000;
  const isText  = typeof kpi.value === 'string';

  return (
    <div
      className="luxury-card interactive"
      onClick={onClick}
      style={{
        background: isSelected ? tok.border : tok.bg,
        border: `1.5px solid ${isSelected ? tok.text : tok.border}`,
        borderRadius: 18,
        padding: '1.4rem 1.5rem',
        marginBottom: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease, background 0.2s, border 0.2s',
        cursor: 'pointer',
        boxShadow: isSelected ? `0 8px 20px ${tok.border}` : 'none'
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
          background: isSelected ? '#ffffff' : tok.border, border: `1px solid ${tok.border}`,
          borderRadius: 10, padding: '0.45rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
          <Icon size={16} color={tok.text} />
        </div>
      </div>

      <div style={{
        fontSize: isText ? '1.55rem' : isLarge ? '1.5rem' : '1.85rem',
        fontWeight: 800, color: tok.text,
        lineHeight: 1.1, margin: '0.5rem 0 0.1rem',
      }}>
        <AnimatedKpiValue value={kpi.value} format={kpi.format} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.7rem' }}>
        {hasNum ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
            fontSize: '0.7rem', fontWeight: 700, color: trendColor,
          }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {kpi.valueSub}
          </span>
        ) : (
          <span style={{ fontSize: '0.7rem', color: tok.text, fontWeight: 600 }}>
            ↑ {kpi.valueSub}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>vs mes anterior</div>
        <Sparkline data={kpi.sparkData} color={tok.text} />
      </div>
    </div>
  );
}

/* ─── Line Chart — Asistencia mensual ────────────────────────── */

function LineChartAsistencia({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 460, H = 190, PAD_L = 44, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const minV = 88, maxV = 100;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.pct)}`).join(' ');
  const areaD = `${pathD} L${px(data.length - 1)},${PAD_T + chartH} L${px(0)},${PAD_T + chartH} Z`;
  const avg = data.reduce((s, d) => s + d.pct, 0) / data.length;
  const yTicks = [90, 93, 96, 99];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="asistGrad" x1="0" y1="0" x2="0" y2="1">
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
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#8397ab">{t}%</text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#asistGrad)" />
      <path d={pathD} fill="none" stroke="#003471" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      <line x1={PAD_L} x2={W - PAD_R} y1={py(avg)} y2={py(avg)}
        stroke="#ff6b00" strokeWidth={1} strokeDasharray="5 3" opacity={0.7} />
      <text x={W - PAD_R + 2} y={py(avg) + 4} fontSize={7.5} fill="#ff6b00">Prom</text>
      {data.map((d, i) => {
        const x = px(i), y = py(d.pct);
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
                <rect x={x - 20} y={y - 30} width={40} height={20} rx={5} fill="#003471" />
                <text x={x} y={y - 16} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
                  {d.pct}%
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

/* ─── Bar Chart — Personal por área ──────────────────────────── */

function BarChartAreas({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 440, H = 200, PAD_L = 100, PAD_B = 20, PAD_T = 16, PAD_R = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const maxVal = Math.max(...data.map(d => d.count)) || 1;
  const barH = chartH / data.length;
  const GAP = 0.28;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {[0, 2, 4, 6, 8, 10].map(t => {
        const x = PAD_L + (t / maxVal) * chartW;
        return (
          <g key={t}>
            <line x1={x} x2={x} y1={PAD_T} y2={PAD_T + chartH}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="3 3" />
            <text x={x} y={PAD_T + chartH + 12} textAnchor="middle" fontSize={8.5} fill="#8397ab">{t}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const bh = barH * (1 - GAP);
        const by = PAD_T + i * barH + (barH - bh) / 2;
        const bw = (d.count / maxVal) * chartW;
        const isHov = hovered === i;
        return (
          <g key={d.area}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <rect x={PAD_L} y={by} width={bw} height={bh} rx={5}
              fill={isHov ? '#002856' : d.color}
              opacity={hovered !== null && !isHov ? 0.38 : 1}
              style={{ transition: 'all 0.2s' }} />
            <text x={PAD_L + bw + 6} y={by + bh / 2 + 4}
              fontSize={10} fontWeight={700}
              fill={isHov ? d.color : 'var(--text-secondary)'}>
              {d.count}
            </text>
            <text x={PAD_L - 8} y={by + bh / 2 + 4} textAnchor="end"
              fontSize={9} fill={isHov ? d.color : '#5c6b73'}
              fontWeight={isHov ? 700 : 400}>
              {d.area}
            </text>
          </g>
        );
      })}

      <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
    </svg>
  );
}

/* ─── Dual Line — Costo vs Productividad ─────────────────────── */

function DualLineCostoProd({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 520, H = 200, PAD_L = 58, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const minV = 20000, maxV = 100000;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const pathCosto = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.costo)}`).join(' ');
  const pathProd  = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.prod)}`).join(' ');
  const areaProd  = `${pathProd} L${px(data.length-1)},${PAD_T+chartH} L${px(0)},${PAD_T+chartH} Z`;
  const yTicks = [30000, 50000, 70000, 90000];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
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
            <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={8} fill="#8397ab">
              S/{(t/1000).toFixed(0)}k
            </text>
          </g>
        );
      })}
      <path d={areaProd} fill="url(#prodGrad)" />
      <path d={pathCosto} fill="none" stroke="#003471" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      <path d={pathProd} fill="none" stroke="#2fb01e" strokeWidth={2}
        strokeDasharray="6 3" strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => {
        const x = px(i);
        const yc = py(d.costo), yp = py(d.prod);
        const isHov = hovered === i;
        const isLast = i === data.length - 1;
        return (
          <g key={d.mes}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={yc} r={isHov ? 6 : (isLast ? 5 : 3.5)}
              fill={isLast ? '#ff6b00' : '#003471'} stroke="#fff" strokeWidth={2}
              style={{ transition: 'all 0.18s' }} />
            <circle cx={x} cy={yp} r={isHov ? 6 : (isLast ? 5 : 3.5)}
              fill={isLast ? '#ff6b00' : '#2fb01e'} stroke="#fff" strokeWidth={2}
              style={{ transition: 'all 0.18s' }} />
            {isHov && (
              <>
                <rect x={x - 26} y={yc - 30} width={52} height={20} rx={5} fill="#003471" />
                <text x={x} y={yc - 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                  S/{(d.costo/1000).toFixed(0)}k
                </text>
                <rect x={x - 26} y={yp + 8} width={52} height={20} rx={5} fill="#2fb01e" />
                <text x={x} y={yp + 22} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                  S/{(d.prod/1000).toFixed(0)}k
                </text>
              </>
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

/* ─── Top Empleados ───────────────────────────────────────────── */

function TopEmpleados({ data }) {
  return (
    <div>
      {data.map((e, i) => (
        <div key={e.nombre} style={{
          display: 'flex', alignItems: 'center', gap: '0.9rem',
          padding: '0.72rem 0',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
              <span style={{
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: '70%',
              }}>
                {e.nombre}
              </span>
              <span style={{
                fontSize: '0.68rem', color: 'var(--text-muted)',
                background: 'var(--hover-bg)', borderRadius: 20,
                padding: '1px 8px', flexShrink: 0,
              }}>
                {e.area}
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 4, background: 'var(--hover-bg)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: `${e.pct}%`,
                background: i === 0
                  ? 'linear-gradient(90deg,#ff6b00,#ffaa60)'
                  : 'linear-gradient(90deg,#003471,#1a5ca8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.4rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
              S/ {Number(e.monto).toLocaleString('es-PE')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Horas por semana mini bars ──────────────────────────────── */

function HorasSemanaBars({ data }) {
  const max = Math.max(...data.map(d => d.horas)) || 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        return (
          <div key={d.sem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: isLast ? 700 : 500 }}>
                {d.sem}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isLast ? '#ff6b00' : 'var(--text-primary)' }}>
                {d.horas} hrs
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--hover-bg)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${(d.horas / max) * 100}%`,
                background: isLast
                  ? 'linear-gradient(90deg,#ff6b00,#ffaa60)'
                  : 'linear-gradient(90deg,#003471,#1a5ca8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function ResumenEmpleados() {
  const [dbData, setDbData] = useState(null);
  const [selectedKpi, setSelectedKpi] = useState('activos');
  const [selectedPeopleView, setSelectedPeopleView] = useState('Todos');
  const [dateRange, setDateRange] = useState('30');
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    const fetchDbSummary = async () => {
      try {
        const data = await api.get('/dashboard/resumen/empleados');
        setDbData(data);
      } catch (err) {
        console.error('Error fetching employees summary from DB:', err);
      }
    };
    fetchDbSummary();
  }, []);

  const getBaseKpiValue = (kpiId, defaultValue) => {
    if (!dbData || !dbData.kpis) return defaultValue;
    const activeVal = dbData.kpis[0]?.value ?? 28;
    const presentVal = dbData.kpis[1]?.value ?? 25;

    switch (kpiId) {
      case 'activos':
        return activeVal;
      case 'ausencias':
        return Math.max(0, activeVal - presentVal);
      case 'horas':
        return presentVal * 8;
      case 'nomina':
        return dbData.kpis[3]?.hint ?? defaultValue;
      case 'costo':
        if (dbData.rows) {
          const totalDaily = dbData.rows.reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
          return totalDaily > 0 ? totalDaily * 30 : defaultValue;
        }
        return defaultValue;
      default:
        return defaultValue;
    }
  };

  const getBaseKpiSub = (kpiId, defaultSub) => {
    if (!dbData || !dbData.kpis) return defaultSub;
    const activeVal = dbData.kpis[0]?.value ?? 28;
    const presentVal = dbData.kpis[1]?.value ?? 25;

    switch (kpiId) {
      case 'activos':
        return `${dbData.kpis[0]?.hint ?? '98% asistencia'}`;
      case 'ausencias':
        const absent = Math.max(0, activeVal - presentVal);
        return absent > 0 ? `${absent} ausentes hoy` : 'Sin incidencias hoy';
      case 'horas':
        return `${presentVal} presentes hoy`;
      case 'nomina':
        return `S/ ${Number(dbData.kpis[3]?.hint ?? 18200).toLocaleString('es-PE')} planilla`;
      case 'costo':
        if (dbData.rows) {
          const totalDaily = dbData.rows.reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
          return `S/ ${totalDaily.toLocaleString('es-PE')} al día`;
        }
        return defaultSub;
      default:
        return defaultSub;
    }
  };

  const peopleFactor = selectedPeopleView === 'Activos' ? 0.88 : selectedPeopleView === 'Asistencia' ? 0.76 : selectedPeopleView === 'Ausencias' ? 0.18 : selectedPeopleView === 'Nomina' ? 0.55 : 1;
  const rangeFactor = dateRange === '7' ? 0.4 : dateRange === '365' ? 2.15 : 1;

  const currentKpis = KPI_DATA.map(kpi => {
    const val = getBaseKpiValue(kpi.id, kpi.value);
    const sub = getBaseKpiSub(kpi.id, kpi.valueSub);
    const scaledVal = typeof val === 'number' && ['activos', 'nuevos', 'ausencias', 'horas', 'nomina', 'costo'].includes(kpi.id)
      ? Math.max(0, Math.round(val * peopleFactor * rangeFactor))
      : val;
    const spark = typeof val === 'number' && typeof kpi.value === 'number' && kpi.value !== 0
      ? kpi.sparkData.map(v => Math.round(v * (scaledVal / kpi.value)))
      : kpi.sparkData;
    return {
      ...kpi,
      value: scaledVal,
      valueSub: sub,
      sparkData: spark
    };
  });

  const handleExport = () => {
    setExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      downloadCsv(`reporte_empleados_${selectedPeopleView.toLowerCase()}_${dateRange}dias.csv`, makeCsv(
        ['ID', 'Metrica', 'Valor', 'Detalle', 'Vista', 'Rango'],
        currentKpis.map(kpi => [kpi.id, kpi.label, kpi.format(kpi.value), kpi.valueSub, selectedPeopleView, `${dateRange} dias`])
      ));
      setExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2200);
    }, 350);
  };

  const activeVal = dbData?.kpis?.[0]?.value ?? 28;
  const presentVal = dbData?.kpis?.[1]?.value ?? 25;
  const pctToday = activeVal > 0 ? Math.round((presentVal / activeVal) * 100) : 98;

  const dynamicAsistenciaMensual = ASISTENCIA_MENSUAL.map((d, i) => {
    if (i === ASISTENCIA_MENSUAL.length - 1) {
      return { ...d, pct: pctToday };
    }
    return d;
  });

  const dynamicPersonalAreas = (() => {
    if (!dbData || !dbData.rows || dbData.rows.length === 0) {
      return PERSONAL_AREAS;
    }
    const rolesCount = {};
    dbData.rows.forEach(r => {
      const role = r[1] || 'Sin rol';
      rolesCount[role] = (rolesCount[role] || 0) + 1;
    });
    const colors = ['#003471', '#ff6b00', '#2fb01e', '#fbc531', '#00b8d4', '#9c27b0', '#7f8c8d'];
    return Object.keys(rolesCount).map((role, idx) => ({
      area: role,
      count: rolesCount[role],
      color: colors[idx % colors.length]
    }));
  })();

  const dynamicCostoProductividad = (() => {
    const defaultData = COSTO_PRODUCTIVIDAD;
    if (!dbData || !dbData.rows) return defaultData;

    const totalDaily = dbData.rows.reduce((sum, r) => sum + (Number(r[3]) || 0), 0);
    const totalMonthlyCost = totalDaily > 0 ? totalDaily * 30 : 86700;

    return defaultData.map((d, i) => {
      if (i === defaultData.length - 1) {
        return {
          ...d,
          costo: totalMonthlyCost,
          prod: Math.round(totalMonthlyCost * 0.493)
        };
      }
      return d;
    });
  })();

  const dynamicHorasSemana = (() => {
    const defaultData = HORAS_SEMANA;
    if (!dbData || !dbData.kpis) return defaultData;

    const weeklyHours = presentVal * 8 * 5;

    return defaultData.map((d, i) => {
      if (i === defaultData.length - 1) {
        return { ...d, horas: weeklyHours };
      }
      return d;
    });
  })();

  const dynamicTopEmployees = (() => {
    if (!dbData || !dbData.rows || dbData.rows.length === 0) {
      return TOP_EMPLEADOS;
    }
    const employees = dbData.rows.map(r => {
      const name = r[0];
      const role = r[1] || 'Sin rol';
      const pay = Number(r[3]) || 0;
      const monto = Math.round(pay * 25);
      return { nombre: name, area: role, monto };
    }).sort((a, b) => b.monto - a.monto);

    const top5 = employees.slice(0, 5);
    const maxMonto = Math.max(...top5.map(e => e.monto)) || 1;
    return top5.map(e => ({
      ...e,
      pct: Math.round((e.monto / maxMonto) * 100)
    }));
  })();

  const getDynamicInsight = () => {
    const active = currentKpis.find(k => k.id === 'activos')?.value ?? 28;
    const ausencias = currentKpis.find(k => k.id === 'ausencias')?.value ?? 4;
    const horas = currentKpis.find(k => k.id === 'horas')?.value ?? 216;
    const nomina = currentKpis.find(k => k.id === 'nomina')?.value ?? 18200;
    const costo = currentKpis.find(k => k.id === 'costo')?.value ?? 86700;
    const nuevos = currentKpis.find(k => k.id === 'nuevos')?.value ?? 2;
    const rolesCount = dynamicPersonalAreas.length;

    switch(selectedKpi) {
      case 'activos':
        return `Resumen de Equipo: Actualmente hay ${active} empleados activos en planilla, distribuidos en ${rolesCount} roles operativos. La estabilidad de la plantilla se sitúa en un 96.5%.`;
      case 'nuevos':
        return `Nuevos Ingresos: Se registraron ${nuevos} ingresos este mes para reforzar la operación. Todo el personal nuevo ha completado satisfactoriamente el onboarding.`;
      case 'areas':
        return `Distribución por Áreas: El equipo comercial concentró el mayor aporte operativo. Almacén y Caja representan el núcleo de servicio y despacho en tienda.`;
      case 'ausencias':
        return `Asistencia y Ausencias: Hoy se registraron ${ausencias} ausencias/tardanzas en total. La tasa de asistencia actual es del ${pctToday}%. Se sugiere coordinar relevos preventivos.`;
      case 'horas':
        return `Horas Laboradas: Se han computado ${horas} horas de trabajo hoy en toda la empresa. El promedio de horas por colaborador se mantiene óptimo y productivo.`;
      case 'nomina':
        return `Boletas y Planilla: Se registraron boletas de nómina este periodo. El total estimado acumulado es de S/ ${Number(nomina).toLocaleString('es-PE')}, procesado según programación habitual.`;
      case 'productividad':
        return `Indicadores de Aporte: La productividad individual ha subido un 12.6% este mes. El personal del área de Ventas lidera las comisiones acumuladas.`;
      case 'costo':
        return `Gestión de Presupuesto: El costo de personal total de este mes es de S/ ${Number(costo).toLocaleString('es-PE')}. Representa un balance equilibrado frente al volumen de ingresos.`;
      default:
        return 'Seleccione una métrica para ver un desglose analítico en tiempo real.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header
        title="Resumen de Empleados"
        subtitle="KPIs, asistencia, productividad y distribución de personal"
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
          filterValue={selectedPeopleView}
          onFilterChange={setSelectedPeopleView}
          filterOptions={[
            { value: 'Todos', label: 'Todo el Personal' },
            { value: 'Activos', label: 'Activos' },
            { value: 'Asistencia', label: 'Asistencia' },
            { value: 'Ausencias', label: 'Ausencias' },
            { value: 'Nomina', label: 'Nomina' },
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
        Dashboard Desglosado - Mostrando: {selectedPeopleView} / {dateRange} dias
      </div>

      {/* ── 8 KPI Cards ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
        gap: '1.1rem',
        marginBottom: '2rem',
      }}>
        {currentKpis.map((kpi, i) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            delay={i * 45}
            isSelected={selectedKpi === kpi.id}
            onClick={() => setSelectedKpi(kpi.id)}
          />
        ))}
      </section>

      {/* Insight Box */}
      <div className="luxury-card" style={{
        background: 'linear-gradient(90deg, rgba(0,52,113,0.06), rgba(255,107,0,0.06))',
        border: '1px dashed rgba(0,52,113,0.25)',
        borderRadius: 14,
        padding: '1.2rem 1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.1rem'
      }}>
        <div style={{
          background: 'rgba(0,52,113,0.1)',
          border: '1px solid rgba(0,52,113,0.2)',
          borderRadius: '50%',
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '1.2rem' }}>💡</span>
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <strong>Análisis Operativo:</strong> {getDynamicInsight()}
        </div>
      </div>

      {/* ── Fila 1: asistencia + áreas ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '1.5rem', marginBottom: '1.5rem',
      }}>
        {/* Línea asistencia */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Asistencia Mensual
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Porcentaje de asistencia del equipo por mes
            </p>
          </div>
          <LineChartAsistencia data={dynamicAsistenciaMensual} />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '0.7rem',
            marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { label: 'Mín.', value: Math.min(...dynamicAsistenciaMensual.map(d=>d.pct))+'%', color: 'var(--danger)' },
              { label: 'Prom.', value: (dynamicAsistenciaMensual.reduce((s,d)=>s+d.pct,0)/dynamicAsistenciaMensual.length).toFixed(1)+'%', color: '#ff6b00' },
              { label: 'Actual', value: dynamicAsistenciaMensual[dynamicAsistenciaMensual.length-1].pct+'%', color: 'var(--success)' },
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

        {/* Barras horizontales — áreas */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                Personal por Área / Rol
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Distribución de los empleados activos en el sistema
              </p>
            </div>
            <span style={{
              background: 'rgba(0,52,113,0.07)', border: '1px solid rgba(0,52,113,0.15)',
              borderRadius: 20, padding: '3px 12px', fontSize: '0.7rem',
              fontWeight: 700, color: 'var(--accent)',
            }}>
              {activeVal} activos
            </span>
          </div>
          <BarChartAreas data={dynamicPersonalAreas} />
        </div>
      </div>

      {/* ── Fila 2: costo vs prod + horas semana + top empleados ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: '1.5rem',
      }}>
        {/* Dual line costo vs prod */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                Costo vs Productividad
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Evolución mensual comparativa
              </p>
            </div>
          </div>
          <DualLineCostoProd data={dynamicCostoProductividad} />
          <div style={{
            display: 'flex', gap: '1.5rem', marginTop: '0.8rem',
            paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { color: '#003471', label: 'Costo personal', dashed: false },
              { color: '#2fb01e', label: 'Productividad', dashed: true },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                <span style={{
                  width: 18, height: l.dashed ? 2 : 3,
                  background: l.color, borderRadius: 2, display: 'inline-block',
                  ...(l.dashed ? { borderTop: `2px dashed ${l.color}`, background: 'transparent' } : {}),
                }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Horas semana */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
              Horas por Semana
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Mes actual
            </p>
          </div>
          <HorasSemanaBars data={dynamicHorasSemana} />
          <div style={{
            marginTop: '1rem', paddingTop: '0.8rem',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total mes</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ff6b00' }}>
              {dynamicHorasSemana.reduce((s,d)=>s+d.horas,0)} hrs
            </span>
          </div>
        </div>

        {/* Top empleados */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                Top 5 Productividad
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Empleados con mayor aporte al mes
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
          <TopEmpleados data={dynamicTopEmployees} />
        </div>
      </div>
    </div>
  );
}
