import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  Package, DollarSign, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown, ArrowLeft,
  PackageCheck, BarChart2, Archive, Filter, Download, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

/* ─── Datos base de la aplicación (los mismos originales) ─────────── */

const KPI_DATA = [
  {
    id: 'registrados',
    label: 'Productos Registrados',
    value: 842,
    valueSub: '736 activos',
    trend: +4.2,
    alert: 'green',
    icon: Package,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [30,28,35,32,40,38,45,42,50,48,55,60],
  },
  {
    id: 'stock',
    label: 'Stock Disponible',
    value: 18940,
    valueSub: 'unidades',
    trend: +8.3,
    alert: 'green',
    icon: PackageCheck,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [60,55,62,58,65,70,68,72,75,80,78,85],
  },
  {
    id: 'valor',
    label: 'Valor Inventario',
    value: 1120000,
    valueSub: 'al costo',
    trend: +5.1,
    alert: 'green',
    icon: DollarSign,
    format: (v) => v >= 1000000
      ? 'S/ ' + (v / 1000000).toFixed(2) + 'M'
      : 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [70,72,68,75,80,78,85,82,88,90,87,92],
  },
  {
    id: 'agotados',
    label: 'Productos Agotados',
    value: 14,
    valueSub: 'reponer',
    trend: +16.7,
    alert: 'red',
    icon: AlertTriangle,
    format: (v) => v.toString(),
    sparkData: [8,10,9,11,10,12,11,13,12,14,13,14],
  },
  {
    id: 'bajostock',
    label: 'Bajo Stock',
    value: 19,
    valueSub: 'atención',
    trend: +11.8,
    alert: 'yellow',
    icon: AlertTriangle,
    format: (v) => v.toString(),
    sparkData: [12,14,13,15,14,16,15,17,16,18,17,19],
  },
  {
    id: 'rotacion',
    label: 'Rotación Inventario',
    value: 74,
    valueSub: '+6% período',
    trend: +6,
    alert: 'green',
    icon: RefreshCw,
    format: (v) => v + '%',
    sparkData: [58,60,62,64,63,66,65,68,67,70,72,74],
  },
  {
    id: 'movidos',
    label: 'Más Movidos',
    value: 326,
    valueSub: 'variantes',
    trend: +9.4,
    alert: 'green',
    icon: BarChart2,
    format: (v) => v.toLocaleString('es-PE'),
    sparkData: [250,260,255,270,265,280,275,290,285,300,310,326],
  },
  {
    id: 'obsoletos',
    label: 'Inactivos u Obsoletos',
    value: 86400,
    valueSub: '+90 días',
    trend: -3.2,
    alert: 'yellow',
    icon: Archive,
    format: (v) => 'S/ ' + v.toLocaleString('es-PE'),
    sparkData: [92,90,88,89,87,86,88,85,84,86,85,86],
  },
];

const STOCK_BY_CATEGORY = [
  { category: 'Herramientas', stock: 4920, color: '#003471' },
  { category: 'Materiales',   stock: 5240, color: '#ff6b00' },
  { category: 'Tornillería',  stock: 2680, color: '#4cd137' },
  { category: 'Eléctrico',    stock: 3410, color: '#fbc531' },
  { category: 'Seguridad',    stock: 1310, color: '#00b8d4' },
  { category: 'Pinturas',     stock: 975,  color: '#9c27b0' },
  { category: 'Adhesivos',    stock: 405,  color: '#e84118' },
];

const ROTATION_MONTHLY = [
  { mes: 'Nov', valor: 62 },
  { mes: 'Dic', valor: 68 },
  { mes: 'Ene', valor: 65 },
  { mes: 'Feb', valor: 70 },
  { mes: 'Mar', valor: 72 },
  { mes: 'Abr', valor: 69 },
  { mes: 'May', valor: 74 },
];

const ALERT_TOKENS = {
  green:  { bg: 'rgba(76,209,55,0.07)',   border: 'rgba(76,209,55,0.22)',  text: '#2fb01e', label: 'Normal'   },
  yellow: { bg: 'rgba(251,197,49,0.07)',  border: 'rgba(251,197,49,0.28)', text: '#d19e07', label: 'Atención' },
  red:    { bg: 'rgba(232,65,24,0.07)',   border: 'rgba(232,65,24,0.25)',  text: '#e84118', label: 'Crítico'  },
};

const BAD_KPIS = ['agotados', 'bajostock', 'obsoletos'];

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
  const uid = color.replace(/[^a-z0-9]/gi, '') + data.slice(0,3).join('');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 88, height: 32, display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={`spk-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spk-${uid})`} />
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
  const isBad = BAD_KPIS.includes(kpi.id);
  const up = kpi.trend >= 0;
  const trendColor = isBad
    ? (up ? 'var(--danger)' : 'var(--success)')
    : (up ? 'var(--success)' : 'var(--danger)');

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
        fontSize: '1.9rem', fontWeight: 800,
        color: tok.text, lineHeight: 1.1, margin: '0.5rem 0 0.15rem',
      }}>
        {kpi.format(kpi.value)}
      </div>

      {/* Sub label */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.7rem' }}>
        {kpi.valueSub}
      </div>

      {/* Trend + sparkline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.72rem', fontWeight: 700, color: trendColor,
            background: isSelected ? '#ffffff' : `${trendColor}14`,
            border: `1px solid ${trendColor}30`,
            borderRadius: 20, padding: '2px 9px',
          }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {up ? '+' : ''}{kpi.trend.toFixed(1)}%
          </span>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            vs mes anterior
          </div>
        </div>
        <Sparkline data={kpi.sparkData} color={tok.text} />
      </div>
    </div>
  );
}

/* ─── Bar Chart SVG (Dinámica) ────────────────────────────────────── */

function BarChart({ data, selectedCategory, onSelectCategory }) {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const W = 540, H = 210, PAD_L = 52, PAD_B = 36, PAD_T = 16, PAD_R = 12;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;
  const maxVal = Math.max(...data.map(d => d.stock));
  const barW = chartW / data.length;
  const yTicks = [0, 1500, 3000, 4500];

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
                fontSize={9} fill="#8397ab">{t >= 1000 ? (t / 1000) + 'k' : t}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const bw = barW * 0.68;
          const bx = PAD_L + i * barW + (barW - bw) / 2;
          const bh = (d.stock / maxVal) * chartH;
          const by = PAD_T + chartH - bh;
          const isHov = hovered === i;
          
          // Categoría seleccionada por el filtro principal
          const isSelected = selectedCategory === d.category || selectedCategory === 'Todas';
          const opacityVal = isSelected ? (hovered !== null && !isHov ? 0.6 : 1) : 0.25;

          return (
            <g key={d.category}
              onMouseEnter={(e) => {
                setHovered(i);
                // Calcular posición del tooltip en base al SVG
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltipPos({ x: bx + bw/2, y: by - 12 });
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectCategory(d.category === selectedCategory ? 'Todas' : d.category)}
              style={{ cursor: 'pointer' }}
            >
              {/* Barra */}
              <rect x={bx} y={by} width={bw} height={bh} rx={5}
                fill={isHov ? '#0c2444' : d.color}
                opacity={opacityVal}
                style={{ transition: 'height 0.4s ease-out, y 0.4s ease-out, opacity 0.3s' }}
              />
              
              {/* Contorno para indicar selección individual activa */}
              {selectedCategory === d.category && (
                <rect x={bx - 2} y={by - 2} width={bw + 4} height={bh + 4} rx={7}
                  fill="none" stroke={d.color} strokeWidth={2}
                  style={{ transition: 'height 0.4s ease-out, y 0.4s ease-out' }}
                />
              )}

              {/* Nombre de la Categoría */}
              <text x={bx + bw / 2} y={H - 6} textAnchor="middle"
                fontSize={8.5}
                fill={selectedCategory === d.category ? 'var(--accent)' : '#5c6b73'}
                fontWeight={selectedCategory === d.category || isHov ? 700 : 400}
                style={{ transition: 'fill 0.2s' }}
              >
                {d.category.length > 9 ? d.category.slice(0, 8) + '…' : d.category}
              </text>
            </g>
          );
        })}
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + chartH} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
      </svg>

      {/* Tooltip Dinámico HTML */}
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
          animation: 'fadeInOnly 0.15s ease-out'
        }}>
          <div style={{ fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>
            {data[hovered].category}
          </div>
          <div>Stock: {data[hovered].stock.toLocaleString('es-PE')} uds</div>
          <div style={{ color: '#4cd137', fontSize: '0.65rem' }}>
            {((data[hovered].stock / data.reduce((s,d)=>s+d.stock,0)) * 100).toFixed(1)}% del total
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Line Chart SVG (Dinámica e Interactiva) ───────────────────────── */

function LineChart({ data, kpiLabel, kpiFormat, kpiColor }) {
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const W = 500, H = 190, PAD_L = 48, PAD_B = 32, PAD_T = 20, PAD_R = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_B - PAD_T;

  const minV = Math.min(...data.map(d => d.valor)) * 0.9;
  const maxV = Math.max(...data.map(d => d.valor)) * 1.1 || 1;

  const px = (i) => PAD_L + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
  
  const points = data.map((d, i) => ({ x: px(i), y: py(d.valor), val: d.valor, mes: d.mes }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${px(data.length - 1)},${PAD_T + chartH} L${px(0)},${PAD_T + chartH} Z`;
  const avg = data.reduce((s, d) => s + d.valor, 0) / data.length;

  const yTicks = [
    minV + (maxV - minV) * 0.1,
    minV + (maxV - minV) * 0.5,
    minV + (maxV - minV) * 0.9
  ];

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kpiColor} stopOpacity={0.16} />
            <stop offset="100%" stopColor={kpiColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        
        {/* Ticks en eje Y */}
        {yTicks.map((t, idx) => {
          const y = py(t);
          return (
            <g key={idx}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y}
                stroke="#cbd5e1" strokeWidth={0.8} strokeDasharray="4 4" />
              <text x={PAD_L - 6} y={y + 4} textAnchor="end" fontSize={8} fill="#8397ab">
                {kpiFormat(t)}
              </text>
            </g>
          );
        })}

        {/* Área sombreada */}
        <path d={areaD} fill="url(#lineGrad)" style={{ transition: 'all 0.4s ease-out' }} />
        
        {/* Línea principal */}
        <path d={pathD} fill="none" stroke={kpiColor} strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round"
          style={{ transition: 'all 0.4s ease-out' }}
        />
        
        {/* Línea promedio */}
        <line x1={PAD_L} x2={W - PAD_R} y1={py(avg)} y2={py(avg)}
          stroke="#ff6b00" strokeWidth={1} strokeDasharray="5 3" opacity={0.6}
          style={{ transition: 'all 0.4s ease-out' }}
        />
        <text x={W - PAD_R + 2} y={py(avg) + 3} fontSize={8} fill="#ff6b00">Prom</text>

        {/* Puntos Interactivos */}
        {points.map((p, i) => {
          const isHov = hovered === i;
          return (
            <g key={p.mes}
              onMouseEnter={() => {
                setHovered(i);
                setTooltipPos({ x: p.x, y: p.y - 12 });
              }}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={p.x} cy={p.y} r={isHov ? 7 : 4.5}
                fill={isHov ? '#ff6b00' : kpiColor}
                stroke="#ffffff" strokeWidth={2}
                style={{ transition: 'all 0.15s', outline: 'none' }}
              />
              <text x={p.x} y={H - 6} textAnchor="middle" fontSize={9}
                fill={isHov ? '#003471' : '#5c6b73'}
                fontWeight={isHov ? 700 : 400}
              >
                {p.mes}
              </text>
            </g>
          );
        })}
        <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + chartH} y2={PAD_T + chartH} stroke="#cbd5e1" strokeWidth={1} />
      </svg>

      {/* Tooltip Dinámico HTML */}
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
          animation: 'fadeInOnly 0.15s ease-out'
        }}>
          <div style={{ fontSize: '0.62rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '2px' }}>
            {data[hovered].mes} — Tendencia de {kpiLabel}
          </div>
          <div style={{ color: '#ffaa60' }}>
            Valor: {kpiFormat(data[hovered].valor)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */

export default function ResumenInventario() {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedKpi, setSelectedKpi] = useState('rotacion'); // default active kpi chart
  const [dateRange, setDateRange] = useState('30'); // default 30 days
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [dbData, setDbData] = useState(null);

  // Fetch real data from database on mount
  useEffect(() => {
    const fetchDbSummary = async () => {
      try {
        const data = await api.get('/dashboard/resumen/inventario');
        setDbData(data);
      } catch (err) {
        console.error('Error fetching inventory summary from DB:', err);
      }
    };
    fetchDbSummary();
  }, []);

  const getBaseKpiValue = (kpiId, defaultValue) => {
    if (!dbData || !dbData.kpis) return defaultValue;
    // Map backend response KPIs to frontend KPIs
    switch (kpiId) {
      case 'registrados':
        return dbData.kpis[0]?.value ?? defaultValue;
      case 'bajostock':
        return dbData.kpis[1]?.value ?? defaultValue;
      case 'valor':
        return dbData.kpis[2]?.value ?? defaultValue;
      case 'movidos':
        return dbData.kpis[3]?.value ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  // Recalcular dinámicamente los KPIs en base a la categoría seleccionada
  const currentKpis = (() => {
    const baseKpis = KPI_DATA.map(kpi => ({
      ...kpi,
      value: getBaseKpiValue(kpi.id, kpi.value)
    }));

    if (selectedCategory === 'Todas') {
      return baseKpis;
    }
    
    const catInfo = STOCK_BY_CATEGORY.find(c => c.category === selectedCategory);
    if (!catInfo) return baseKpis;
    
    const totalStock = STOCK_BY_CATEGORY.reduce((sum, c) => sum + c.stock, 0);
    const scale = catInfo.stock / totalStock;
    
    return baseKpis.map(kpi => {
      let val = kpi.value;
      let valSub = kpi.valueSub;
      let trend = kpi.trend;
      
      switch(kpi.id) {
        case 'registrados':
          val = Math.round(kpi.value * (0.12 + scale * 0.65));
          valSub = `${Math.round(val * 0.88)} activos`;
          break;
        case 'stock':
          val = catInfo.stock;
          valSub = 'unidades';
          break;
        case 'valor':
          val = Math.round(kpi.value * (0.08 + scale * 0.82));
          break;
        case 'agotados':
          val = Math.round((selectedCategory.length % 3) + 1);
          valSub = 'reponer';
          break;
        case 'bajostock':
          val = Math.round((selectedCategory.length % 4) + 2);
          valSub = 'atención';
          break;
        case 'rotacion':
          val = Math.round(60 + (selectedCategory.charCodeAt(0) % 20));
          valSub = `${val > 70 ? '+' : ''}${Math.round(val - 70)}% período`;
          break;
        case 'movidos':
          val = Math.round(kpi.value * (0.15 + scale * 0.55));
          break;
        case 'obsoletos':
          val = Math.round(kpi.value * (0.05 + scale * 0.35));
          break;
      }
      
      // Ajustar sparklines de forma coherente
      const seed = selectedCategory.charCodeAt(0);
      const sparkData = kpi.sparkData.map((v, idx) => {
        const factor = 0.9 + Math.sin(idx + seed) * 0.12;
        return Math.round((val / kpi.value) * v * factor);
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
    const activeKpi = currentKpis.find(k => k.id === selectedKpi) || currentKpis.find(k => k.id === 'rotacion');
    const finalVal = activeKpi.value;
    const months = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'];
    
    return months.map((m, idx) => {
      let factor = 0.82 + (idx * 0.03);
      if (activeKpi.id === 'obsoletos') factor = 1.18 - (idx * 0.03);
      
      let val = Math.round(finalVal * factor);
      if (activeKpi.id === 'rotacion') {
        const orig = ROTATION_MONTHLY[idx]?.valor || finalVal;
        val = Math.round(orig * (selectedCategory === 'Todas' ? 1 : 0.8 + (selectedCategory.charCodeAt(0)%5)*0.08));
      }
      return { mes: m, valor: val };
    });
  })();

  const activeKpiObj = currentKpis.find(k => k.id === selectedKpi) || currentKpis[5];

  // Simulación de exportación CSV
  const handleExport = () => {
    setExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
      
      // Crear contenido CSV simulado
      const headers = 'ID,Metrica,Valor,Subtexto\n';
      const rows = currentKpis.map(k => `"${k.id}","${k.label}","${k.value}","${k.valueSub}"`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_inventario_${selectedCategory.toLowerCase()}_${dateRange}dias.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setExportSuccess(false), 3000);
    }, 1200);
  };

  // Sugerencia dinámica didáctica en base al estado
  const getDynamicInsight = () => {
    if (selectedCategory !== 'Todas') {
      const catVal = STOCK_BY_CATEGORY.find(c => c.category === selectedCategory);
      return `Análisis de ${selectedCategory}: Representa el ${((catVal?.stock / 18940) * 100).toFixed(0)}% del stock físico total. El índice de rotación de esta categoría se mantiene en ${currentKpis.find(k => k.id === 'rotacion')?.value}%, lo cual indica un flujo comercial ${currentKpis.find(k => k.id === 'rotacion')?.value > 70 ? 'óptimo y constante.' : 'moderado; considere ajustar mínimos de recompra.'}`;
    }
    
    switch(selectedKpi) {
      case 'agotados':
        return 'Alerta de Quiebre de Stock: Hay 14 productos en desabastecimiento total. Esto genera una tasa de pérdida de facturación del 3.5% semanal. Se recomienda emitir órdenes de compra inmediatas.';
      case 'valor':
        return 'Estudio de Capital: El valor total del inventario es S/ 1.12M al costo. El 42% del capital se encuentra concentrado en la categoría Materiales. Mantenga vigilancia sobre productos con baja rotación.';
      case 'obsoletos':
        return 'Advertencia de Obsolescencia: S/ 86,400 en mercancía inactiva por más de 90 días. Se aconseja iniciar promociones o liquidaciones cruzadas con herramientas de alta velocidad.';
      default:
        return 'Asistente Comercial: El inventario global se encuentra en estado saludable. La rotación promedio de este mes subió un 6% impulsada por la fuerte demanda de Herramientas y Materiales de construcción.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, fontFamily: "'Outfit', sans-serif" }}>
      <Header
        title="Resumen de Inventario"
        subtitle="KPIs, tendencias y distribución de stock por categoría"
      />

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
          
          {/* Selector de Categoría */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', border: '1px solid var(--glass-border)', padding: '4px 10px', borderRadius: 8 }}>
            <Filter size={12} color="var(--accent)" />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="Todas">Todas las Categorías</option>
              {STOCK_BY_CATEGORY.map(c => (
                <option key={c.category} value={c.category}>{c.category}</option>
              ))}
            </select>
          </div>

          {/* Rango Temporal */}
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
        {selectedCategory !== 'Todas' && (
          <button 
            onClick={() => setSelectedCategory('Todas')}
            style={{ background: 'none', border: 'none', color: '#ff6b00', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Quitar Filtro
          </button>
        )}
      </div>

      <div style={{
        fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        marginBottom: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Panel Métrico Interactiva (Haz clic en una tarjeta para ver su tendencia)</span>
        <span>Mostrando: {selectedCategory === 'Todas' ? 'Todo' : selectedCategory}</span>
      </div>

      {/* 8 KPI Cards — 4 por fila */}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Barras: Stock por Categoría */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>
                Stock por Categoría
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {selectedCategory === 'Todas' ? 'Haz clic en una barra para filtrar el panel' : `Mostrando detalle para ${selectedCategory}`}
              </p>
            </div>
            <span style={{
              background: 'rgba(0,52,113,0.07)', border: '1px solid rgba(0,52,113,0.15)',
              borderRadius: 20, padding: '3px 12px', fontSize: '0.7rem',
              fontWeight: 700, color: 'var(--accent)',
            }}>
              {STOCK_BY_CATEGORY.reduce((s, d) => s + (selectedCategory === 'Todas' || selectedCategory === d.category ? d.stock : 0), 0).toLocaleString('es-PE')} uds
            </span>
          </div>
          
          <BarChart 
            data={STOCK_BY_CATEGORY} 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory}
          />
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.1rem', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
            {STOCK_BY_CATEGORY.map(d => (
              <div 
                key={d.category} 
                onClick={() => setSelectedCategory(d.category === selectedCategory ? 'Todas' : d.category)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.72rem', 
                  color: selectedCategory === d.category ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === d.category ? 700 : 400,
                  opacity: selectedCategory === 'Todas' || selectedCategory === d.category ? 1 : 0.4,
                  transition: 'opacity 0.2s'
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }} />
                {d.category}
              </div>
            ))}
          </div>
        </div>

        {/* Líneas: Historial del KPI seleccionado */}
        <div className="luxury-card" style={{ marginBottom: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              Tendencia: {activeKpiObj.label}
            </h2>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Historial mensual ({selectedCategory === 'Todas' ? 'General' : selectedCategory})
            </p>
          </div>
          
          <LineChart 
            data={dynamicLineData} 
            kpiLabel={activeKpiObj.label}
            kpiFormat={activeKpiObj.format}
            kpiColor={ALERT_TOKENS[activeKpiObj.alert].text}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.7rem', marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--glass-border)' }}>
            {[
              { label: 'Mín.', value: activeKpiObj.format(Math.min(...dynamicLineData.map(d => d.valor))), color: 'var(--danger)' },
              { label: 'Prom.', value: activeKpiObj.format(Math.round(dynamicLineData.reduce((s,d)=>s+d.valor,0)/dynamicLineData.length)), color: '#ff6b00' },
              { label: 'Máx.', value: activeKpiObj.format(Math.max(...dynamicLineData.map(d => d.valor))), color: 'var(--success)' },
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
    </div>
  );
}
