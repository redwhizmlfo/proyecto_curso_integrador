import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  ShoppingBag, BarChart2, FileText, TrendingUp,
  TrendingDown, ArrowLeft, DollarSign, Clock,
  Users, Package, Filter, Download, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─── Datos base de la aplicación (los mismos originales) ─────────── */

const KPI_DATA = [
  {
    id: 'ventasDia',
    label: 'Ventas del Día',
    value: 16840,
    valueSub: '+18.2%',
    trend: +18.2,
    alert: 'green',
    icon: ShoppingBag,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [80, 95, 88, 102, 98, 115, 110, 128, 122, 138, 145, 168],
  },
  {
    id: 'ventasMes',
    label: 'Ventas del Mes',
    value: 328400,
    valueSub: '+9.8%',
    trend: +9.8,
    alert: 'green',
    icon: BarChart2,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [200, 215, 210, 228, 222, 240, 235, 250, 260, 272, 280, 295],
  },
  {
    id: 'ticket',
    label: 'Ticket Promedio',
    value: 426.20,
    valueSub: '+4.1%',
    trend: +4.1,
    alert: 'green',
    icon: FileText,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    sparkData: [380, 390, 385, 400, 395, 408, 405, 415, 410, 420, 418, 426],
  },
  {
    id: 'margen',
    label: 'Margen de Ganancia',
    value: 36.4,
    valueSub: '+2.7%',
    trend: +2.7,
    alert: 'green',
    icon: TrendingUp,
    format: (v) => v.toFixed(1) + '%',
    sparkData: [30, 31, 30.5, 32, 31.8, 33, 32.5, 34, 33.8, 35, 35.5, 36.4],
  },
  {
    id: 'ganancia',
    label: 'Ganancia Estimada',
    value: 6120,
    valueSub: '+11.3%',
    trend: +11.3,
    alert: 'green',
    icon: DollarSign,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [42, 45, 44, 48, 47, 51, 50, 54, 52, 57, 58, 61],
  },
  {
    id: 'horaPico',
    label: 'Hora Pico',
    value: '12:00 – 14:00',
    valueSub: 'mayor demanda',
    trend: null,
    alert: 'yellow',
    icon: Clock,
    format: (v) => v,
    sparkData: [20, 35, 50, 70, 90, 100, 98, 85, 60, 40, 30, 25],
  },
  {
    id: 'recurrentes',
    label: 'Clientes Recurrentes',
    value: 318,
    valueSub: '+24.7%',
    trend: +24.7,
    alert: 'green',
    icon: Users,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [180, 195, 200, 215, 210, 230, 240, 252, 260, 275, 290, 318],
  },
  {
    id: 'productosVendidos',
    label: 'Productos Vendidos',
    value: 1248,
    valueSub: '+14%',
    trend: +14,
    alert: 'green',
    icon: Package,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [700, 750, 740, 800, 790, 850, 860, 920, 940, 1000, 1100, 1248],
  },
];

/* Ventas diarias del mes */
const VENTAS_DIARIAS = [
  { dia: '01', monto: 9200 }, { dia: '02', monto: 11400 }, { dia: '03', monto: 8800 },
  { dia: '04', monto: 13200 }, { dia: '05', monto: 15600 }, { dia: '06', monto: 12100 },
  { dia: '07', monto: 10500 }, { dia: '08', monto: 14800 }, { dia: '09', monto: 16200 },
  { dia: '10', monto: 11900 }, { dia: '11', monto: 13500 }, { dia: '12', monto: 17800 },
  { dia: '13', monto: 9600 },  { dia: '14', monto: 12400 }, { dia: '15', monto: 18200 },
  { dia: '16', monto: 14100 }, { dia: '17', monto: 15900 }, { dia: '18', monto: 16840 },
];

/* Ingresos mensuales */
const INGRESOS_MENSUALES = [
  { mes: 'Nov', monto: 241000 },
  { mes: 'Dic', monto: 312000 },
  { mes: 'Ene', monto: 278000 },
  { mes: 'Feb', monto: 295000 },
  { mes: 'Mar', monto: 310000 },
  { mes: 'Abr', monto: 299000 },
  { mes: 'May', monto: 328400 },
];

/* Top productos más vendidos */
const TOP_PRODUCTOS = [
  { nombre: 'Taladro Percutor HD-902', unidades: 184, monto: 36800, pct: 100 },
  { nombre: 'Casco de Seguridad SF-101', unidades: 312, monto: 18720, pct: 82 },
  { nombre: 'Pernos Hexagonales BL-004', unidades: 890, monto: 14240, pct: 68 },
  { nombre: 'Interruptor Eléctrico EL-772', unidades: 440, monto: 13200, pct: 58 },
  { nombre: 'Cemento Sol 42.5kg', unidades: 210, monto: 10500, pct: 44 },
];

const ALERT_TOKENS = {
  green:  { bg: 'rgba(76,209,55,0.07)',  border: 'rgba(76,209,55,0.22)',  text: '#2fb01e', label: 'Normal'   },
  yellow: { bg: 'rgba(251,197,49,0.07)', border: 'rgba(251,197,49,0.28)', text: '#d19e07', label: 'Atención' },
  red:    { bg: 'rgba(232,65,24,0.07)',  border: 'rgba(232,65,24,0.25)',  text: '#e84118', label: 'Crítico'  },
};

/* ─── Sparkline ──────────────────────────────────────────────────── */

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
  const uid = `spk${color.replace(/[^a-z0-9]/gi, '')}${data.slice(0,3).join('')}`;
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

/* ─── KPI Card ───────────────────────────────────────────────────── */

function KpiCard({ kpi, delay, isSelected, onClick }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const tok = ALERT_TOKENS[kpi.alert];
  const Icon = kpi.icon;
  const hasNumericTrend = kpi.trend !== null;
  const up = hasNumericTrend && kpi.trend >= 0;
  const trendColor = up ? 'var(--success)' : 'var(--danger)';

  return (
    <div
      className="luxury-card interactive"
      onClick={onClick}
      style={{
        background: isSelected ? `${tok.border}` : tok.bg,
        border: `1.5px solid ${isSelected ? tok.text : tok.border}`,
        borderRadius: 18,
        padding: '1.4rem 1.5rem',
        marginBottom: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease, background-color 0.25s, border-color 0.25s, box-shadow 0.25s',
        cursor: 'pointer',
        boxShadow: isSelected ? `0 8px 20px ${tok.border}` : 'none'
      }}
    >
      {/* Icon + label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          color: 'var(--text-secondary)', fontSize: '0.7rem',
          textTransform: 'uppercase', letterSpacing: '1.1px', fontWeight: 700,
        }}>
          {kpi.label}
        </div>
        <div style={{
          background: isSelected ? '#ffffff' : `${tok.border}`,
          border: `1px solid ${tok.border}`,
          borderRadius: 10, padding: '0.45rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
          <Icon size={16} color={tok.text} />
        </div>
      </div>

      {/* Big value */}
      <div style={{
        fontSize: kpi.id === 'horaPico' ? '1.4rem' : '1.85rem',
        fontWeight: 800,
        color: tok.text,
        lineHeight: 1.1,
        margin: '0.5rem 0 0.1rem',
        letterSpacing: kpi.id === 'horaPico' ? '-0.5px' : 'normal',
      }}>
        {kpi.format(kpi.value)}
      </div>

      {/* Sub label inline with value */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.7rem' }}>
        {hasNumericTrend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
            fontSize: '0.7rem', fontWeight: 700, color: trendColor,
            background: isSelected ? '#ffffff' : 'transparent',
            borderRadius: 10, padding: isSelected ? '1px 6px' : '0'
          }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {kpi.valueSub}
          </span>
        )}
        {!hasNumericTrend && (
          <span style={{ fontSize: '0.7rem', color: tok.text, fontWeight: 600 }}>
            ↑ {kpi.valueSub}
          </span>
        )}
      </div>

      {/* Trend label + sparkline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          vs mes anterior
        </div>
        <Sparkline data={kpi.sparkData} color={tok.text} />
      </div>
    </div>
  );
}

/* ─── Bar Chart — Ventas diarias (Dinámica) ───────────────────────── */

function BarChartVentas({ data, hoveredBar, onHoverBar }) {
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const W = 580, H = 210, PAD_L = 58, PAD_B = 32, PAD_T = 16, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const maxVal = Math.max(...data.map(d => d.monto));
  const barW = chartW / data.length;
  const yTicks = [0, 5000, 10000, 15000, 20000];

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {yTicks.map(t => {
          const y = PAD_T + chartH - (t / maxVal) * chartH;
          return (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
                stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
              <text x={PAD_L - 6} y={y + 4} textAnchor="end"
                fontSize={8.5} fill="#8397ab">
                {t >= 1000 ? 'S/' + (t / 1000) + 'k' : t}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const bw = barW * 0.62;
          const bx = PAD_L + i * barW + (barW - bw) / 2;
          const bh = (d.monto / maxVal) * chartH;
          const by = PAD_T + chartH - bh;
          const isHov = hoveredBar === i;
          const isToday = i === data.length - 1;
          const fill = isToday ? '#ff6b00' : '#003471';
          return (
            <g key={d.dia}
              onMouseEnter={(e) => {
                onHoverBar(i);
                setTooltipPos({ x: bx + bw/2, y: by - 12 });
              }}
              onMouseLeave={() => onHoverBar(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={bx} y={by} width={bw} height={bh} rx={4}
                fill={isHov ? (isToday ? '#cc5500' : '#0c2444') : fill}
                opacity={hoveredBar !== null && !isHov ? 0.4 : 1}
                style={{ transition: 'height 0.4s ease-out, y 0.4s ease-out, opacity 0.2s' }}
              />
              <text x={bx + bw / 2} y={H - 6} textAnchor="middle"
                fontSize={7.5}
                fill={isToday ? '#ff6b00' : (isHov ? '#003471' : '#5c6b73')}
                fontWeight={isToday || isHov ? 700 : 400}
              >
                {d.dia}
              </text>
            </g>
          );
        })}

        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + chartH} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
      </svg>

      {/* Tooltip Dinámico */}
      {hoveredBar !== null && (
        <div style={{
          position: 'absolute',
          left: `${(tooltipPos.x / W) * 100}%`,
          top: `${(tooltipPos.y / H) * 100}%`,
          transform: 'translate(-50%, -100%)',
          background: '#0c1829',
          color: '#ffffff',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 600,
          pointerEvents: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          zIndex: 10,
          animation: 'fadeInOnly 0.12s ease-out'
        }}>
          <div style={{ fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>
            Día {data[hoveredBar].dia} de Mayo
          </div>
          <div style={{ color: '#ffaa60' }}>
            Facturado: S/ {data[hoveredBar].monto.toLocaleString('es-PE')}
          </div>
          {hoveredBar === data.length - 1 && (
            <div style={{ color: '#ff6b00', fontSize: '0.65rem', fontWeight: 700 }}>Día en progreso</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Line Chart — Ingresos mensuales (Dinámica) ─────────────────── */

function LineChartIngresos({ data, kpiLabel, kpiFormat, kpiColor }) {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const W = 480, H = 190, PAD_L = 56, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;

  const minV = Math.min(...data.map(d => d.monto)) * 0.92;
  const maxV = Math.max(...data.map(d => d.monto)) * 1.08 || 1;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;

  const points = data.map((d, i) => ({ x: px(i), y: py(d.monto), val: d.monto, mes: d.mes }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${px(data.length - 1)},${PAD_T + chartH} L${px(0)},${PAD_T + chartH} Z`;
  const avg = data.reduce((s, d) => s + d.monto, 0) / data.length;

  const yTicks = [
    minV + (maxV - minV) * 0.15,
    minV + (maxV - minV) * 0.5,
    minV + (maxV - minV) * 0.85
  ];

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="ventasLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kpiColor} stopOpacity={0.16} />
            <stop offset="100%" stopColor={kpiColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((t, idx) => {
          const y = py(t);
          return (
            <g key={idx}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
                stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
              <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={8.5} fill="#8397ab">
                {kpiFormat(t)}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#ventasLineGrad)" style={{ transition: 'all 0.4s ease-out' }} />
        <path d={pathD} fill="none" stroke={kpiColor} strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round"
          style={{ transition: 'all 0.4s ease-out' }}
        />

        {/* Avg line */}
        <line x1={PAD_L} x2={W - PAD_R} y1={py(avg)} y2={py(avg)}
          stroke="#ff6b00" strokeWidth={1} strokeDasharray="5 3" opacity={0.6}
          style={{ transition: 'all 0.4s ease-out' }}
        />
        <text x={W - PAD_R + 2} y={py(avg) + 4} fontSize={7.5} fill="#ff6b00">Prom</text>

        {points.map((p, i) => {
          const isHov = hovered === i;
          const isLast = i === data.length - 1;
          return (
            <g key={p.mes}
              onMouseEnter={() => {
                setHovered(i);
                setTooltipPos({ x: p.x, y: p.y - 12 });
              }}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={p.x} cy={p.y} r={isHov ? 7 : (isLast ? 5.5 : 4)}
                fill={isLast ? '#ff6b00' : (isHov ? '#ff6b00' : kpiColor)}
                stroke="#ffffff" strokeWidth={2}
                style={{ transition: 'all 0.15s' }}
              />
            </g>
          );
        })}

        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + chartH} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
      </svg>

      {/* Tooltip Dinámico */}
      {hovered !== null && (
        <div style={{
          position: 'absolute',
          left: `${(tooltipPos.x / W) * 100}%`,
          top: `${(tooltipPos.y / H) * 100}%`,
          transform: 'translate(-50%, -100%)',
          background: '#0c1829',
          color: '#ffffff',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 600,
          pointerEvents: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          zIndex: 10,
          animation: 'fadeInOnly 0.12s ease-out'
        }}>
          <div style={{ fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>
            {data[hovered].mes} — Historial de {kpiLabel}
          </div>
          <div style={{ color: '#ffaa60' }}>
            Valor: {kpiFormat(data[hovered].monto)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Top Productos Table ────────────────────────────────────────── */

function TopProductos({ data }) {
  return (
    <div>
      {data.map((p, i) => (
        <div key={p.nombre} style={{
          display: 'flex', alignItems: 'center', gap: '0.9rem',
          padding: '0.75rem 0',
          borderBottom: i < data.length - 1 ? '1px solid var(--glass-border)' : 'none',
        }}>
          {/* Rank */}
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

          {/* Name + bar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              marginBottom: '0.3rem',
            }}>
              {p.nombre}
            </div>
            <div style={{
              height: 5, borderRadius: 4,
              background: 'var(--hover-bg)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${p.pct}%`,
                background: i === 0
                  ? 'linear-gradient(90deg, #ff6b00, #ffaa60)'
                  : 'linear-gradient(90deg, #003471, #1a5ca8)',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
              S/ {p.monto.toLocaleString('es-PE')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {p.unidades} uds
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */

export default function ResumenVentas() {
  const [selectedChannel, setSelectedChannel] = useState('Todos');
  const [selectedKpi, setSelectedKpi] = useState('ventasMes'); // active kpi for monthly trend
  const [dateRange, setDateRange] = useState('30');
  const [hoveredBar, setHoveredBar] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [dbData, setDbData] = useState(null);

  // Fetch real data from database on mount
  useEffect(() => {
    const fetchDbSummary = async () => {
      try {
        const data = await api.get('/dashboard/resumen/ventas');
        setDbData(data);
      } catch (err) {
        console.error('Error fetching sales summary from DB:', err);
      }
    };
    fetchDbSummary();
  }, []);

  const getBaseKpiValue = (kpiId, defaultValue) => {
    if (!dbData || !dbData.kpis) return defaultValue;
    // Map backend response KPIs to frontend KPIs
    switch (kpiId) {
      case 'ventasMes':
        return dbData.kpis[1]?.value ?? defaultValue;
      case 'ventasDia':
        return Math.round((dbData.kpis[1]?.value ?? defaultValue) / 20);
      case 'ticket':
        return dbData.kpis[2]?.value ?? defaultValue;
      case 'recurrentes':
        return dbData.kpis[3]?.value ?? defaultValue;
      case 'ganancia':
        const rev = dbData.kpis[1]?.value ?? defaultValue;
        return Math.round(Number(rev) * 0.364 / 20);
      case 'productosVendidos':
        const count = dbData.kpis[0]?.value ?? 0;
        return count > 0 ? count * 4 : defaultValue;
      default:
        return defaultValue;
    }
  };

  // Recalcular dinámicamente los KPIs según el canal de venta
  const currentKpis = (() => {
    const baseKpis = KPI_DATA.map(kpi => ({
      ...kpi,
      value: getBaseKpiValue(kpi.id, kpi.value)
    }));

    if (selectedChannel === 'Todos') {
      return baseKpis;
    }

    // Factores de escala para simular canales de venta de forma realista
    let scale = 1;
    let ticketMultiplier = 1;
    let recurrentesMultiplier = 1;
    
    if (selectedChannel === 'POS') {
      scale = 0.52; // POS hace la mitad del volumen
      ticketMultiplier = 0.45; // tickets pequeños
      recurrentesMultiplier = 0.85;
    } else if (selectedChannel === 'Corporativo') {
      scale = 0.38; // Corporativo hace el 38% del volumen
      ticketMultiplier = 2.8; // tickets muy grandes
      recurrentesMultiplier = 0.35;
    } else if (selectedChannel === 'Ecommerce') {
      scale = 0.10; // Ecommerce hace el 10%
      ticketMultiplier = 0.8;
      recurrentesMultiplier = 0.65;
    }

    return baseKpis.map(kpi => {
      let val = kpi.value;
      let valSub = kpi.valueSub;
      
      switch(kpi.id) {
        case 'ventasDia':
          val = Math.round(kpi.value * scale * (0.9 + Math.random() * 0.2));
          valSub = `${(kpi.trend * scale).toFixed(1)}%`;
          break;
        case 'ventasMes':
          val = Math.round(kpi.value * scale);
          valSub = `${(kpi.trend * (0.8 + scale * 0.2)).toFixed(1)}%`;
          break;
        case 'ticket':
          val = Number((kpi.value * ticketMultiplier).toFixed(2));
          valSub = `${(kpi.trend * (ticketMultiplier > 1 ? 1.2 : 0.8)).toFixed(1)}%`;
          break;
        case 'margen':
          val = Number((kpi.value * (selectedChannel === 'Corporativo' ? 0.85 : (selectedChannel === 'POS' ? 1.15 : 1.0))).toFixed(1));
          valSub = `+${(val - 32).toFixed(1)}%`;
          break;
        case 'ganancia':
          const activeMesVal = kpi.value * scale;
          val = Math.round(activeMesVal);
          valSub = `+${(kpi.trend * scale).toFixed(1)}%`;
          break;
        case 'horaPico':
          val = selectedChannel === 'POS' ? '12:00 – 14:00' : (selectedChannel === 'Corporativo' ? '09:00 – 11:00' : '18:00 – 21:00');
          valSub = 'pico del canal';
          break;
        case 'recurrentes':
          val = Math.round(kpi.value * recurrentesMultiplier);
          valSub = `+${(kpi.trend * recurrentesMultiplier).toFixed(1)}%`;
          break;
        case 'productosVendidos':
          val = Math.round(kpi.value * (scale / ticketMultiplier || 0.5));
          valSub = `+${(kpi.trend * scale).toFixed(0)}%`;
          break;
      }

      // Generar sparklines adaptadas dinámicamente
      const seed = selectedChannel.charCodeAt(0);
      const sparkData = kpi.sparkData.map((v, idx) => {
        const factor = 0.92 + Math.sin(idx + seed) * 0.1;
        const baseVal = typeof val === 'number' ? val : 100;
        const baseKpiVal = typeof kpi.value === 'number' ? kpi.value : 100;
        return Math.round((baseVal / baseKpiVal) * v * factor);
      });

      return {
        ...kpi,
        value: val,
        valueSub: valSub,
        sparkData: sparkData
      };
    });
  })();

  // Recalcular la tendencia mensual del KPI seleccionado
  const dynamicLineData = (() => {
    const activeKpi = currentKpis.find(k => k.id === selectedKpi) || currentKpis[1];
    const finalVal = typeof activeKpi.value === 'number' ? activeKpi.value : 100;
    const months = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'];

    return months.map((m, idx) => {
      let factor = 0.80 + (idx * 0.033);
      if (activeKpi.id === 'horaPico') {
        factor = 0.7 + Math.sin(idx) * 0.3; // arbitrario
      }
      
      let val = Math.round(finalVal * factor);
      
      // Si es ventas del mes, usar el patrón original ajustado
      if (activeKpi.id === 'ventasMes') {
        const orig = INGRESOS_MENSUALES[idx]?.monto || finalVal;
        const scaleVal = selectedChannel === 'Todos' ? 1 : (selectedChannel === 'POS' ? 0.52 : (selectedChannel === 'Corporativo' ? 0.38 : 0.10));
        val = Math.round(orig * scaleVal);
      }
      
      return { mes: m, monto: val };
    });
  })();

  // Recalcular el gráfico de barras diario (VENTAS_DIARIAS) en base al canal
  const dynamicDailyData = (() => {
    const scaleVal = selectedChannel === 'Todos' ? 1 : (selectedChannel === 'POS' ? 0.52 : (selectedChannel === 'Corporativo' ? 0.38 : 0.10));
    return VENTAS_DIARIAS.map(d => ({
      ...d,
      monto: Math.round(d.monto * scaleVal * (0.88 + (d.dia.charCodeAt(1) % 4) * 0.05))
    }));
  })();

  // Recalcular el Top 5 de productos más vendidos según el canal
  const dynamicTopProducts = (() => {
    const scaleVal = selectedChannel === 'Todos' ? 1 : (selectedChannel === 'POS' ? 0.45 : (selectedChannel === 'Corporativo' ? 1.6 : 0.75));
    return TOP_PRODUCTOS.map((p, idx) => {
      let finalUnidades = p.unidades;
      let finalMonto = p.monto;
      
      if (selectedChannel === 'POS') {
        // En POS se venden más Cascos y Pernos
        if (p.nombre.includes('Casco') || p.nombre.includes('Perno')) {
          finalUnidades = Math.round(p.unidades * 1.2);
        } else {
          finalUnidades = Math.round(p.unidades * 0.35);
        }
      } else if (selectedChannel === 'Corporativo') {
        // En corporativo se venden grandes lotes de Cemento y Taladros
        if (p.nombre.includes('Cemento') || p.nombre.includes('Taladro')) {
          finalUnidades = Math.round(p.unidades * 2.1);
        } else {
          finalUnidades = Math.round(p.unidades * 0.25);
        }
      }
      
      // Ajustar monto
      finalMonto = Math.round(finalUnidades * (p.monto / p.unidades));

      return {
        ...p,
        unidades: finalUnidades,
        monto: finalMonto
      };
    })
    .sort((a,b) => b.monto - a.monto)
    .map((p, idx, arr) => ({
      ...p,
      pct: Math.round((p.monto / arr[0].monto) * 100)
    }));
  })();

  const activeKpiObj = currentKpis.find(k => k.id === selectedKpi) || currentKpis[1];

  // Simulación de exportación CSV
  const handleExport = () => {
    setExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);

      const headers = 'ID,Metrica,Valor,Subtexto\n';
      const rows = currentKpis.map(k => `"${k.id}","${k.label}","${k.value}","${k.valueSub}"`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_ventas_${selectedChannel.toLowerCase()}_${dateRange}dias.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setExportSuccess(false), 3000);
    }, 1200);
  };

  // Sugerencia dinámica didáctica en base al estado
  const getDynamicInsight = () => {
    if (selectedChannel !== 'Todos') {
      const channelShare = selectedChannel === 'POS' ? '52%' : (selectedChannel === 'Corporativo' ? '38%' : '10%');
      return `Análisis del Canal ${selectedChannel}: Aporta el ${channelShare} del volumen mensual total. El ticket promedio se ubica en S/ ${currentKpis.find(k => k.id === 'ticket')?.value}. ${selectedChannel === 'POS' ? 'Hora pico detectada al mediodía (12:00-14:00). Asegure la dotación del personal de cajas.' : 'Se observa alta concentración de pedidos de Cementos y Aceros; monitoree inventario crítico.'}`;
    }

    switch(selectedKpi) {
      case 'ticket':
        return 'Insight de Clientes: El ticket promedio subió a S/ 426.20. La venta cruzada de brocas y discos al facturar herramientas eléctricas aumentó un 14% comparado con el mes anterior.';
      case 'horaPico':
        return 'Planificación de Personal: Las horas de almuerzo (12:00 – 14:00) concentran el 45% de los cobros en el Punto de Venta. Programe relevos de caja fuera de este rango horario.';
      case 'margen':
        return 'Eficiencia Financiera: Margen comercial estable en 36.4%. El incremento de ventas corporativas (volumen alto, menor margen) se compensa con el excelente desempeño de la tornillería en el POS (margen alto).';
      default:
        return 'Asistente Comercial Ventas: Ventas mensuales acumuladas de S/ 328,400 (+9.8% vs período anterior). Se proyecta cumplir la meta trimestral con 5 días de anticipación.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, fontFamily: "'Outfit', sans-serif" }}>
      <Header
        title="Resumen de Ventas"
        subtitle="KPIs, tendencias e ingresos del período actual"
      />

      {/* Back & Filters Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--accent-gold)', textDecoration: 'none',
          fontSize: '0.82rem', fontWeight: 700,
        }}>
          <ArrowLeft size={14} /> Volver al Dashboard
        </Link>

        {/* BARRA DE FILTROS INTERACTIVOS */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Selector de Canal de Venta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: 8 }}>
            <Filter size={12} color="var(--accent)" />
            <select 
              value={selectedChannel} 
              onChange={(e) => setSelectedChannel(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Todos">Todos los Canales</option>
              <option value="POS">Punto de Venta (POS)</option>
              <option value="Corporativo">Ventas Corporativas</option>
              <option value="Ecommerce">Pedidos Web / E-commerce</option>
            </select>
          </div>

          {/* Selector de Rango Temporal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: 8 }}>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="365">Este año</option>
            </select>
          </div>

          {/* Botón de Exportar con Animación */}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: exportSuccess ? '#4cd137' : 'var(--accent)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s',
              boxShadow: '0 2px 6px rgba(0,52,113,0.1)'
            }}
          >
            {exporting ? (
              <span className="animate-spin" style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
            ) : exportSuccess ? (
              <CheckCircle size={13} />
            ) : (
              <Download size={13} />
            )}
            <span>{exportSuccess ? '¡Exportado!' : 'Exportar CSV'}</span>
          </button>
        </div>
      </div>

      {/* Banner Didáctico e Inteligente */}
      <div style={{
        background: 'linear-gradient(90deg, #f4f8fc 0%, #eef5fc 100%)',
        borderLeft: '4px solid var(--accent)',
        borderRadius: '0 12px 12px 0',
        padding: '0.9rem 1.2rem',
        marginBottom: '1.5rem',
        fontSize: '0.82rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        boxShadow: '0 2px 8px rgba(0,52,113,0.02)',
        animation: 'fadeInOnly 0.3s ease-out'
      }}>
        <div style={{ background: 'var(--accent)', color: '#ffffff', borderRadius: '50%', width: 22, height: 22, display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>i</div>
        <div style={{ flex: 1 }}>{getDynamicInsight()}</div>
        {selectedChannel !== 'Todos' && (
          <button 
            onClick={() => setSelectedChannel('Todos')}
            style={{ background: 'none', border: 'none', color: '#ff6b00', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Quitar Filtro
          </button>
        )}
      </div>

      {/* Section label */}
      <div style={{
        fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        marginBottom: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Panel Métrico Interactivo (Haz clic en una tarjeta para ver su tendencia)</span>
        <span>Canal: {selectedChannel === 'Todos' ? 'Todos los Canales' : selectedChannel}</span>
      </div>

      {/* 8 KPI Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
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

      {/* Gráficos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: '1.5rem',
        marginBottom: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Barras — ventas diarias */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{
                fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
                textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
              }}>
                Ventas Diarias — Mayo
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Ingresos por día (Pasa el cursor por las barras para más detalle)
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#003471', display: 'inline-block' }} />
                Días anteriores
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#ff6b00', display: 'inline-block' }} />
                Hoy
              </span>
            </div>
          </div>
          <BarChartVentas 
            data={dynamicDailyData} 
            hoveredBar={hoveredBar} 
            onHoverBar={setHoveredBar} 
          />
        </div>

        {/* Línea — ingresos mensuales */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
              textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'
            }}>
              Tendencia: {activeKpiObj.label}
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Evolución histórica mensual en el canal
            </p>
          </div>
          <LineChartIngresos 
            data={dynamicLineData} 
            kpiLabel={activeKpiObj.label}
            kpiFormat={activeKpiObj.format}
            kpiColor={ALERT_TOKENS[activeKpiObj.alert].text}
          />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem',
            marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)',
          }}>
            {[
              { label: 'Mín.', value: activeKpiObj.format(Math.min(...dynamicLineData.map(d => d.monto))), color: 'var(--danger)' },
              { label: 'Prom.', value: activeKpiObj.format(Math.round(dynamicLineData.reduce((s,d)=>s+d.monto,0) / dynamicLineData.length)), color: '#ff6b00' },
              { label: 'Máx.', value: activeKpiObj.format(Math.max(...dynamicLineData.map(d => d.monto))), color: 'var(--success)' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--hover-bg)', border: '1px solid var(--glass-border)',
                borderRadius: 10, padding: '0.5rem 0.7rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', fontWeight: 700 }}>{stat.label}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: stat.color, marginTop: '0.1rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Productos */}
      <div className="luxury-card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0,
            }}>
              Top 5 Productos Más Vendidos
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Ranking dinámico de demanda en el canal de venta
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
        <TopProductos data={dynamicTopProducts} />
      </div>
    </div>
  );
}
