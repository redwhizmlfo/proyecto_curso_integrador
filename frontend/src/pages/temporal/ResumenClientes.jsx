import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  Users, UserPlus, UserCheck, UserX,
  RefreshCw, DollarSign, ShoppingBag, Layers,
  TrendingUp, TrendingDown, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

/* ─── Datos simulados ─────────────────────────────────────────── */

const KPI_DATA = [
  {
    id: 'activos',
    label: 'Clientes Activos',
    value: 1188,
    valueSub: '+92.5%',
    trend: +92.5,
    alert: 'green',
    icon: Users,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [520, 580, 620, 680, 720, 790, 850, 920, 980, 1050, 1120, 1188],
  },
  {
    id: 'nuevos',
    label: 'Clientes Nuevos',
    value: 42,
    valueSub: '+7',
    trend: +20,
    alert: 'green',
    icon: UserPlus,
    format: (v) => v.toString(),
    sparkData: [18, 22, 20, 25, 24, 28, 27, 32, 30, 35, 38, 42],
  },
  {
    id: 'frecuentes',
    label: 'Clientes Frecuentes',
    value: 318,
    valueSub: '+24.7%',
    trend: +24.7,
    alert: 'green',
    icon: UserCheck,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [180, 195, 200, 215, 222, 238, 248, 260, 272, 285, 300, 318],
  },
  {
    id: 'inactivos',
    label: 'Clientes Inactivos',
    value: 96,
    valueSub: 'recuperar',
    trend: +8.0,
    alert: 'red',
    icon: UserX,
    format: (v) => v.toString(),
    sparkData: [70, 72, 74, 76, 75, 78, 80, 82, 85, 88, 92, 96],
  },
  {
    id: 'retencion',
    label: 'Retención',
    value: 84,
    valueSub: '+5%',
    trend: +5,
    alert: 'green',
    icon: RefreshCw,
    format: (v) => v + '%',
    sparkData: [68, 70, 71, 73, 72, 75, 74, 77, 78, 80, 82, 84],
  },
  {
    id: 'valor',
    label: 'Valor del Cliente',
    value: 48920,
    valueSub: 'top',
    trend: +12.4,
    alert: 'green',
    icon: DollarSign,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [32000, 34000, 35000, 37000, 38500, 40000, 41500, 43000, 44800, 46000, 47500, 48920],
  },
  {
    id: 'frecuenciaCompra',
    label: 'Frecuencia Compra',
    value: 2.8,
    valueSub: 'mes',
    trend: +7.7,
    alert: 'green',
    icon: ShoppingBag,
    format: (v) => v.toFixed(1),
    sparkData: [1.8, 1.9, 2.0, 2.1, 2.0, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8],
  },
  {
    id: 'segmentos',
    label: 'Segmentos',
    value: 'Natural / Empresa',
    valueSub: 'activos',
    trend: null,
    alert: 'yellow',
    icon: Layers,
    format: (v) => v,
    sparkData: [60, 62, 65, 68, 70, 72, 74, 76, 78, 80, 82, 84],
  },
];

const NUEVOS_MENSUALES = [
  { mes: 'Nov', valor: 18 },
  { mes: 'Dic', valor: 22 },
  { mes: 'Ene', valor: 20 },
  { mes: 'Feb', valor: 28 },
  { mes: 'Mar', valor: 32 },
  { mes: 'Abr', valor: 35 },
  { mes: 'May', valor: 42 },
];

const RETENCION_MENSUAL = [
  { mes: 'Nov', valor: 70 },
  { mes: 'Dic', valor: 73 },
  { mes: 'Ene', valor: 72 },
  { mes: 'Feb', valor: 75 },
  { mes: 'Mar', valor: 78 },
  { mes: 'Abr', valor: 80 },
  { mes: 'May', valor: 84 },
];

const SEGMENTOS = [
  { label: 'Persona Natural', count: 712, pct: 60, color: '#003471' },
  { label: 'Empresa / RUC',   count: 368, pct: 31, color: '#ff6b00' },
  { label: 'Distribuidor',    count: 108, pct: 9,  color: '#4cd137' },
];

const TOP_CLIENTES = [
  { nombre: 'Constructora del Norte SAC', compras: 38, monto: 48920, pct: 100 },
  { nombre: 'Ferretería Miraflores EIRL', compras: 52, monto: 34100, pct: 70  },
  { nombre: 'Inversiones Cóndor SRL',     compras: 29, monto: 27600, pct: 56  },
  { nombre: 'Juan Carlos Quispe',          compras: 18, monto: 14850, pct: 30  },
  { nombre: 'María Elena Tafur',           compras: 14, monto: 9340,  pct: 19  },
];

/* ─── Alert tokens ────────────────────────────────────────────── */

const ALERT_TOKENS = {
  green:  { bg: 'rgba(76,209,55,0.07)',  border: 'rgba(76,209,55,0.22)',  text: '#2fb01e' },
  yellow: { bg: 'rgba(251,197,49,0.07)', border: 'rgba(251,197,49,0.28)', text: '#d19e07' },
  red:    { bg: 'rgba(232,65,24,0.07)',  border: 'rgba(232,65,24,0.25)',  text: '#e84118' },
};

const BAD_KPIS = ['inactivos'];

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
  const hasNumericTrend = kpi.trend !== null;
  const up = hasNumericTrend && kpi.trend >= 0;
  const isBad = BAD_KPIS.includes(kpi.id);
  const trendColor = isBad
    ? (up ? 'var(--danger)' : 'var(--success)')
    : (up ? 'var(--success)' : 'var(--danger)');
  const isText = typeof kpi.value === 'string';

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
          background: tok.border,
          border: `1px solid ${tok.border}`,
          borderRadius: 10, padding: '0.45rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={tok.text} />
        </div>
      </div>

      <div style={{
        fontSize: isText ? '1.25rem' : '1.85rem',
        fontWeight: 800,
        color: tok.text,
        lineHeight: 1.15,
        margin: '0.5rem 0 0.1rem',
      }}>
        {kpi.format(kpi.value)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.7rem' }}>
        {hasNumericTrend ? (
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
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          vs mes anterior
        </div>
        <Sparkline data={kpi.sparkData} color={tok.text} />
      </div>
    </div>
  );
}

/* ─── Bar Chart — Nuevos clientes mensuales ───────────────────── */

function BarChartNuevos({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 480, H = 200, PAD_L = 42, PAD_B = 32, PAD_T = 16, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const maxVal = Math.max(...data.map(d => d.valor));
  const barW = chartW / data.length;
  const yTicks = [0, 10, 20, 30, 40];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {yTicks.map(t => {
        const y = PAD_T + chartH - (t / maxVal) * chartH;
        return (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
              stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
            <text x={PAD_L - 6} y={y + 4} textAnchor="end"
              fontSize={9} fill="#8397ab">{t}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const bw = barW * 0.6;
        const bx = PAD_L + i * barW + (barW - bw) / 2;
        const bh = (d.valor / maxVal) * chartH;
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
                fontSize={10} fontWeight={700} fill={isLast ? '#ff6b00' : '#003471'}>
                {d.valor}
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

/* ─── Line Chart — Retención mensual ─────────────────────────── */

function LineChartRetencion({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 460, H = 190, PAD_L = 44, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const minV = 60, maxV = 90;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i)},${py(d.valor)}`).join(' ');
  const areaD = `${pathD} L${px(data.length - 1)},${PAD_T + chartH} L${px(0)},${PAD_T + chartH} Z`;
  const avg = data.reduce((s, d) => s + d.valor, 0) / data.length;
  const yTicks = [65, 70, 75, 80, 85];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="retLineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003471" stopOpacity={0.14} />
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
      <path d={areaD} fill="url(#retLineGrad)" />
      <path d={pathD} fill="none" stroke="#003471" strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      <line x1={PAD_L} x2={W - PAD_R} y1={py(avg)} y2={py(avg)}
        stroke="#ff6b00" strokeWidth={1} strokeDasharray="5 3" opacity={0.7} />
      <text x={W - PAD_R + 2} y={py(avg) + 4} fontSize={7.5} fill="#ff6b00">Prom</text>
      {data.map((d, i) => {
        const x = px(i), y = py(d.valor);
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
                  {d.valor}%
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

/* ─── Donut Chart — Segmentos ─────────────────────────────────── */

function DonutSegmentos({ data }) {
  const [hovered, setHovered] = useState(null);
  const CX = 90, CY = 90, R = 70, r = 42;
  const total = data.reduce((s, d) => s + d.count, 0);
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const sweep = (d.count / total) * 2 * Math.PI;
    const x1 = CX + R * Math.cos(angle);
    const y1 = CY + R * Math.sin(angle);
    const x2 = CX + R * Math.cos(angle + sweep);
    const y2 = CY + R * Math.sin(angle + sweep);
    const ix1 = CX + r * Math.cos(angle);
    const iy1 = CY + r * Math.sin(angle);
    const ix2 = CX + r * Math.cos(angle + sweep);
    const iy2 = CY + r * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const midAngle = angle + sweep / 2;
    const pathD = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');
    const slice = { ...d, pathD, midAngle, i };
    angle += sweep;
    return slice;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <svg viewBox={`0 0 ${CX * 2} ${CY * 2}`} style={{ width: 180, height: 180, flexShrink: 0 }}>
        {slices.map((s) => {
          const isHov = hovered === s.i;
          return (
            <path key={s.label} d={s.pathD}
              fill={s.color}
              opacity={hovered !== null && !isHov ? 0.38 : 1}
              style={{
                transform: isHov ? `translate(${Math.cos(s.midAngle) * 4}px, ${Math.sin(s.midAngle) * 4}px)` : 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHovered(s.i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Center label */}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={18} fontWeight={800} fill="#0a1629">
          {total.toLocaleString('es-PE')}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize={8.5} fill="#5c6b73" fontWeight={600}>
          CLIENTES
        </text>
      </svg>

      {/* Legend */}
      <div style={{ flex: 1 }}>
        {slices.map((s) => (
          <div key={s.label}
            onMouseEnter={() => setHovered(s.i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.55rem 0.6rem',
              borderRadius: 8,
              marginBottom: '0.35rem',
              background: hovered === s.i ? 'var(--hover-bg)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
            <span style={{
              width: 12, height: 12, borderRadius: 3,
              background: s.color, flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {s.label}
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {s.count.toLocaleString('es-PE')}
            </span>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: s.color,
              background: `${s.color}14`,
              border: `1px solid ${s.color}30`,
              borderRadius: 20, padding: '1px 8px',
            }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Top Clientes ────────────────────────────────────────────── */

function TopClientes({ data }) {
  return (
    <div>
      {data.map((c, i) => (
        <div key={c.nombre} style={{
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
              {c.nombre}
            </div>
            <div style={{ height: 5, borderRadius: 4, background: 'var(--hover-bg)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: `${c.pct}%`,
                background: i === 0
                  ? 'linear-gradient(90deg, #ff6b00, #ffaa60)'
                  : 'linear-gradient(90deg, #003471, #1a5ca8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
              S/ {c.monto.toLocaleString('es-PE')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {c.compras} compras
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────── */

export default function ResumenClientes() {
  const [dbData, setDbData] = useState(null);

  useEffect(() => {
    const fetchDbSummary = async () => {
      try {
        const data = await api.get('/dashboard/resumen/clientes');
        setDbData(data);
      } catch (err) {
        console.error('Error fetching customers summary from DB:', err);
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
        return dbData.kpis[3]?.value ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  const currentKpis = KPI_DATA.map(kpi => ({
    ...kpi,
    value: getBaseKpiValue(kpi.id, kpi.value),
    sparkData: typeof kpi.value === 'number' && getBaseKpiValue(kpi.id, kpi.value) !== kpi.value
      ? kpi.sparkData.map(v => Math.round(v * (getBaseKpiValue(kpi.id, kpi.value) / kpi.value)))
      : kpi.sparkData
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header
        title="Resumen de Clientes"
        subtitle="KPIs, segmentación y comportamiento de compra"
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--accent-gold)', textDecoration: 'none',
          fontSize: '0.82rem', fontWeight: 700,
        }}>
          <ArrowLeft size={14} /> Volver al Dashboard
        </Link>
      </div>

      <div style={{
        fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        marginBottom: '0.8rem',
      }}>
        Dashboard Desglosado (Sincronizado con Base de Datos)
      </div>

      {/* ── 8 KPI Cards ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
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
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        {/* Barras — nuevos clientes */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
            }}>
              Clientes Nuevos por Mes
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Incorporaciones mensuales al sistema
            </p>
          </div>
          <BarChartNuevos data={NUEVOS_MENSUALES} />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem',
            marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { label: 'Mín.', value: Math.min(...NUEVOS_MENSUALES.map(d => d.valor)), color: 'var(--danger)' },
              { label: 'Prom.', value: Math.round(NUEVOS_MENSUALES.reduce((s,d)=>s+d.valor,0)/NUEVOS_MENSUALES.length), color: '#ff6b00' },
              { label: 'Máx.', value: Math.max(...NUEVOS_MENSUALES.map(d => d.valor)), color: 'var(--success)' },
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

        {/* Línea — retención */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
            }}>
              Tasa de Retención Mensual
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Evolución del porcentaje de clientes retenidos
            </p>
          </div>
          <LineChartRetencion data={RETENCION_MENSUAL} />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem',
            marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { label: 'Mín.', value: Math.min(...RETENCION_MENSUAL.map(d=>d.valor)) + '%', color: 'var(--danger)' },
              { label: 'Prom.', value: (RETENCION_MENSUAL.reduce((s,d)=>s+d.valor,0)/RETENCION_MENSUAL.length).toFixed(1) + '%', color: '#ff6b00' },
              { label: 'Máx.', value: Math.max(...RETENCION_MENSUAL.map(d=>d.valor)) + '%', color: 'var(--success)' },
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

      {/* ── Gráficos fila 2 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: '1.5rem',
      }}>
        {/* Donut — segmentos */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
            }}>
              Distribución por Segmento
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Desglose de clientes activos por tipo
            </p>
          </div>
          <DonutSegmentos data={SEGMENTOS} />
        </div>

        {/* Top clientes */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
              }}>
                Top 5 Clientes por Valor
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Ranking por monto acumulado este mes
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
          <TopClientes data={TOP_CLIENTES} />
        </div>
      </div>
    </div>
  );
}
