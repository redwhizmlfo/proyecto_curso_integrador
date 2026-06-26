import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { 
  Search, RefreshCw, ChevronRight, ChevronDown, Tag, 
  Info, Package, Folder, FolderOpen, Clock, Link, Check, AlertTriangle
} from 'lucide-react';

export default function StockEnVivo() {
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [productosModelos, setProductosModelos] = useState([]);
  
  // Tree collapse state
  const [expandedCategories, setExpandedCategories] = useState({ cat_esm: true }); // Open Esmeriles by default
  const [expandedBrands, setExpandedBrands] = useState({});

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local state for stock minimum values since it's a display/warning threshold
  const [minStocks, setMinStocks] = useState({});
  // Local state for last update timestamps
  const [lastUpdates, setLastUpdates] = useState({});

  const loadStockData = async () => {
    try {
      setLoading(true);
      const [catList, brandList, modelList] = await Promise.all([
        api.get('/categorias'),
        api.get('/marcas'),
        api.get('/modelos')
      ]);
      setCategorias(catList);
      setMarcas(brandList);
      setProductosModelos(modelList);
      setError(null);

      // Initialize default minimum stocks and timestamps if not present
      const initialMins = {};
      const initialTimes = {};
      const todayDate = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const todayTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });

      modelList.forEach(m => {
        // Sensible defaults matching the reference image: GWS2200 -> 10, GWS750 -> 15
        if (m.modelo === 'GWS2200') initialMins[m.id] = 10;
        else if (m.modelo === 'GWS750') initialMins[m.id] = 15;
        else initialMins[m.id] = 5;

        initialTimes[m.id] = { date: todayDate, time: todayTime };
      });

      setMinStocks(prev => ({ ...initialMins, ...prev }));
      setLastUpdates(prev => ({ ...initialTimes, ...prev }));
    } catch (err) {
      console.warn("Backend offline or error loading stock data. Using local demo data.", err);
      setError("Servidor offline. Utilizando datos de simulación en vivo.");

      const localCats = [
        { id: 'cat_esm', nombreCategoria: 'Esmeriles' },
        { id: 'cat_tal', nombreCategoria: 'Taladros' }
      ];
      const localBrands = [
        { id: 'marca_bosch', nombreMarca: 'Bosch' },
        { id: 'marca_makita', nombreMarca: 'Makita' },
        { id: 'marca_dewalt', nombreMarca: 'DeWalt' }
      ];
      const localModels = [
        { id: 'pm_gws2200', codigoModelo: 'GWS 2200-180 LVI', modelo: 'GWS2200', sku: 'SKU-75010324', precio: 380.00, stock: 80, categoria: { id: 'cat_esm' }, marca: { id: 'marca_bosch' } },
        { id: 'pm_gws750', codigoModelo: 'GWS 750-115 PROFESSIONAL', modelo: 'GWS750', sku: 'SKU-72093104', precio: 195.00, stock: 45, categoria: { id: 'cat_esm' }, marca: { id: 'marca_bosch' } },
        { id: 'pm_m0900b', codigoModelo: 'M0900B 540W', modelo: 'M0900B', sku: 'SKU-84102941', precio: 155.00, stock: 30, categoria: { id: 'cat_esm' }, marca: { id: 'marca_makita' } }
      ];

      setCategorias(localCats);
      setMarcas(localBrands);
      setProductosModelos(localModels);

      const initialMins = {
        'pm_gws2200': 10,
        'pm_gws750': 15,
        'pm_m0900b': 8
      };
      const initialTimes = {};
      const todayDate = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const todayTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
      localModels.forEach(m => {
        initialTimes[m.id] = { date: todayDate, time: todayTime };
      });

      setMinStocks(prev => ({ ...initialMins, ...prev }));
      setLastUpdates(prev => ({ ...initialTimes, ...prev }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockData();
  }, []);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleBrand = (key) => {
    setExpandedBrands(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle live stock increment or decrement
  const handleStockChange = async (model, change) => {
    const newStock = model.stock + change;
    if (newStock < 0) return;

    // Dynamically update timestamp for this item
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

    // 1. Instantly update UI locally
    setProductosModelos(prev => prev.map(m => m.id === model.id ? { ...m, stock: newStock } : m));
    setLastUpdates(prev => ({
      ...prev,
      [model.id]: { date: formattedDate, time: formattedTime }
    }));

    // 2. Try to sync to the server if online
    if (!error) {
      try {
        await api.put(`/modelos/${model.id}`, {
          codigoModelo: model.codigoModelo,
          modelo: model.modelo,
          sku: model.sku,
          precio: model.precio,
          stock: newStock,
          id_categoria: model.categoria?.id,
          id_marca: model.marca?.id
        });
      } catch (err) {
        console.error("Error updating stock in backend", err);
        alert("No se pudo sincronizar el stock con el servidor: " + err.message);
      }
    }
  };

  // Helper to generate custom stock codes like: STK-GWS2200 and sub-code BSH-GWS-2200
  const getBrandShort = (brandName) => {
    if (!brandName) return 'GEN';
    const name = brandName.toUpperCase();
    if (name.includes('BOSCH')) return 'BSH';
    if (name.includes('MAKITA')) return 'MKT';
    if (name.includes('DEWALT')) return 'DWL';
    return name.substring(0, 3);
  };

  const formatModelCode = (modelName) => {
    if (!modelName) return '';
    // Inserts a dash between letters and digits if not present (e.g. GWS2200 -> GWS-2200)
    return modelName.replace(/([a-zA-Z]+)(\d+)/, '$1-$2');
  };

  // Filter models based on search query
  const filteredModels = productosModelos.filter(m => 
    m.modelo?.toLowerCase().includes(search.toLowerCase()) ||
    m.codigoModelo?.toLowerCase().includes(search.toLowerCase()) ||
    m.sku?.toLowerCase().includes(search.toLowerCase()) ||
    m.categoria?.nombreCategoria?.toLowerCase().includes(search.toLowerCase()) ||
    m.marca?.nombreMarca?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Header 
        title="Monitoreo de Stock en Vivo" 
        subtitle="Seguimiento en tiempo real, control de reservas, stock disponible y valorización de almacén"
      />

      {error && (
        <div style={{ background: 'rgba(251,197,49,0.08)', border: '1px solid var(--warning)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#d19e07', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} /> {error}
        </div>
      )}

      {/* FILTER SEARCH CONTAINER */}
      <div className="luxury-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="search-container">
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar producto modelo por SKU, marca o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1.5rem' }} />
          <p>Cargando stock de productos...</p>
        </div>
      ) : categorias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>No se encontraron productos o categorías registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* LEVEL 1: CATEGORY COLLAPSIBLE */}
          {categorias.map((cat) => {
            const catModels = filteredModels.filter(m => m.categoria?.id === cat.id);
            if (search && catModels.length === 0) return null;

            const isCatExpanded = expandedCategories[cat.id] || !!search;

            return (
              <div key={cat.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', background: '#ffffff' }}>
                <div 
                  onClick={() => toggleCategory(cat.id)}
                  style={{ 
                    background: isCatExpanded ? 'linear-gradient(135deg, rgba(0, 86, 179, 0.02) 0%, rgba(255, 255, 255, 1) 100%)' : '#ffffff', 
                    padding: '1.2rem 1.8rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer',
                    borderBottom: isCatExpanded ? '1px solid var(--glass-border)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(0, 86, 179, 0.06)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      border: '1px solid rgba(0, 86, 179, 0.1)',
                      boxShadow: '0 2px 8px rgba(0, 86, 179, 0.05)'
                    }}>
                      {isCatExpanded ? <FolderOpen size={22} /> : <Folder size={22} />}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                        Categoría
                      </span>
                      <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                        {cat.nombreCategoria.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {catModels.length} {catModels.length === 1 ? 'MODELO EN STOCK' : 'MODELOS EN STOCK'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>
                      NIVEL 1 DE 2
                    </span>
                    {isCatExpanded ? <ChevronDown size={20} style={{ color: 'var(--text-primary)' }} /> : <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                </div>

                {isCatExpanded && (
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', background: '#f8fafc' }}>
                    {catModels.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', background: '#ffffff', borderRadius: '10px', border: '1px dashed var(--glass-border)', textAlign: 'center' }}>
                        No hay marcas ni modelos registrados en esta categoría.
                      </div>
                    ) : (
                      
                      // LEVEL 2: BRAND UNDER CATEGORY
                      marcas.map((brand) => {
                        const brandModels = catModels.filter(m => m.marca?.id === brand.id);
                        if (brandModels.length === 0) return null;

                        const brandKey = `${cat.id}-${brand.id}`;
                        const isBrandExpanded = expandedBrands[brandKey] !== false; // Default expanded

                        return (
                          <div key={brand.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '0.5rem' }}>
                            <div 
                              onClick={() => toggleBrand(brandKey)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                cursor: 'pointer',
                                padding: '0.9rem 1.2rem',
                                borderRadius: '12px',
                                background: isBrandExpanded ? 'var(--hover-bg)' : '#ffffff',
                                border: '1px solid var(--glass-border)',
                                boxShadow: isBrandExpanded ? 'inset 0 1px 3px rgba(0,0,0,0.02)' : '0 2px 4px rgba(0,0,0,0.02)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {isBrandExpanded ? <ChevronDown size={18} style={{ color: 'var(--accent)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />}
                                <Tag size={16} style={{ color: 'var(--accent-gold)' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                                  MARCA: <span style={{ color: 'var(--accent)', fontWeight: '800' }}>{brand.nombreMarca.toUpperCase()}</span>
                                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}> ({brandModels.length} {brandModels.length === 1 ? 'MODELOS REGISTRADOS' : 'MODELOS REGISTRADOS'})</span>
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                                NIVEL 2 DE 2
                              </span>
                            </div>

                            {/* TABLE VIEW OF LIVE STOCK */}
                            {isBrandExpanded && (
                              <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: '12px', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', width: '100%' }}>
                                <div style={{ width: '100%' }}>
                                  
                                  {/* Table Header Row */}
                                  <div 
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: '90px 1.5fr 75px 85px 85px 85px 55px 105px 75px 90px 105px',
                                      gap: '0.5rem',
                                      padding: '0.8rem 1rem',
                                      fontSize: '0.68rem',
                                      fontWeight: '800',
                                      color: 'var(--text-secondary)',
                                      textTransform: 'uppercase',
                                      borderBottom: '2px solid var(--glass-border)',
                                      background: 'rgba(0, 86, 179, 0.01)',
                                      letterSpacing: '0.5px',
                                      alignItems: 'center',
                                      minWidth: '1000px'
                                    }}
                                  >
                                    <div>ID Stock / Cód</div>
                                    <div>Producto Modelo</div>
                                    <div style={{ textAlign: 'center' }}>Marca</div>
                                    <div style={{ textAlign: 'center' }}>Stock Físico<br/><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>(Real)</span></div>
                                    <div style={{ textAlign: 'center' }}>Reservado<br/><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>(Pedidos)</span></div>
                                    <div style={{ textAlign: 'center' }}>Disponible<br/><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>(Venta)</span></div>
                                    <div style={{ textAlign: 'center' }}>Mínimo</div>
                                    <div style={{ textAlign: 'center' }}>Estado</div>
                                    <div style={{ textAlign: 'right' }}>Precio</div>
                                    <div style={{ textAlign: 'right' }}>Valorizado<br/><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>(Real)</span></div>
                                    <div style={{ textAlign: 'center' }}>Última Actualización</div>
                                  </div>

                                  {/* Table Body (Model rows) */}
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {brandModels.map((model) => {
                                      const stockCode = `STK-${model.modelo}`;
                                      const subCode = `${getBrandShort(model.marca?.nombreMarca)}-${formatModelCode(model.modelo)}`;
                                      
                                      const minStock = minStocks[model.id] || 10;
                                      const isLowStock = model.stock < minStock;
                                      const totalVal = model.stock * model.precio;
                                      const updateInfo = lastUpdates[model.id] || { date: '-', time: '-' };

                                      return (
                                        <div 
                                          key={model.id}
                                          style={{
                                            display: 'grid',
                                            gridTemplateColumns: '90px 1.5fr 75px 85px 85px 85px 55px 105px 75px 90px 105px',
                                            gap: '0.5rem',
                                            padding: '0.8rem 1rem',
                                            alignItems: 'center',
                                            borderBottom: '1px solid var(--glass-border)',
                                            fontSize: '0.78rem',
                                            color: 'var(--text-primary)',
                                            transition: 'background 0.2s',
                                            minWidth: '1000px'
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 86, 179, 0.01)'}
                                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                          {/* ID Stock / Cód */}
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                            <span style={{ 
                                              fontSize: '0.72rem', 
                                              fontWeight: '700', 
                                              color: '#0056b3', 
                                              border: '1px solid rgba(0, 86, 179, 0.25)', 
                                              borderRadius: '4px',
                                              padding: '2px 6px',
                                              width: 'fit-content',
                                              background: 'rgba(0, 86, 179, 0.03)'
                                            }}>
                                              {stockCode}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{subCode}</span>
                                          </div>

                                          {/* Producto Modelo */}
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                                              {cat.nombreCategoria.toUpperCase()} {model.modelo}
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                              {model.codigoModelo}
                                            </span>
                                          </div>

                                          {/* Marca */}
                                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <span style={{
                                              fontSize: '0.72rem',
                                              fontWeight: '700',
                                              color: 'var(--text-primary)',
                                              background: 'rgba(0,0,0,0.03)',
                                              padding: '4px 10px',
                                              borderRadius: '6px',
                                              border: '1px solid var(--glass-border)'
                                            }}>
                                              {brand.nombreMarca.toUpperCase()}
                                            </span>
                                          </div>

                                          {/* Stock Físico (Real) with +/- adjusters */}
                                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                            <button 
                                              onClick={() => handleStockChange(model, -1)}
                                              style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--glass-border)',
                                                background: '#ffffff',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--text-primary)',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                transition: 'all 0.15s'
                                              }}
                                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                                              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                            >
                                              -
                                            </button>
                                            <span style={{ fontWeight: '700', fontSize: '0.95rem', minWidth: '24px', textAlign: 'center' }}>
                                              {model.stock}
                                            </span>
                                            <button 
                                              onClick={() => handleStockChange(model, 1)}
                                              style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--glass-border)',
                                                background: '#ffffff',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--text-primary)',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                transition: 'all 0.15s'
                                              }}
                                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                                              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                            >
                                              +
                                            </button>
                                          </div>

                                          {/* Reservado */}
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                                            <span style={{
                                              fontSize: '0.72rem',
                                              fontWeight: '700',
                                              color: '#d19e07',
                                              background: 'rgba(251, 197, 49, 0.06)',
                                              padding: '3px 8px',
                                              borderRadius: '20px',
                                              border: '1px solid rgba(251, 197, 49, 0.2)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fbc531' }}></span>
                                              0 uds
                                            </span>
                                            <span style={{ 
                                              fontSize: '0.62rem', 
                                              color: 'var(--text-muted)', 
                                              fontWeight: '600', 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              gap: '2px', 
                                              cursor: 'pointer' 
                                            }}>
                                              <Link size={8} /> AUTO PEDIDOS
                                            </span>
                                          </div>

                                          {/* Disponible */}
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--success)' }}>
                                              {model.stock}
                                            </span>
                                            <span style={{ fontSize: '0.62rem', color: 'var(--success)', fontWeight: '800', letterSpacing: '0.3px' }}>
                                              DISP. VENTAS
                                            </span>
                                          </div>

                                          {/* Mínimo editable input */}
                                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <input 
                                              type="number" 
                                              style={{
                                                width: '50px',
                                                padding: '4px 6px',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '6px',
                                                textAlign: 'center',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                color: 'var(--text-primary)',
                                                outline: 'none',
                                                background: 'rgba(0,0,0,0.01)'
                                              }}
                                              value={minStock}
                                              onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setMinStocks(prev => ({ ...prev, [model.id]: val }));
                                              }}
                                            />
                                          </div>

                                          {/* Estado Pill */}
                                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            {isLowStock ? (
                                              <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: '800',
                                                color: 'var(--danger)',
                                                border: '1px solid rgba(232, 65, 24, 0.25)',
                                                borderRadius: '20px',
                                                padding: '4px 12px',
                                                background: 'rgba(232, 65, 24, 0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                letterSpacing: '0.3px'
                                              }}>
                                                <AlertTriangle size={10} /> BAJO STOCK
                                              </span>
                                            ) : (
                                              <span style={{
                                                fontSize: '0.72rem',
                                                fontWeight: '800',
                                                color: 'var(--text-primary)',
                                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                                borderRadius: '20px',
                                                padding: '4px 12px',
                                                background: '#ffffff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                letterSpacing: '0.3px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                              }}>
                                                <div style={{
                                                  width: '12px',
                                                  height: '12px',
                                                  borderRadius: '50%',
                                                  border: '1.5px solid #ff9f43',
                                                  background: '#ffffff',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  color: '#ff9f43'
                                                }}>
                                                  <Check size={8} strokeWidth={3} />
                                                </div>
                                                NORMAL
                                              </span>
                                            )}
                                          </div>

                                          {/* Precio */}
                                          <div style={{ textAlign: 'right', fontWeight: '600' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>S/ </span>
                                            {model.precio.toFixed(2)}
                                          </div>

                                          {/* Valorizado */}
                                          <div style={{ textAlign: 'right', fontWeight: '700', color: '#0056b3' }}>
                                            S/ {totalVal.toFixed(2)}
                                          </div>

                                          {/* Última Actualización */}
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem' }}>
                                            <Clock size={12} style={{ color: '#ff7675' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'flex-start' }}>
                                              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{updateInfo.date}</span>
                                              <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{updateInfo.time}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}
