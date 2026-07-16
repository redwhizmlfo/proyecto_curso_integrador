import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import { 
  Box, Sparkles, Package, Lock, Unlock, ArrowRight, Clock, Plus, Trash, 
  PlusCircle, CheckCircle2, History, Truck, Wrench, RefreshCw, X, AlertTriangle, Info
} from 'lucide-react';

export default function Movimientos() {
  const ADD_BRAND_VALUE = '__add_brand__';
  const [modelos, setModelos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for inventory boxes (replenishment shipments)
  const [boxes, setBoxes] = useState([]);
  // State for movements history log
  const [history, setHistory] = useState([]);

  // Modal Unboxing states
  const [activeBox, setActiveBox] = useState(null);
  const [unboxingStage, setUnboxingStage] = useState('closed'); // 'closed', 'shaking', 'exploding', 'revealed', 'releasing', 'done'
  const [unboxingError, setUnboxingError] = useState(null);

  // Form states for creating a new box
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newBoxName, setNewBoxName] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedModelQty, setSelectedModelQty] = useState(5);
  const [newBoxItems, setNewBoxItems] = useState([]);

  // Load backend catalog and models
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
    } catch (err) {
      console.warn('Error loading inventory movements catalog from backend.', err);
      setError('No se pudo cargar catalogo de movimientos desde el backend. No se muestran datos simulados.');
      setModelos([]);
      setMarcas([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Seed default boxes and load state from localStorage on mount
  useEffect(() => {
    loadData();

    const storedBoxes = localStorage.getItem('inventory_boxes');
    const storedHistory = localStorage.getItem('inventory_history');

    if (storedBoxes) {
      setBoxes(JSON.parse(storedBoxes));
    } else {
      setBoxes([]);
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    } else {
      setHistory([]);
    }
  }, []);

  // Sync boxes and history with localStorage when they change
  const saveBoxesToLocal = (newBoxes) => {
    setBoxes(newBoxes);
    localStorage.setItem('inventory_boxes', JSON.stringify(newBoxes));
  };

  const saveHistoryToLocal = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('inventory_history', JSON.stringify(newHistory));
  };

  // Helper for brand name representation
  const getBrandName = (brandId) => {
    const brand = marcas.find(b => b.id === brandId);
    return brand ? brand.nombreMarca : 'Genérica';
  };

  // Helper to format currency
  const formatMoney = (val) => `S/ ${parseFloat(val).toFixed(2)}`;

  // Handle Box item addition in Register Form
  const handleAddItemToBox = () => {
    if (!selectedModelId) return;
    const model = modelos.find(m => m.id === selectedModelId);
    if (!model) return;

    // Check if model already in items list
    if (newBoxItems.some(i => i.modelId === model.id)) {
      setNewBoxItems(prev => prev.map(i => i.modelId === model.id ? { ...i, qty: i.qty + selectedModelQty } : i));
    } else {
      setNewBoxItems(prev => [
        ...prev,
        {
          modelId: model.id,
          modelName: model.modelo,
          codModelo: model.codigoModelo,
          qty: selectedModelQty
        }
      ]);
    }
  };

  const handleRemoveItemFromBox = (modelId) => {
    setNewBoxItems(prev => prev.filter(i => i.modelId !== modelId));
  };

  // Handle Box Registration Form submit
  const handleRegisterBox = (e) => {
    e.preventDefault();
    if (!newBoxName.trim()) {
      alert("Por favor introduce el nombre o código de la caja.");
      return;
    }
    if (newBoxItems.length === 0) {
      alert("Debes agregar al menos un producto a la caja.");
      return;
    }
    if (selectedBrandId === ADD_BRAND_VALUE && !newBrandName.trim()) {
      alert("Introduce el nombre de la nueva marca.");
      return;
    }

    const brand = selectedBrandId === ADD_BRAND_VALUE
      ? { id: `marca_${Date.now()}`, nombreMarca: newBrandName.trim() }
      : (marcas.find(b => b.id === selectedBrandId) || marcas[0]);
    const newBox = {
      id: `box_${Date.now()}`,
      name: newBoxName,
      brandId: brand ? brand.id : 'marca_bosch',
      brandName: brand ? brand.nombreMarca : 'Bosch',
      status: 'SELLADA',
      origin: 'Almacén de Entrada',
      dateRegistered: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      items: newBoxItems
    };

    const updatedBoxes = [newBox, ...boxes];
    saveBoxesToLocal(updatedBoxes);

    // Reset Form states
    setNewBoxName('');
    setSelectedBrandId('');
    setNewBrandName('');
    setNewBoxItems([]);
    setIsFormOpen(false);
  };

  // Handle Unboxing Stage Transition
  const triggerUnboxing = (box) => {
    setActiveBox(box);
    setUnboxingStage('closed');
    setUnboxingError(null);
  };

  const handleBoxClick = () => {
    if (unboxingStage !== 'closed') return;
    setUnboxingStage('shaking');
    
    // Shake animation finishes, trigger explosion / contents reveal
    setTimeout(() => {
      setUnboxingStage('exploding');
      setTimeout(() => {
        setUnboxingStage('revealed');
      }, 800); // Explode screen duration
    }, 1200); // Shaking duration
  };

  // Release Stock in Crate to Live Inventory
  const handleReleaseStock = async () => {
    if (!activeBox) return;
    setUnboxingStage('releasing');
    
    try {
      // Loop over crate items and call PUT /api/modelos/{id}
      for (const item of activeBox.items) {
        // Find existing model locally or from fetched models to get its specs
        const currentModel = modelos.find(m => m.id === item.modelId || m.modelo?.toLowerCase() === item.modelName?.toLowerCase());
        
        // If not found, skip or throw error
        if (!currentModel) continue;

        const updatedStock = currentModel.stock + item.qty;

        // PUT update payload
        await api.put(`/modelos/${currentModel.id}`, {
          codigoModelo: currentModel.codigoModelo,
          modelo: currentModel.modelo,
          sku: currentModel.sku,
          precio: currentModel.precio,
          stock: updatedStock,
          id_categoria: currentModel.categoria?.id,
          id_marca: currentModel.marca?.id
        });
      }

      // Successful releases:
      // 1. Mark box as LIBERADA in state
      const updatedBoxes = boxes.map(b => b.id === activeBox.id ? { ...b, status: 'LIBERADA' } : b);
      saveBoxesToLocal(updatedBoxes);

      // 2. Add history record
      const todayDate = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const todayTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
      const newHistoryEntry = {
        id: `mov_${Date.now()}`,
        boxName: activeBox.name,
        brandName: activeBox.brandName,
        dateReleased: `${todayDate} ${todayTime}`,
        items: activeBox.items
      };
      saveHistoryToLocal([newHistoryEntry, ...history]);

      // 3. Reload live products stock from backend
      await loadData();
      
      setUnboxingStage('done');
    } catch (err) {
      console.error('Error releasing box stock to database:', err);
      setUnboxingError('No se pudo guardar en la base de datos. No se aplico ningun cambio local.');
      setUnboxingStage('revealed');
    }
  };

  // Close modal and clean up states
  const closeModal = () => {
    setActiveBox(null);
    setUnboxingStage('closed');
    setUnboxingError(null);
  };

  // Filter models based on selected brand in form
  const formModels = modelos.filter(m => selectedBrandId === ADD_BRAND_VALUE || m.marca?.id === selectedBrandId || !selectedBrandId);

  // Helper to resolve fallback or real images
  const getProductImage = (modelId) => {
    if (modelId === 'pm_gws2200') return '/src/assets/esmeril_gws2200.png';
    if (modelId === 'pm_gws750') return '/src/assets/esmeril_gws750.png';
    if (modelId === 'pm_m0900b') return '/src/assets/taladro.png';
    return '/src/assets/taladro.png';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
      
      {/* Dynamic CSS styles for animations */}
      <style>{`
        @keyframes floatBox {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes boxGlow {
          0% { box-shadow: 0 0 15px rgba(255, 107, 0, 0.15); }
          50% { box-shadow: 0 0 35px rgba(255, 107, 0, 0.4); }
          100% { box-shadow: 0 0 15px rgba(255, 107, 0, 0.15); }
        }
        @keyframes shakeBox {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-8px, -5px) rotate(-3deg); }
          20% { transform: translate(8px, 5px) rotate(3deg); }
          30% { transform: translate(-10px, 8px) rotate(-4deg); }
          40% { transform: translate(10px, -8px) rotate(4deg); }
          50% { transform: translate(-8px, 3px) rotate(-2deg); }
          60% { transform: translate(8px, -3px) rotate(2deg); }
          70% { transform: translate(-6px, -6px) rotate(-3deg); }
          80% { transform: translate(6px, 6px) rotate(3deg); }
          90% { transform: translate(-4px, 2px) rotate(-1deg); }
        }
        @keyframes burstLight {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes lidFly {
          0% { transform: translateY(0) scale(1) rotate(0); opacity: 1; }
          100% { transform: translateY(-300px) scale(0.5) rotate(45deg); opacity: 0; }
        }
        @keyframes floatItem {
          0% { transform: translateY(50px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .wooden-crate {
          background: linear-gradient(145deg, #a0522d 0%, #8b4513 100%);
          border: 4px solid #5c2c16;
          border-radius: 12px;
          position: relative;
          width: 140px;
          height: 120px;
          margin: 0 auto;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          alignItems: center;
          justifyContent: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .wooden-crate::before {
          content: '';
          position: absolute;
          width: 90%;
          height: 10px;
          background: #5c2c16;
          top: 15px;
          left: 5%;
        }
        .wooden-crate::after {
          content: '';
          position: absolute;
          width: 90%;
          height: 10px;
          background: #5c2c16;
          bottom: 15px;
          left: 5%;
        }
        .crate-corner {
          position: absolute;
          width: 25px;
          height: 25px;
          background: #3a3a3a;
          border: 1px solid #222;
        }
        .c-tl { top: 0; left: 0; border-radius: 6px 0 0 0; }
        .c-tr { top: 0; right: 0; border-radius: 0 6px 0 0; }
        .c-bl { bottom: 0; left: 0; border-radius: 0 0 0 6px; }
        .c-br { bottom: 0; right: 0; border-radius: 0 0 6px 0; }
        
        .crate-cross {
          position: absolute;
          width: 12px;
          height: 100%;
          background: rgba(0,0,0,0.25);
          transform: rotate(45deg);
        }
        .crate-cross-2 {
          position: absolute;
          width: 12px;
          height: 100%;
          background: rgba(0,0,0,0.25);
          transform: rotate(-45deg);
        }
        .crate-latch {
          position: absolute;
          width: 32px;
          height: 40px;
          background: #ffd700;
          border: 2px solid #b8860b;
          border-radius: 4px;
          top: 40px;
          left: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 6px rgba(0,0,0,0.2);
          z-index: 10;
        }
        
        /* Interactive Crate animations */
        .crate-state-closed {
          animation: floatBox 4s ease-in-out infinite, boxGlow 3s ease-in-out infinite;
        }
        .crate-state-closed:hover {
          transform: scale(1.08);
          box-shadow: 0 15px 35px rgba(255, 107, 0, 0.45);
        }
        .crate-state-shaking {
          animation: shakeBox 1.2s cubic-bezier(.36,.07,.19,.97) both;
        }
        .crate-state-exploding {
          transform: scale(0.6);
          opacity: 0.3;
          transition: all 0.8s ease-out;
        }
        
        /* Glowing burst ray */
        .glow-ray {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255,107,0,0.5) 0%, rgba(255,107,0,0) 70%);
          border-radius: 50%;
          animation: burstLight 1s ease-out forwards;
          pointer-events: none;
          z-index: 5;
        }

        .box-drawer-panel .form-group {
          margin-bottom: 0;
        }

        .box-drawer-panel .form-input {
          padding: 0.58rem 0.75rem;
          border-radius: 7px;
          font-size: 0.86rem;
        }

        .box-drawer-panel h3 {
          font-size: 1.12rem !important;
          line-height: 1.2;
        }
      `}</style>

      {/* HEADER SECTION */}
      <Header 
        title="Movimientos de Inventario" 
        subtitle="Ingreso de lotes, reposición de stock en vivo y desprecintado interactivo de cajas desde almacén"
      >
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button 
            onClick={() => setIsFormOpen(true)} 
            className="btn-premium"
            style={{ height: '38px', padding: '0 1rem' }}
          >
            <Plus size={16} /> Registrar Caja de Almacén
          </button>
        </div>
      </Header>

      {error && (
        <div style={{ background: 'rgba(251,197,49,0.08)', border: '1px solid var(--warning)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#d19e07', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1.5rem' }} />
          <p>Cargando datos de inventario...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* TOP SUMMARY CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.2rem' }}>
            {/* Card 1: Cajas Pendientes */}
            <div className="luxury-card" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--glass-border)' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(255, 107, 0, 0.08)',
                color: 'var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 107, 0, 0.15)'
              }}>
                <Box size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Cajas en Tránsito
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                  {boxes.filter(b => b.status === 'SELLADA').length} Pendientes
                </strong>
              </div>
            </div>

            {/* Card 2: Modelos Registrados */}
            <div className="luxury-card" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--glass-border)' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(0, 52, 113, 0.05)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 52, 113, 0.1)'
              }}>
                <Package size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Modelos en Almacén
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                  {modelos.length} Modelos
                </strong>
              </div>
            </div>

            {/* Card 3: Existencias Físicas Totales */}
            <div className="luxury-card" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--glass-border)' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(76, 209, 55, 0.08)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(76, 209, 55, 0.15)'
              }}>
                <CheckCircle2 size={20} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Existencias Totales
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent)', fontWeight: '800' }}>
                  {modelos.reduce((acc, m) => acc + m.stock, 0)} uds
                </strong>
              </div>
            </div>
          </div>

          {/* INSTRUCTIONS GUIDE BANNER */}
          <div className="luxury-card" style={{ padding: '1.2rem 1.5rem', background: 'linear-gradient(135deg, rgba(0, 52, 113, 0.02) 0%, rgba(255, 255, 255, 1) 100%)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
              <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Guía de Operaciones de Inventario
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>1</span>
                Registra cajas o lotes de mercancía traídos del almacén de entrada.
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>2</span>
                Presiona "Examinar & Abrir" para desprecintar de manera interactiva.
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800' }}>3</span>
                Libera el stock para impactar la base de datos real en tiempo caliente.
              </span>
            </div>
          </div>

          {/* SEALED BOXES LIST SECTION */}
          <div className="luxury-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <Truck size={20} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Cajas en Tránsito / Pendientes
              </h2>
              <span style={{ fontSize: '0.72rem', background: 'rgba(0,52,113,0.06)', color: 'var(--accent)', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                {boxes.filter(b => b.status === 'SELLADA').length} PENDIENTES
              </span>
            </div>

            {boxes.filter(b => b.status === 'SELLADA').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <Package size={42} style={{ marginBottom: '1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>No hay cajas pendientes en el almacén de entrada.</p>
                <p style={{ fontSize: '0.78rem', marginTop: '0.3rem' }}>Utiliza el botón de arriba para registrar una nueva caja.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.2rem' }}>
                {boxes.filter(b => b.status === 'SELLADA').map((box) => (
                  <div 
                    key={box.id} 
                    className="luxury-card interactive" 
                    style={{ 
                      padding: '1.2rem', 
                      border: '1px solid var(--glass-border)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      gap: '1rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Brand Badge Corner */}
                    <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.03)', borderBottomLeftRadius: '10px', padding: '4px 10px', fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-secondary)', borderLeft: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                      {box.brandName.toUpperCase()}
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: 'rgba(255, 107, 0, 0.08)',
                        color: 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 107, 0, 0.15)'
                      }}>
                        <Box size={22} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                          {box.origin}
                        </span>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', paddingRight: '4.5rem', lineHeight: '1.25' }}>
                          {box.name}
                        </h3>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: '700' }}>CONTENIDO DEL LOTE:</span>
                      {box.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                          <span>{it.modelName} ({it.codModelo})</span>
                          <span style={{ color: 'var(--accent)', fontWeight: '800' }}>+{it.qty} uds</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {box.dateRegistered}
                      </span>

                      <button 
                        onClick={() => triggerUnboxing(box)}
                        className="btn"
                        style={{
                          background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          boxShadow: '0 4px 10px rgba(255, 107, 0, 0.25)',
                          cursor: 'pointer'
                        }}
                      >
                        <Lock size={12} /> Examinar & Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL DE MOVIMIENTOS SECTION (FULL WIDTH) */}
          <div className="luxury-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <History size={20} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Historial de Movimientos de Reposición
              </h2>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                <Clock size={36} style={{ marginBottom: '0.8rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>No se registran movimientos completados aún.</p>
                <p style={{ fontSize: '0.72rem', marginTop: '0.2rem' }}>Abre una caja pendiente para ver su registro histórico reflejado aquí.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--glass-border)', borderRadius: '12px', background: '#ffffff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0, 52, 113, 0.01)', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '0.9rem 1.2rem' }}>Caja / Lote</th>
                      <th style={{ padding: '0.9rem 1.2rem', width: '120px' }}>Marca</th>
                      <th style={{ padding: '0.9rem 1.2rem' }}>Detalles de Carga</th>
                      <th style={{ padding: '0.9rem 1.2rem', width: '200px' }}>Fecha Liberación</th>
                      <th style={{ padding: '0.9rem 1.2rem', textAlign: 'center', width: '130px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr 
                        key={h.id} 
                        style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 86, 179, 0.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.8rem 1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{h.boxName}</td>
                        <td style={{ padding: '0.8rem 1.2rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.04)', color: 'var(--text-primary)' }}>
                            {h.brandName.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.8rem 1.2rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {h.items.map((it, i) => (
                              <span key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                {it.modelName}: <strong style={{ color: 'var(--success)' }}>+{it.qty} uds</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '0.8rem 1.2rem', color: 'var(--text-secondary)' }}>{h.dateReleased}</td>
                        <td style={{ padding: '0.8rem 1.2rem', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: 'var(--success)',
                            background: 'rgba(76,209,55,0.08)',
                            border: '1px solid rgba(76,209,55,0.2)',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            letterSpacing: '0.3px'
                          }}>
                            <CheckCircle2 size={10} /> LIBERADO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* FORM MODAL: REGISTER NEW BOX */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 22, 41, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 999,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div className="box-drawer-panel" style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            maxHeight: 'calc(100vh - 48px)',
            boxShadow: '0 24px 70px rgba(10,22,41,0.22)',
            boxSizing: 'border-box',
            borderRadius: '12px',
            padding: '1.35rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            overflowY: 'visible'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Registrar Caja de Almacén</h3>
              </div>
              <button 
                onClick={() => { setIsFormOpen(false); setNewBoxItems([]); setSelectedBrandId(''); setNewBrandName(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterBox} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Nombre / Lote de la Caja
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. Lote de Reposición Bosch 2026"
                  value={newBoxName}
                  onChange={(e) => setNewBoxName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Fabricante / Marca
                </label>
                <select 
                  className="form-input" 
                  value={selectedBrandId} 
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    if (e.target.value !== ADD_BRAND_VALUE) {
                      setNewBrandName('');
                    }
                    setSelectedModelId('');
                  }}
                  required
                >
                  <option value="">Selecciona una marca...</option>
                  <option value={ADD_BRAND_VALUE}>+ Añadir marca</option>
                  {marcas.map(b => (
                    <option key={b.id} value={b.id}>{b.nombreMarca}</option>
                  ))}
                </select>
                <div style={{
                  maxHeight: selectedBrandId === ADD_BRAND_VALUE ? '64px' : '0',
                  opacity: selectedBrandId === ADD_BRAND_VALUE ? 1 : 0,
                  transform: selectedBrandId === ADD_BRAND_VALUE ? 'translateY(0)' : 'translateY(-4px)',
                  overflow: 'hidden',
                  transition: 'max-height 0.28s ease, opacity 0.22s ease, transform 0.28s ease',
                  marginTop: selectedBrandId === ADD_BRAND_VALUE ? '0.55rem' : '0'
                }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre de la nueva marca"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    required={selectedBrandId === ADD_BRAND_VALUE}
                  />
                </div>
              </div>

              <div style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.75rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent)' }}>AGREGAR PRODUCTOS MODELOS</span>
                
                <div className="form-group">
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>
                    Seleccionar Modelo
                  </label>
                  <select 
                    className="form-input"
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    style={{ background: '#ffffff' }}
                  >
                    <option value="">-- Elige un Modelo --</option>
                    {formModels.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.modelo} ({m.codigoModelo})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>
                    Cantidad de Unidades
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={selectedModelQty}
                      onChange={(e) => setSelectedModelQty(parseInt(e.target.value))}
                      style={{ flexGrow: 1 }}
                    />
                    <strong style={{ minWidth: '40px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--accent)' }}>{selectedModelQty} uds</strong>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleAddItemToBox}
                  className="btn"
                  disabled={!selectedModelId}
                  style={{
                    background: selectedModelId ? 'var(--accent)' : 'var(--text-muted)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    padding: '7px',
                    borderRadius: '6px',
                    cursor: selectedModelId ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Añadir Producto al Lote
                </button>
              </div>

              {/* Added items previews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Productos en la Caja:</span>
                {newBoxItems.length === 0 ? (
                  <div style={{ minHeight: '78px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.45rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
                    Caja vacía. Agrega productos arriba.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '78px', maxHeight: '132px', overflowY: 'auto', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--glass-border)', padding: '0.45rem' }}>
                    {newBoxItems.map(item => (
                      <div key={item.modelId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid var(--glass-border)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <span>
                          <strong>{item.modelName}</strong> ({item.codModelo}) - <span style={{ color: 'var(--accent)', fontWeight: '700' }}>{item.qty} uds</span>
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItemFromBox(item.modelId)}
                          style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn-premium"
                disabled={newBoxItems.length === 0}
                style={{
                  width: '100%',
                  minHeight: '40px',
                  padding: '0 1rem',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: '700',
                  marginTop: '0.25rem',
                  opacity: newBoxItems.length === 0 ? 0.6 : 1
                }}
              >
                Guardar Caja Sellada
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GAMIFIED LUCKY BOX OVERLAY MODAL */}
      {activeBox && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(10, 22, 41, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          color: '#ffffff'
        }}>
          
          {/* Close button */}
          {['closed', 'revealed', 'done'].includes(unboxingStage) && (
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '25px',
                right: '25px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <X size={20} />
            </button>
          )}

          {/* STAGE 1: SEALED BOX */}
          {unboxingStage === 'closed' && (
            <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem' }}>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
                LOTE ADQUIRIDO DESDE EL ALMACÉN
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.4rem', marginBottom: '2rem', letterSpacing: '-0.5px' }}>
                {activeBox.name}
              </h2>

              <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
                {/* Radial Glow light in background */}
                <div style={{
                  position: 'absolute',
                  width: '280px',
                  height: '280px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 107, 0, 0.22) 0%, rgba(255,107,0,0) 70%)',
                  pointerEvents: 'none',
                  animation: 'spinSlow 15s linear infinite'
                }} />
                
                <div 
                  className="wooden-crate crate-state-closed"
                  onClick={handleBoxClick}
                >
                  <div className="crate-cross" />
                  <div className="crate-cross-2" />
                  <div className="crate-corner c-tl" />
                  <div className="crate-corner c-tr" />
                  <div className="crate-corner c-bl" />
                  <div className="crate-corner c-br" />
                  <div className="crate-latch">
                    <Lock size={16} color="#000000" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#a0aec0', lineHeight: '1.4', marginBottom: '0.8rem' }}>
                Haz clic en la caja de madera sellada para romper los precintos metálicos y desempacar el contenido.
              </p>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '0.5px' }}>
                MARCA ASOCIADA: {activeBox.brandName.toUpperCase()}
              </span>
            </div>
          )}

          {/* STAGE 2: SHAKING ANIMATION */}
          {unboxingStage === 'shaking' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div 
                  className="wooden-crate crate-state-shaking"
                  style={{ transformScale: '1.1' }}
                >
                  <div className="crate-cross" />
                  <div className="crate-cross-2" />
                  <div className="crate-corner c-tl" />
                  <div className="crate-corner c-tr" />
                  <div className="crate-corner c-bl" />
                  <div className="crate-corner c-br" />
                  <div className="crate-latch" style={{ background: '#ffa500' }}>
                    <Lock size={16} color="#000000" strokeWidth={3} style={{ animation: 'pulse 0.4s infinite' }} />
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '1.5rem', color: 'var(--accent-gold)', letterSpacing: '1px' }}>
                DESPRECINTANDO CAJA...
              </h3>
            </div>
          )}

          {/* STAGE 3: EXPLODING BURST */}
          {unboxingStage === 'exploding' && (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="glow-ray" />
              <div 
                className="wooden-crate crate-state-exploding"
              >
                <div className="crate-cross" />
                <div className="crate-cross-2" />
                <div className="crate-corner c-tl" />
                <div className="crate-corner c-tr" />
                <div className="crate-corner c-bl" />
                <div className="crate-corner c-br" />
                <div className="crate-latch" style={{ opacity: 0 }}>
                  <Unlock size={16} />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: REVEALED CONTENTS & RELEASE FORM */}
          {unboxingStage === 'revealed' && (
            <div style={{ textAlign: 'center', maxWidth: '640px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
              <div>
                <span style={{ color: 'var(--accent-gold)', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <Sparkles size={14} /> ¡Caja Abierta Exitosamente! <Sparkles size={14} />
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.3rem', color: '#ffffff' }}>
                  Contenido de {activeBox.name}
                </h2>
              </div>

              {/* Items Card List layout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
                {activeBox.items.map((item, idx) => {
                  const dbModel = modelos.find(m => m.id === item.modelId || m.modelo?.toLowerCase() === item.modelName?.toLowerCase());
                  const currentStock = dbModel ? dbModel.stock : 0;
                  const targetStock = currentStock + item.qty;

                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px', 
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        animation: `floatItem 0.4s ease-out ${idx * 0.15}s both`,
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '4px',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <img 
                            src={getProductImage(item.modelId)} 
                            alt={item.modelName} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = '/src/assets/taladro.png'; }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: '600' }}>
                            {activeBox.brandName.toUpperCase()} • MODELO
                          </span>
                          <strong style={{ fontSize: '1rem', color: '#ffffff' }}>
                            {item.modelName}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#a0aec0' }}>{item.codModelo}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {/* Units increment badge */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '800',
                            color: 'var(--success)',
                            background: 'rgba(76,209,55,0.12)',
                            border: '1px solid rgba(76,209,55,0.3)',
                            padding: '4px 12px',
                            borderRadius: '20px'
                          }}>
                            +{item.qty} UDS
                          </span>
                        </div>

                        {/* Stock progression */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.62rem', color: '#a0aec0' }}>ACTUAL</span>
                            <span style={{ fontWeight: '700' }}>{currentStock}</span>
                          </div>
                          <ArrowRight size={14} style={{ color: 'var(--accent-gold)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--success)', fontWeight: '700' }}>NUEVO</span>
                            <span style={{ fontWeight: '800', color: '#ffffff' }}>{targetStock}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={closeModal} 
                  className="btn"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Volver Después
                </button>
                <button 
                  onClick={handleReleaseStock} 
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    boxShadow: '0 8px 25px rgba(255, 107, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Unlock size={16} /> Liberar Stock a Inventario
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: RELEASING TRANSACTION */}
          {unboxingStage === 'releasing' && (
            <div style={{ textAlign: 'center' }}>
              <RefreshCw size={42} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-gold)', marginBottom: '1.5rem' }} />
              <h3>Sincronizando con base de datos en caliente...</h3>
              <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginTop: '0.5rem' }}>Actualizando stock físico atómicamente por modelo</p>
            </div>
          )}

          {/* STAGE 6: COMPLETED FLOW */}
          {unboxingStage === 'done' && (
            <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(76,209,55,0.12)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--success)',
                boxShadow: '0 0 20px rgba(76,209,55,0.3)',
                animation: 'floatBox 3s ease-in-out infinite'
              }}>
                <CheckCircle2 size={46} strokeWidth={2.5} />
              </div>

              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>Stock Incorporado</h2>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  El lote ha sido ingresado al sistema. Los contadores de stock real en el almacén de la ferretería han sido actualizados en caliente.
                </p>
                {unboxingError && (
                  <div style={{ marginTop: '1rem', border: '1px solid rgba(251,197,49,0.3)', background: 'rgba(251,197,49,0.06)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', color: '#e2b123', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Info size={12} /> {unboxingError}
                  </div>
                )}
              </div>

              <button 
                onClick={closeModal} 
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, #0056b3 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  padding: '10px 28px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 52, 113, 0.3)'
                }}
              >
                Cerrar Portal
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
