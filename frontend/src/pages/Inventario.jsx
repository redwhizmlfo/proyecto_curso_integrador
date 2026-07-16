import { useEffect, useState } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import FieldValidationHint from '../components/FieldValidationHint';
import { 
  Search, Plus, AlertTriangle, Trash, Edit, RefreshCw, 
  ChevronRight, ChevronDown, Folder, FolderOpen, Tag, 
  Cpu, ZoomIn, Info, Package
} from 'lucide-react';
import { liveFieldValidators, validateProductModelForm } from '../services/validators';

// Sub-component to manage interactive Carousel, Gallery and Zoom (Lightbox) inside the table row
// Sub-component to manage interactive Carousel, Gallery and Zoom (Lightbox) inside the product card
function ModelCard({ model, specs, images, onEdit, onDelete, onZoom }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  // Automatic carousel image rotation (cycles every 3 seconds)
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images && images.length > 0 ? images[activeIdx]?.urlImagen : '/src/assets/taladro.png';
  const totalValue = model.precio * model.stock;

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#ffffff',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: hovered ? '0 10px 20px rgba(0,0,0,0.06)' : '0 2px 4px rgba(0,0,0,0.02)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%'
      }}
      className="luxury-card interactive"
    >
      {/* Decorative vertical bar on the far left */}
      <span 
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: model.stock <= 10 ? 'var(--danger)' : '#0056b3',
          transition: 'all 0.2s'
        }}
      />

      {/* Image Thumbnail Box */}
      <div 
        onClick={() => onZoom(currentImage)}
        style={{ 
          height: '150px', 
          background: '#f8fafc', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'zoom-in',
          position: 'relative',
          borderBottom: '1px solid var(--glass-border)'
        }}
      >
        <img 
          src={currentImage} 
          alt={model.modelo} 
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/src/assets/taladro.png';
          }}
          style={{ 
            maxHeight: '90%', 
            maxWidth: '90%', 
            objectFit: 'contain', 
            transition: 'transform 0.3s ease',
            transform: hovered ? 'scale(1.06)' : 'scale(1)'
          }} 
        />
        {/* Hover zoom indicator */}
        {hovered && (
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '50%',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <ZoomIn size={12} style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
      </div>

      {/* Product Details Container */}
      <div style={{ padding: '0.8rem 1rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.4rem' }}>
        {/* SKU (Barcode) */}
        <span style={{ fontSize: '0.65rem', color: '#8397ab', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          SKU: {model.sku || 'SIN SKU'}
        </span>

        {/* Model Name & Technical Code */}
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: '0.9rem', 
            fontWeight: '800', 
            color: 'var(--text-primary)',
            lineHeight: '1.3',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '2.6em' // Fixed height for alignment
          }}>
            {model.categoria?.nombreCategoria?.toUpperCase() || 'CATEGORÍA'} - {model.modelo}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            CÓD: {model.codigoModelo}
          </span>
        </div>

        {/* Specifications horizontal badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', minHeight: '38px', alignContent: 'flex-start' }}>
          {specs && specs.length > 0 ? (
            specs.slice(0, 3).map((spec) => (
              <span 
                key={spec.id}
                style={{
                  background: 'rgba(0, 86, 179, 0.04)',
                  color: 'var(--accent)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  border: '1px solid rgba(0, 86, 179, 0.08)',
                  textTransform: 'uppercase'
                }}
              >
                {spec.atributo.substring(0, 8)}: {spec.valor}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Sin especificaciones</span>
          )}
        </div>

        {/* Stock & Valorization Box */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.2rem',
          padding: '0.5rem 0.6rem', 
          background: 'var(--hover-bg)', 
          borderRadius: '8px',
          marginTop: 'auto',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Stock Físico:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '800', fontSize: '0.8rem' }}>
              <span 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: model.stock <= 10 ? 'var(--danger)' : 'var(--success)',
                  boxShadow: model.stock <= 10 ? '0 0 6px var(--danger)' : '0 0 6px var(--success)'
                }} 
              />
              <span style={{ color: model.stock <= 10 ? 'var(--danger)' : 'var(--success)' }}>
                {model.stock} uds
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '0.2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Valorización:</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#9b59b6' }}>
              S/. {totalValue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Divider and Price + Action Buttons */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingTop: '0.4rem',
          borderTop: '1px solid #f1f5f9',
          marginTop: '0.2rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.58rem', color: '#8397ab', fontWeight: '700', textTransform: 'uppercase' }}>Precio</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
              S/. {model.precio.toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(model); }}
              className="btn-secondary"
              style={{ 
                padding: '0.4rem', 
                borderRadius: '6px', 
                minWidth: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 86, 179, 0.1)',
                color: '#0056b3',
                border: '1px solid rgba(0, 86, 179, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 86, 179, 0.1)';
                e.currentTarget.style.color = '#0056b3';
              }}
              title="Editar"
            >
              <Edit size={13} />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(model.id); }}
              className="btn-danger"
              style={{ 
                padding: '0.4rem', 
                borderRadius: '6px', 
                minWidth: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(232, 65, 24, 0.1)',
                color: 'var(--danger)',
                border: '1px solid rgba(232, 65, 24, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(232, 65, 24, 0.1)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              title="Eliminar"
            >
              <Trash size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Inventario() {
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [productosModelos, setProductosModelos] = useState([]);
  const [especificaciones, setEspecificaciones] = useState([]);
  const [productosImagenes, setProductosImagenes] = useState([]);

  // Tree toggles state
  const [expandedCategories, setExpandedCategories] = useState({ cat_esm: true }); // Keep esmeriles open by default
  const [expandedBrands, setExpandedBrands] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Overlay Modal Toggles
  const [showModelModal, setShowModelModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'

  // Inline Creation Form States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Administrative Form States
  const [modelForm, setModelForm] = useState({
    id: '',
    codigoModelo: '',
    modelo: '',
    sku: '',
    precio: '',
    stock: '',
    id_categoria: '',
    id_marca: '',
    specs: [{ atributo: '', valor: '' }],
    imageUrl: ''
  });

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      const [catList, brandList, modelList, specList, imgList] = await Promise.all([
        api.get('/categorias'),
        api.get('/marcas'),
        api.get('/modelos'),
        api.get('/especificaciones'),
        api.get('/imagenes-modelos')
      ]);
      setCategorias(catList);
      setMarcas(brandList);
      setProductosModelos(modelList);
      setEspecificaciones(specList);
      setProductosImagenes(imgList);
      setError(null);
    } catch (err) {
      console.warn("Backend offline or error loading catalog data.", err);
      setError("No se pudo cargar el catalogo desde el backend. Las operaciones estan deshabilitadas.");
      setCategorias([]);
      setMarcas([]);
      setProductosModelos([]);
      setEspecificaciones([]);
      setProductosImagenes([]);
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  const openCreateModelModal = () => {
    setModalMode('create');
    setNewCategoryName('');
    setNewBrandName('');
    setModelForm({
      id: '',
      codigoModelo: '',
      modelo: '',
      sku: '',
      precio: '',
      stock: '',
      id_categoria: categorias[0]?.id || '',
      id_marca: marcas[0]?.id || '',
      specs: [{ atributo: '', valor: '' }],
      imageUrl: ''
    });
    setFormErrors({});
    setShowModelModal(true);
  };

  // Helper to dynamically resolve Category and Brand IDs, creating new ones if requested inline
  const resolveCategoryAndBrand = async () => {
    let categoryId = modelForm.id_categoria;
    let brandId = modelForm.id_marca;

    if (error) {
      throw new Error('Operacion deshabilitada: no hay conexion real con el backend.');
    }

    // 1. Create inline category if NEW_CAT selected
    if (categoryId === 'NEW_CAT') {
      if (!newCategoryName.trim()) {
        throw new Error('Debe escribir el nombre de la nueva categoría.');
      }
      if (error) {
        // Mock offline creation
        const mockCatId = 'cat_' + Date.now();
        const mockCat = { id: mockCatId, nombreCategoria: newCategoryName };
        setCategorias(prev => [...prev, mockCat]);
        categoryId = mockCatId;
      } else {
        // Online API creation
        const savedCat = await api.post('/categorias', { nombreCategoria: newCategoryName });
        categoryId = savedCat.id;
      }
    }

    // 2. Create inline brand if NEW_BRAND selected
    if (brandId === 'NEW_BRAND') {
      if (!newBrandName.trim()) {
        throw new Error('Debe escribir el nombre de la nueva marca.');
      }
      if (error) {
        // Mock offline creation
        const mockBrandId = 'marca_' + Date.now();
        const mockBrand = { id: mockBrandId, nombreMarca: newBrandName };
        setMarcas(prev => [...prev, mockBrand]);
        brandId = mockBrandId;
      } else {
        // Online API creation
        const savedBrand = await api.post('/marcas', { nombreMarca: newBrandName });
        brandId = savedBrand.id;
      }
    }

    return { categoryId, brandId };
  };

  const handleModelSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProductModelForm(modelForm, {
      models: productosModelos,
      newCategoryName,
      newBrandName,
    });
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      // Resolve Category and Brand inline additions first
      const { categoryId, brandId } = await resolveCategoryAndBrand();

      let createdModel;
      if (error) {
        // Mock add model
        const selCat = categorias.find(c => c.id === categoryId) || { id: categoryId, nombreCategoria: newCategoryName };
        const selBrand = marcas.find(b => b.id === brandId) || { id: brandId, nombreMarca: newBrandName };
        
        createdModel = {
          id: 'pm_' + Date.now(),
          codigoModelo: modelForm.codigoModelo,
          modelo: modelForm.modelo,
          sku: modelForm.sku,
          precio: parseFloat(modelForm.precio),
          stock: parseInt(modelForm.stock),
          categoria: selCat,
          marca: selBrand
        };
        setProductosModelos(prev => [...prev, createdModel]);

        // Mock add specs
        const newSpecs = modelForm.specs
          .filter(s => s.atributo && s.valor)
          .map((s, idx) => ({
            id: 'sp_add_' + Date.now() + '_' + idx,
            productoModelo: { id: createdModel.id },
            atributo: s.atributo,
            valor: s.valor
          }));
        setEspecificaciones(prev => [...prev, ...newSpecs]);

        // Mock add image
        if (modelForm.imageUrl) {
          const newImg = {
            id: 'img_add_' + Date.now(),
            productoModelo: { id: createdModel.id },
            urlImagen: modelForm.imageUrl
          };
          setProductosImagenes(prev => [...prev, newImg]);
        }
      } else {
        // POST to backend api
        createdModel = await api.post('/modelos', {
          codigoModelo: modelForm.codigoModelo,
          modelo: modelForm.modelo,
          sku: modelForm.sku,
          precio: parseFloat(modelForm.precio),
          stock: parseInt(modelForm.stock),
          id_categoria: categoryId,
          id_marca: brandId
        });

        // Add specs
        for (const spec of modelForm.specs) {
          if (spec.atributo && spec.valor) {
            await api.post('/especificaciones', {
              id_producto_modelo: createdModel.id,
              atributo: spec.atributo,
              valor: spec.valor
            });
          }
        }

        // Add image if URL provided
        if (modelForm.imageUrl) {
          await api.post('/imagenes-modelos', {
            id_producto_modelo: createdModel.id,
            url_imagen: modelForm.imageUrl
          });
        }
      }

      alert('Modelo registrado con éxito.');
      setShowModelModal(false);
      loadCatalogData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEditClick = (model) => {
    const modelSpecs = especificaciones.filter(s => s.productoModelo?.id === model.id);
    const modelImages = productosImagenes.filter(img => img.productoModelo?.id === model.id);

    setModalMode('edit');
    setNewCategoryName('');
    setNewBrandName('');
    setModelForm({
      id: model.id,
      codigoModelo: model.codigoModelo || '',
      modelo: model.modelo || '',
      sku: model.sku || '',
      precio: model.precio || '',
      stock: model.stock || 0,
      id_categoria: model.categoria?.id || '',
      id_marca: model.marca?.id || '',
      specs: modelSpecs.length > 0 ? modelSpecs.map(s => ({ atributo: s.atributo, valor: s.valor })) : [{ atributo: '', valor: '' }],
      imageUrl: modelImages[0]?.urlImagen || ''
    });
    setFormErrors({});
    setShowModelModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const modelId = modelForm.id;
    const validationErrors = validateProductModelForm(modelForm, {
      models: productosModelos,
      newCategoryName,
      newBrandName,
    });
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      // Resolve Category and Brand inline additions first
      const { categoryId, brandId } = await resolveCategoryAndBrand();

      if (error) {
        // Local mock update
        const selCat = categorias.find(c => c.id === categoryId) || { id: categoryId, nombreCategoria: newCategoryName };
        const selBrand = marcas.find(b => b.id === brandId) || { id: brandId, nombreMarca: newBrandName };
        
        // Update product model in state
        const updatedModels = productosModelos.map(m => m.id === modelId ? {
          ...m,
          codigoModelo: modelForm.codigoModelo,
          modelo: modelForm.modelo,
          sku: modelForm.sku,
          precio: parseFloat(modelForm.precio),
          stock: parseInt(modelForm.stock),
          categoria: selCat,
          marca: selBrand
        } : m);
        setProductosModelos(updatedModels);

        // Update specs
        const otherSpecs = especificaciones.filter(s => s.productoModelo?.id !== modelId);
        const newSpecs = modelForm.specs
          .filter(s => s.atributo && s.valor)
          .map((s, idx) => ({
            id: 'sp_edit_' + Date.now() + '_' + idx,
            productoModelo: { id: modelId },
            atributo: s.atributo,
            valor: s.valor
          }));
        setEspecificaciones([...otherSpecs, ...newSpecs]);

        // Update image
        const otherImages = productosImagenes.filter(img => img.productoModelo?.id !== modelId);
        if (modelForm.imageUrl) {
          const newImg = {
            id: 'img_edit_' + Date.now(),
            productoModelo: { id: modelId },
            urlImagen: modelForm.imageUrl
          };
          setProductosImagenes([...otherImages, newImg]);
        } else {
          setProductosImagenes(otherImages);
        }
      } else {
        // Send PUT request to update the product model
        await api.put(`/modelos/${modelId}`, {
          codigoModelo: modelForm.codigoModelo,
          modelo: modelForm.modelo,
          sku: modelForm.sku,
          precio: parseFloat(modelForm.precio),
          stock: parseInt(modelForm.stock),
          id_categoria: categoryId,
          id_marca: brandId
        });

        // Clean and update specs on database
        await api.delete(`/especificaciones/modelo/${modelId}`);
        for (const spec of modelForm.specs) {
          if (spec.atributo && spec.valor) {
            await api.post('/especificaciones', {
              id_producto_modelo: modelId,
              atributo: spec.atributo,
              valor: spec.valor
            });
          }
        }

        // Clean and update image on database
        await api.delete(`/imagenes-modelos/modelo/${modelId}`);
        if (modelForm.imageUrl) {
          await api.post('/imagenes-modelos', {
            id_producto_modelo: modelId,
            url_imagen: modelForm.imageUrl
          });
        }
      }

      alert('Modelo actualizado con éxito.');
      setShowModelModal(false);
      loadCatalogData();
    } catch (err) {
      alert('Error al actualizar el modelo: ' + err.message);
    }
  };

  const handleModelDelete = async (modelId) => {
    if (!window.confirm('¿Está seguro de eliminar este modelo del catálogo?')) return;
    try {
      if (error) {
        throw new Error('Operacion deshabilitada: no hay conexion real con el backend.');
      } else {
        await api.delete(`/modelos/${modelId}`);
      }
      alert('Modelo eliminado.');
      loadCatalogData();
    } catch (err) {
      alert('Error al eliminar modelo: ' + err.message);
    }
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleBrand = (key) => {
    setExpandedBrands(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter models based on search bar query
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
        title="Catálogo de Productos" 
        subtitle="Estructura jerárquica de inventario: Categorías, Marcas y Modelos Técnicos"
      >
        <button 
          className="btn-premium"
          onClick={openCreateModelModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Registrar Nuevo Producto Modelo
        </button>
      </Header>

      {error && (
        <div style={{ background: 'rgba(251,197,49,0.08)', border: '1px solid var(--warning)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#d19e07', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} /> {error}
        </div>
      )}

      {/* VISUALIZACIÓN DE ÁRBOL DEL CATÁLOGO */}
      <div className="luxury-card">
        <div className="search-container" style={{ marginBottom: '2rem' }}>
          <Search size={18} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Buscar por modelo, SKU o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
            <p>Cargando catálogo...</p>
          </div>
        ) : categorias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Folder size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>El catálogo está vacío. Utiliza el botón superior para registrar nuevos productos y modelos.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* LEVEL 1: CATEGORY */}
            {categorias.map((cat) => {
              const catModels = filteredModels.filter(m => m.categoria?.id === cat.id);
              // Skip rendering empty categories if searching
              if (search && catModels.length === 0) return null;
              
              const isCatExpanded = expandedCategories[cat.id] || !!search;

              return (
                <div key={cat.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', marginBottom: '1.2rem' }}>
                  <div 
                    onClick={() => toggleCategory(cat.id)}
                    style={{ 
                      background: isCatExpanded ? 'linear-gradient(135deg, rgba(0, 86, 179, 0.02) 0%, rgba(255, 255, 255, 1) 100%)' : '#ffffff', 
                      padding: '1.2rem 1.5rem', 
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
                          {catModels.length} {catModels.length === 1 ? 'MODELO ASOCIADO' : 'MODELOS ASOCIADOS'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>
                        NIVEL 1 DE 3
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
                        marcas.map((brand) => {
                          const brandModels = catModels.filter(m => m.marca?.id === brand.id);
                          if (brandModels.length === 0) return null;

                          const brandKey = `${cat.id}-${brand.id}`;
                          const isBrandExpanded = expandedBrands[brandKey] || !!search;

                          return (
                            <div key={brand.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
                                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}> ({brandModels.length} {brandModels.length === 1 ? 'MODELO' : 'MODELOS'})</span>
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>
                                  NIVEL 2 DE 3
                                </span>
                              </div>

                              {isBrandExpanded && (
                                <div style={{ 
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                                  gap: '1.2rem',
                                  padding: '0.8rem 0 0.8rem 1rem',
                                  marginTop: '0.8rem'
                                }}>
                                  {brandModels.map((model) => {
                                    const modelSpecs = especificaciones.filter(s => s.productoModelo?.id === model.id);
                                    const modelImages = productosImagenes.filter(img => img.productoModelo?.id === model.id);

                                    return (
                                      <ModelCard 
                                        key={model.id}
                                        model={model}
                                        specs={modelSpecs}
                                        images={modelImages}
                                        onEdit={handleEditClick}
                                        onDelete={handleModelDelete}
                                        onZoom={(img) => setLightboxImage(img)}
                                      />
                                    );
                                  })}
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

      {/* OVERLAY MODAL: CREATE / EDIT PRODUCT MODEL */}
      {showModelModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: '400', letterSpacing: '1px' }}>
              {modalMode === 'edit' ? 'Editar Producto Modelo' : 'Registrar Nuevo Producto Modelo'}
            </h2>
            <form onSubmit={modalMode === 'edit' ? handleEditSubmit : handleModelSubmit} noValidate>
              
              <div className="form-row">
                {/* Category select dropdown with "+ Registrar nueva" option */}
                <div className="form-group">
                  <label>Categoría *</label>
                  <select 
                    className="form-select" 
                    required 
                    value={modelForm.id_categoria}
                    onChange={(e) => setModelForm({ ...modelForm, id_categoria: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombreCategoria}</option>)}
                    <option value="NEW_CAT" style={{ color: 'var(--success)', fontWeight: 'bold' }}>+ Registrar nueva categoría...</option>
                  </select>
                  
                  {modelForm.id_categoria === 'NEW_CAT' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Escriba nombre de nueva categoría"
                        maxLength={180}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                      />
                      <FieldValidationHint
                        value={newCategoryName}
                        isValid={liveFieldValidators.technicalText}
                        validMessage="Categoria correcta."
                        invalidMessage="Escribe entre 2 y 180 caracteres. Puedes usar letras, numeros, espacios y estos signos: . , _ + / # -"
                        maxLength={180}
                      />
                      {formErrors.newCategoryName && <div className="form-error">{formErrors.newCategoryName}</div>}
                    </div>
                  )}
                  {formErrors.id_categoria && <div className="form-error">{formErrors.id_categoria}</div>}
                </div>

                {/* Brand select dropdown with "+ Registrar nueva" option */}
                <div className="form-group">
                  <label>Marca *</label>
                  <select 
                    className="form-select" 
                    required 
                    value={modelForm.id_marca}
                    onChange={(e) => setModelForm({ ...modelForm, id_marca: e.target.value })}
                  >
                    <option value="">Seleccione...</option>
                    {marcas.map(m => <option key={m.id} value={m.id}>{m.nombreMarca}</option>)}
                    <option value="NEW_BRAND" style={{ color: 'var(--success)', fontWeight: 'bold' }}>+ Registrar nueva marca...</option>
                  </select>

                  {modelForm.id_marca === 'NEW_BRAND' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Escriba nombre de nueva marca"
                        maxLength={180}
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                      />
                      <FieldValidationHint
                        value={newBrandName}
                        isValid={liveFieldValidators.technicalText}
                        validMessage="Marca correcta."
                        invalidMessage="Escribe entre 2 y 180 caracteres. Puedes usar letras, numeros, espacios y estos signos: . , _ + / # -"
                        maxLength={180}
                      />
                      {formErrors.newBrandName && <div className="form-error">{formErrors.newBrandName}</div>}
                    </div>
                  )}
                  {formErrors.id_marca && <div className="form-error">{formErrors.id_marca}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Nombre del Modelo *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. GWS2200"
                  required 
                  maxLength={180}
                  value={modelForm.modelo}
                  onChange={(e) => setModelForm({ ...modelForm, modelo: e.target.value })}
                />
                <FieldValidationHint
                  value={modelForm.modelo}
                  isValid={liveFieldValidators.technicalText}
                  validMessage="Modelo correcto."
                  invalidMessage="Escribe entre 2 y 180 caracteres. No uses <, >, @ ni simbolos raros."
                  maxLength={180}
                />
                {formErrors.modelo && <div className="form-error">{formErrors.modelo}</div>}
              </div>

              <div className="form-group">
                <label>Código Técnico del Modelo *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. GWS 22-180 H"
                  required 
                  maxLength={180}
                  value={modelForm.codigoModelo}
                  onChange={(e) => setModelForm({ ...modelForm, codigoModelo: e.target.value })}
                />
                <FieldValidationHint
                  value={modelForm.codigoModelo}
                  isValid={liveFieldValidators.technicalText}
                  validMessage="Codigo tecnico correcto."
                  invalidMessage="Escribe entre 2 y 180 caracteres. Puedes usar letras, numeros, espacios y estos signos: . , _ + / # -"
                  maxLength={180}
                />
                {formErrors.codigoModelo && <div className="form-error">{formErrors.codigoModelo}</div>}
              </div>

              <div className="form-group">
                <label>SKU Único *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. SKU-75010324"
                  required 
                  maxLength={80}
                  value={modelForm.sku}
                  onChange={(e) => setModelForm({ ...modelForm, sku: e.target.value })}
                />
                <FieldValidationHint
                  value={modelForm.sku}
                  isValid={liveFieldValidators.sku}
                  validMessage="SKU correcto."
                  invalidMessage="Escribe entre 3 y 80 caracteres, sin espacios. Usa letras, numeros, punto, guion o guion bajo."
                  maxLength={80}
                />
                {formErrors.sku && <div className="form-error">{formErrors.sku}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Venta (S/) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    required 
                    value={modelForm.precio}
                    onChange={(e) => setModelForm({ ...modelForm, precio: e.target.value })}
                  />
                  <FieldValidationHint
                    value={modelForm.precio}
                    isValid={liveFieldValidators.price}
                    validMessage="Precio correcto."
                    invalidMessage="Escribe un precio mayor a 0. Puedes usar hasta 2 decimales."
                    limitLabel="Formato: 999.99"
                  />
                  {formErrors.precio && <div className="form-error">{formErrors.precio}</div>}
                </div>
                <div className="form-group">
                  <label>{modalMode === 'edit' ? 'Stock Actual *' : 'Stock Inicial *'}</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    value={modelForm.stock}
                    onChange={(e) => setModelForm({ ...modelForm, stock: e.target.value })}
                  />
                  <FieldValidationHint
                    value={modelForm.stock}
                    isValid={liveFieldValidators.stock}
                    validMessage="Stock correcto."
                    invalidMessage="Escribe solo numeros enteros. El minimo permitido es 0."
                    limitLabel="Entero >= 0"
                  />
                  {formErrors.stock && <div className="form-error">{formErrors.stock}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>URL de Imagen Ilustrativa (Carrusel)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. /src/assets/esmeril_gws2200.png"
                  value={modelForm.imageUrl}
                  onChange={(e) => setModelForm({ ...modelForm, imageUrl: e.target.value })}
                />
                {formErrors.imageUrl && <div className="form-error">{formErrors.imageUrl}</div>}
              </div>

              {/* Dynamic specifications list addition */}
              <div style={{ marginTop: '1rem', border: '1px dashed var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <label style={{ margin: 0, fontSize: '0.85rem' }}>Especificaciones Técnicas</label>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    onClick={() => setModelForm({ ...modelForm, specs: [...modelForm.specs, { atributo: '', valor: '' }] })}
                  >
                    + Agregar Atributo
                  </button>
                </div>
                {modelForm.specs.map((spec, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ padding: '0.5rem' }}
                      placeholder="Atributo (ej. Potencia)" 
                      value={spec.atributo}
                      onChange={(e) => {
                        const newSpecs = [...modelForm.specs];
                        newSpecs[i].atributo = e.target.value;
                        setModelForm({ ...modelForm, specs: newSpecs });
                      }}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ padding: '0.5rem' }}
                      placeholder="Valor (ej. 2200 W)" 
                      value={spec.valor}
                      onChange={(e) => {
                        const newSpecs = [...modelForm.specs];
                        newSpecs[i].valor = e.target.value;
                        setModelForm({ ...modelForm, specs: newSpecs });
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn-danger" 
                      style={{ padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => setModelForm({ ...modelForm, specs: modelForm.specs.filter((_, idx) => idx !== i) })}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {formErrors.specs && <div className="form-error">{formErrors.specs}</div>}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.8rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowModelModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-premium">
                  {modalMode === 'edit' ? 'Guardar Cambios' : 'Guardar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox zoomed modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '80%', maxHeight: '80%' }} onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Ampliación" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px' }} />
            <button 
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                color: '#ffffff',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                fontWeight: '800'
              }}
            >
              ✕ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
