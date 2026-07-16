import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { 
  AlertTriangle, CheckCircle2, ChevronRight, Info, Package, RefreshCw, 
  Settings, Truck, Wrench, ShieldCheck, ArrowRight, ShieldAlert
} from 'lucide-react';

export default function Alertas() {
  const [modelos, setModelos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter tabs: 'todos', 'criticos', 'advertencias'
  const [filterTab, setFilterTab] = useState('todos');

  // Shared minStocks state backed by localStorage
  const [minStocks, setMinStocks] = useState({});

  // Success toast/message state when requesting replenishment
  const [toastMessage, setToastMessage] = useState(null);

  // Load models, brands, and categories
  const loadData = async () => {
    try {
      setLoading(true);
      const [modelList, brandList, catList] = await Promise.all([
        api.get('/modelos'),
        api.get('/marcas'),
        api.get('/categorias')
      ]);
      setModelos(modelList);
      setMarcas(brandList);
      setCategorias(catList);
      setError(null);

      // Resolve minimum stocks from localStorage or load defaults
      const storedMins = localStorage.getItem('inventory_min_stocks');
      const initialMins = storedMins ? JSON.parse(storedMins) : {};
      
      modelList.forEach(m => {
        if (!initialMins[m.id]) {
          // Defaults matching reference image: GWS2200 -> 10, GWS750 -> 15, M0900B -> 8, others -> 5
          if (m.modelo === 'GWS2200') initialMins[m.id] = 10;
          else if (m.modelo === 'GWS750') initialMins[m.id] = 15;
          else if (m.modelo === 'M0900B') initialMins[m.id] = 8;
          else initialMins[m.id] = 5;
        }
      });

      setMinStocks(initialMins);
      localStorage.setItem('inventory_min_stocks', JSON.stringify(initialMins));
    } catch (err) {
      console.warn("Backend offline. Loading local simulation models.", err);
      setError("Servidor offline. Usando datos de simulación local.");
      
      const localBrands = [
        { id: 'marca_bosch', nombreMarca: 'Bosch' },
        { id: 'marca_makita', nombreMarca: 'Makita' },
        { id: 'marca_dewalt', nombreMarca: 'DeWalt' }
      ];
      const localCats = [
        { id: 'cat_esm', nombreCategoria: 'Esmeriles' }
      ];
      const localModels = [
        { id: 'pm_gws2200', codigoModelo: 'GWS 22 180 H', modelo: 'GWS2200', sku: 'SKU-75010324', precio: 349.99, stock: 80, categoria: { id: 'cat_esm' }, marca: { id: 'marca_bosch' } },
        { id: 'pm_gws750', codigoModelo: 'GWS 7-115', modelo: 'GWS750', sku: 'SKU-72093104', precio: 199.50, stock: 4, categoria: { id: 'cat_esm' }, marca: { id: 'marca_bosch' } },
        { id: 'pm_m0900b', codigoModelo: 'M0900B 540W', modelo: 'M0900B', sku: 'SKU-84102941', precio: 155.00, stock: 0, categoria: { id: 'cat_esm' }, marca: { id: 'marca_makita' } }
      ];

      setModelos(localModels);
      setMarcas(localBrands);
      setCategorias(localCats);

      const storedMins = localStorage.getItem('inventory_min_stocks');
      const initialMins = storedMins ? JSON.parse(storedMins) : {
        'pm_gws2200': 10,
        'pm_gws750': 15,
        'pm_m0900b': 8
      };
      setMinStocks(initialMins);
      localStorage.setItem('inventory_min_stocks', JSON.stringify(initialMins));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync minStock change with localStorage
  const handleMinStockChange = (modelId, newMin) => {
    const updatedMins = { ...minStocks, [modelId]: newMin };
    setMinStocks(updatedMins);
    localStorage.setItem('inventory_min_stocks', JSON.stringify(updatedMins));
  };

  // Create a replenishment box in Movimientos
  const handleCreateReplenishment = (model, deficit) => {
    try {
      const storedBoxes = localStorage.getItem('inventory_boxes');
      const boxes = storedBoxes ? JSON.parse(storedBoxes) : [];

      // Deficit amount to order (minimum of 10 for a realistic order)
      const qtyToOrder = Math.max(deficit, 10);

      const newBox = {
        id: `box_urgent_${Date.now()}`,
        name: `Reposición Urgente: ${model.modelo}`,
        brandId: model.marca?.id || 'marca_bosch',
        brandName: model.marca?.nombreMarca || 'Bosch',
        status: 'SELLADA',
        origin: 'Alerta de Quiebre/Stock Bajo',
        dateRegistered: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        items: [
          {
            modelId: model.id,
            modelName: model.modelo,
            codModelo: model.codigoModelo,
            qty: qtyToOrder
          }
        ]
      };

      const updatedBoxes = [newBox, ...boxes];
      localStorage.setItem('inventory_boxes', JSON.stringify(updatedBoxes));

      // Show toast message
      setToastMessage({
        text: `¡Solicitud registrada! Se ha creado una caja sellada "${newBox.name}" con +${qtyToOrder} uds en Movimientos.`,
        type: 'success'
      });

      // Clear toast after 5s
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Error creating replenishment box", err);
      alert("No se pudo registrar la reposición en Movimientos.");
    }
  };

  // Compile alerts data
  const alertsList = modelos.map(m => {
    const minStock = minStocks[m.id] || 5;
    const isCritical = m.stock === 0;
    const isWarning = m.stock > 0 && m.stock < minStock;
    const deficit = minStock - m.stock;

    return {
      model: m,
      minStock,
      isCritical,
      isWarning,
      deficit,
      inAlert: isCritical || isWarning
    };
  }).filter(a => a.inAlert);

  // Count totals
  const totalCritical = alertsList.filter(a => a.isCritical).length;
  const totalWarning = alertsList.filter(a => a.isWarning).length;
  const healthPercent = modelos.length > 0 
    ? Math.round(((modelos.length - alertsList.length) / modelos.length) * 100) 
    : 100;

  // Filter alerts by tab
  const filteredAlerts = alertsList.filter(a => {
    if (filterTab === 'criticos') return a.isCritical;
    if (filterTab === 'advertencias') return a.isWarning;
    return true; // 'todos'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
      
      {/* Toast alert indicator */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--accent)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          boxShadow: '0 10px 25px rgba(0, 52, 113, 0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: '600',
          animation: 'floatBox 0.3s ease-out'
        }}>
          <Truck size={18} style={{ color: 'var(--warning)' }} />
          <span>{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.7, cursor: 'pointer', fontWeight: '800', marginLeft: '10px' }}
          >
            x
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <Header 
        title="Alertas de Inventario" 
        subtitle="Supervisión automática de quiebres de stock, reposiciones sugeridas y control de desabastecimiento"
      />

      {error && (
        <div style={{ background: 'rgba(251,197,49,0.08)', border: '1px solid var(--warning)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#d19e07', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1.5rem' }} />
          <p>Cargando alertas de inventario...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* STATS SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.2rem' }}>
            
            {/* Card 1: Critical out of stock */}
            <div className="luxury-card" style={{
              padding: '1.5rem',
              border: totalCritical > 0 ? '1px solid rgba(232, 65, 24, 0.2)' : '1px solid var(--glass-border)',
              background: totalCritical > 0 ? 'linear-gradient(135deg, rgba(232, 65, 24, 0.03) 0%, #ffffff 100%)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: totalCritical > 0 ? 'rgba(232, 65, 24, 0.08)' : 'rgba(0,0,0,0.03)',
                  color: totalCritical > 0 ? 'var(--danger)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: totalCritical > 0 ? '1px solid rgba(232, 65, 24, 0.15)' : '1px solid var(--glass-border)'
                }}>
                  <ShieldAlert size={22} style={{ animation: totalCritical > 0 ? 'pulse 1.5s infinite' : 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Quiebres de Stock
                  </span>
                  <strong style={{ fontSize: '1.4rem', color: totalCritical > 0 ? 'var(--danger)' : 'var(--text-primary)', fontWeight: '800' }}>
                    {totalCritical} {totalCritical === 1 ? 'Modelo' : 'Modelos'}
                  </strong>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: totalCritical > 0 ? 'var(--danger)' : 'var(--text-muted)', color: '#ffffff', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                CRÍTICO
              </span>
            </div>

            {/* Card 2: Warning low stock */}
            <div className="luxury-card" style={{
              padding: '1.5rem',
              border: totalWarning > 0 ? '1px solid rgba(251, 197, 49, 0.3)' : '1px solid var(--glass-border)',
              background: totalWarning > 0 ? 'linear-gradient(135deg, rgba(251, 197, 49, 0.03) 0%, #ffffff 100%)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: totalWarning > 0 ? 'rgba(251, 197, 49, 0.08)' : 'rgba(0,0,0,0.03)',
                  color: totalWarning > 0 ? 'var(--warning)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: totalWarning > 0 ? '1px solid rgba(251, 197, 49, 0.15)' : '1px solid var(--glass-border)'
                }}>
                  <AlertTriangle size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Stock Bajo
                  </span>
                  <strong style={{ fontSize: '1.4rem', color: totalWarning > 0 ? '#d19e07' : 'var(--text-primary)', fontWeight: '800' }}>
                    {totalWarning} {totalWarning === 1 ? 'Modelo' : 'Modelos'}
                  </strong>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: totalWarning > 0 ? 'var(--warning)' : 'var(--text-muted)', color: 'var(--text-primary)', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                ADVERTENCIA
              </span>
            </div>

            {/* Card 3: Storage health ratio */}
            <div className="luxury-card" style={{
              padding: '1.5rem',
              border: healthPercent === 100 ? '1px solid rgba(76, 209, 55, 0.2)' : '1px solid var(--glass-border)',
              background: healthPercent === 100 ? 'linear-gradient(135deg, rgba(76, 209, 55, 0.03) 0%, #ffffff 100%)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(76, 209, 55, 0.08)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(76, 209, 55, 0.15)'
                }}>
                  <ShieldCheck size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Salud de Almacén
                  </span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                    {healthPercent}% óptimo
                  </strong>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: 'var(--success)', color: '#ffffff', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                SALUDABLE
              </span>
            </div>

          </div>

          {/* MAIN ALERTS TABLE BOX */}
          <div className="luxury-card" style={{ padding: '1.5rem' }}>
            
            {/* Table Filters header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => setFilterTab('todos')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: filterTab === 'todos' ? 'var(--accent)' : '#ffffff',
                    color: filterTab === 'todos' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Todas las Alertas ({alertsList.length})
                </button>
                <button 
                  onClick={() => setFilterTab('criticos')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: filterTab === 'criticos' ? 'var(--danger)' : '#ffffff',
                    color: filterTab === 'criticos' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Quiebres Críticos ({totalCritical})
                </button>
                <button 
                  onClick={() => setFilterTab('advertencias')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: filterTab === 'advertencias' ? 'var(--warning)' : '#ffffff',
                    color: filterTab === 'advertencias' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Bajo Stock ({totalWarning})
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Mostrando {filteredAlerts.length} de {alertsList.length} alertas detectadas
              </span>
            </div>

            {/* TABLE DISPLAY */}
            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <CheckCircle2 size={46} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {filterTab === 'todos' ? '¡Almacén en perfecto estado!' : 'No hay alertas en esta sección.'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem', maxWidth: '380px', margin: '0.3rem auto 0 auto' }}>
                  Todos los productos modelos de la ferretería cuentan con existencias físicas por encima de su límite mínimo configurado.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: '12px', background: '#ffffff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', minWidth: '850px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0, 52, 113, 0.01)', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '0.9rem 1.2rem', width: '130px' }}>Severidad</th>
                      <th style={{ padding: '0.9rem 1.2rem' }}>Producto Modelo</th>
                      <th style={{ padding: '0.9rem 1.2rem', width: '160px' }}>Código Técnico</th>
                      <th style={{ padding: '0.9rem 1.2rem', width: '140px' }}>SKU / ID</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'center', width: '100px' }}>Marca</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'center', width: '90px' }}>Stock Actual</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'center', width: '100px' }}>Stock Mínimo</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'center', width: '90px' }}>Déficit</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'center', width: '150px' }}>Acción Sugerida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map(({ model, minStock, isCritical, isWarning, deficit }) => {
                      return (
                        <tr 
                          key={model.id} 
                          style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 86, 179, 0.01)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Column 1: Severity Badge */}
                          <td style={{ padding: '0.8rem 1.2rem' }}>
                            {isCritical ? (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                color: 'var(--danger)',
                                background: 'rgba(232, 65, 24, 0.06)',
                                border: '1px solid rgba(232, 65, 24, 0.25)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                letterSpacing: '0.3px'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--danger)', display: 'inline-block', animation: 'pulse 1s infinite' }}></span>
                                CRÍTICO
                              </span>
                            ) : (
                              <span style={{
                                fontSize: '0.68rem',
                                fontWeight: '800',
                                color: '#d19e07',
                                background: 'rgba(251, 197, 49, 0.06)',
                                border: '1px solid rgba(251, 197, 49, 0.25)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                letterSpacing: '0.3px'
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--warning)', display: 'inline-block' }}></span>
                                STOCK BAJO
                              </span>
                            )}
                          </td>

                          {/* Column 2: Product Name & Category */}
                          <td style={{ padding: '0.8rem 1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{model.categoria?.nombreCategoria?.toUpperCase()} {model.modelo}</span>
                            </div>
                          </td>

                          {/* Column 3: Technical Code */}
                          <td style={{ padding: '0.8rem 1.2rem', color: 'var(--text-secondary)' }}>
                            {model.codigoModelo}
                          </td>

                          {/* Column 4: SKU */}
                          <td style={{ padding: '0.8rem 1.2rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {model.sku}
                          </td>

                          {/* Column 5: Brand */}
                          <td style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              color: 'var(--text-primary)',
                              background: 'rgba(0,0,0,0.03)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--glass-border)'
                            }}>
                              {model.marca?.nombreMarca?.toUpperCase()}
                            </span>
                          </td>

                          {/* Column 6: Current Stock */}
                          <td style={{ padding: '0.8rem 1.2rem', textAlign: 'center', fontWeight: '800', fontSize: '0.9rem', color: isCritical ? 'var(--danger)' : '#ffa500' }}>
                            {model.stock} uds
                          </td>

                          {/* Column 7: Editable Minimum Stock Input */}
                          <td style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>
                            <input 
                              type="number" 
                              style={{
                                width: '55px',
                                padding: '4px 6px',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                background: 'rgba(0,0,0,0.01)'
                              }}
                              value={minStock}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                handleMinStockChange(model.id, val);
                              }}
                            />
                          </td>

                          {/* Column 8: Deficit (Faltante) */}
                          <td style={{ padding: '0.8rem 1.2rem', textAlign: 'center', fontWeight: '800', color: 'var(--danger)', fontSize: '0.88rem' }}>
                            -{deficit} uds
                          </td>

                          {/* Column 9: Suggest Action Button */}
                          <td style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleCreateReplenishment(model, deficit)}
                              className="btn"
                              style={{
                                background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '0.72rem',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(255, 107, 0, 0.15)'
                              }}
                            >
                              <Truck size={12} /> Reponer Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
