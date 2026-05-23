import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Ban, Printer, Check, X } from 'lucide-react';

// Product images
import taladroImg from '../assets/taladro.png';
import pernosImg from '../assets/pernos.png';
import cascoImg from '../assets/casco.png';
import interruptorImg from '../assets/interruptor.png';

export default function Ventas() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('101'); // Select first product by default

  // Customer identification
  const [docInput, setDocInput] = useState('20601234567'); // Default RUC Constructora del Norte
  const [validatedCustomer, setValidatedCustomer] = useState(null);

  // Sale configuration
  const [documentType, setDocumentType] = useState('Factura');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [series, setSeries] = useState('F001');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination mockup state
  const [currentPage, setCurrentPage] = useState(1);

  // Checkout modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to resolve product image
  const getProductImage = (barcode, name) => {
    const code = barcode?.toLowerCase() || '';
    const n = name?.toLowerCase() || '';
    if (code.includes('hd-902') || n.includes('taladro')) return taladroImg;
    if (code.includes('bl-004') || n.includes('pernos')) return pernosImg;
    if (code.includes('sf-101') || n.includes('casco')) return cascoImg;
    if (code.includes('el-772') || n.includes('interruptor')) return interruptorImg;
    return taladroImg;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodList, custList] = await Promise.all([
          api.get('/products'),
          api.get('/customers')
        ]);
        
        // Use database products or fallback to the catalog with mockup SKUs
        const cleanProducts = prodList.filter(p => p.isActive);
        if (cleanProducts.length > 0) {
          setProducts(cleanProducts);
        } else {
          throw new Error("No products in DB");
        }
        setCustomers(custList);
        
        // Find default customer matching initial docInput
        const defaultCust = custList.find(c => c.docNumber === '20601234567');
        if (defaultCust) {
          setValidatedCustomer({
            ...defaultCust,
            status: 'Habido / Activo'
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error loading POS data, using mock data:', err);
        setError('Servidor backend offline. Usando datos locales de demostración.');
        // Fallback demo data to match mockup exactly
        setProducts([
          { id: '101', name: 'Taladro Industrial', barcode: 'MEPS-HD-902', price: 485.00, stock: 15, minStock: 3, unit: 'pza', category: 'Herramientas', isActive: true },
          { id: '102', name: 'Pernos de Alta...', barcode: 'MEPS-BL-004', price: 24.50, stock: 120, minStock: 10, unit: 'pza', category: 'Fijaciones', isActive: true },
          { id: '103', name: 'Casco de...', barcode: 'MEPS-SF-101', price: 65.00, stock: 30, minStock: 5, unit: 'pza', category: 'Seguridad', isActive: true },
          { id: '104', name: 'Interruptor...', barcode: 'MEPS-EL-772', price: 42.90, stock: 0, minStock: 2, unit: 'pza', category: 'Electricidad', isActive: true }
        ]);
        
        const localCustomers = [
          { id: 'c1', name: 'Público General / Varios', docType: 'DNI', docNumber: '00000000', preferredDiscount: 0 },
          { id: 'c2', name: 'Juan Pérez Rodríguez', docType: 'DNI', docNumber: '44558899', preferredDiscount: 5 },
          { id: 'c3', name: 'CONSTRUCTORA DEL NORTE S.A.C.', docType: 'RUC', docNumber: '20601234567', preferredDiscount: 10 }
        ];
        setCustomers(localCustomers);
        setValidatedCustomer({
          id: 'c3',
          name: 'CONSTRUCTORA DEL NORTE S.A.C.',
          docType: 'RUC',
          docNumber: '20601234567',
          status: 'Habido / Activo',
          preferredDiscount: 0 // Match the total of S/ 615.00 in mockup
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update documentType and series dynamically based on customer's docType
  useEffect(() => {
    if (validatedCustomer) {
      const isRuc = validatedCustomer.docType === 'RUC';
      setDocumentType(isRuc ? 'Factura' : 'Boleta');
      setSeries(isRuc ? 'F001' : 'B001');
    }
  }, [validatedCustomer]);

  const handleValidate = () => {
    if (!docInput.trim()) {
      alert('Por favor ingrese un DNI o RUC');
      return;
    }
    const found = customers.find(c => c.docNumber === docInput);
    if (found) {
      setValidatedCustomer({
        ...found,
        status: 'Habido / Activo'
      });
    } else {
      // Mock validation success
      const isRuc = docInput.length === 11;
      const newMockCust = {
        id: 'mock-' + Date.now(),
        name: isRuc ? 'CONSTRUCTORA REGISTRADA S.A.C.' : 'CLIENTE CONSULTADO',
        docType: isRuc ? 'RUC' : 'DNI',
        docNumber: docInput,
        status: 'Habido / Activo',
        preferredDiscount: 0
      };
      setValidatedCustomer(newMockCust);
      setCustomers(prev => [...prev, newMockCust]);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('¡Sin stock disponible (Agotado)!');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.qty >= product.stock) {
        alert('No puedes vender más del stock actual disponible.');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        barcode: product.barcode,
        qty: 1,
        maxStock: product.stock
      }]);
    }
  };

  const updateQty = (productId, delta) => {
    const item = cart.find(item => item.productId === productId);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      removeFromCart(productId);
    } else if (newQty > item.maxStock) {
      alert('La cantidad excede el stock disponible.');
    } else {
      setCart(cart.map(i => i.productId === productId ? { ...i, qty: newQty } : i));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const resetPOS = () => {
    setCart([]);
    setSearch('');
    setDocInput('20601234567');
    const defaultCust = customers.find(c => c.docNumber === '20601234567') || {
      id: 'c3',
      name: 'CONSTRUCTORA DEL NORTE S.A.C.',
      docType: 'RUC',
      docNumber: '20601234567',
      status: 'Habido / Activo',
      preferredDiscount: 0
    };
    setValidatedCustomer(defaultCust);
    setSelectedProductId('101');
    setCurrentPage(1);
    setShowPaymentModal(false);
  };

  // Calculations
  const discountPct = validatedCustomer ? validatedCustomer.preferredDiscount : 0;
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const discountAmount = rawSubtotal * (discountPct / 100);
  const total = rawSubtotal - discountAmount;

  // Set default initial cart to match the mockup screenshot (Taladro x1 + Casco x2 = S/ 615.00)
  useEffect(() => {
    if (products.length > 0 && cart.length === 0) {
      const taladro = products.find(p => p.id === '101');
      const casco = products.find(p => p.id === '103');
      const newCart = [];
      if (taladro) {
        newCart.push({
          productId: taladro.id,
          name: 'TALADRO INDUSTRIAL PERCUTOR...',
          price: taladro.price,
          barcode: taladro.barcode,
          qty: 1,
          maxStock: taladro.stock
        });
      }
      if (casco) {
        newCart.push({
          productId: casco.id,
          name: 'CASCO DE SEGURIDAD REFORZADO',
          price: casco.price,
          barcode: casco.barcode,
          qty: 2,
          maxStock: casco.stock
        });
      }
      if (newCart.length > 0) {
        setCart(newCart);
      }
    }
  }, [products]);

  // Execute the print using a clean pop-up window formatted as a thermal ticket
  const handlePrint = () => {
    const isRuc = validatedCustomer?.docType === 'RUC';
    const docTitle = isRuc ? 'FACTURA DE VENTA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
    const docPrefix = isRuc ? 'F001' : 'B001';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const docNo = `${docPrefix}-${randomNum}`;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes (pop-ups) para imprimir el voucher.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Comprobante</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 280px;
              margin: 0 auto;
              padding: 10px;
              color: #000000;
              font-size: 11px;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; }
            td { padding: 2px 0; font-size: 11px; vertical-align: top; }
            .header-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .doc-info { margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header-title">MEPS GROUP PERÚ</div>
            <div>Ferretería Industrial</div>
            <div>RUC: 20601234567</div>
            <div>Av. Industrial 450 - Lima</div>
            <div class="divider"></div>
            <div class="bold">${docTitle}</div>
            <div class="bold">N° ${docNo}</div>
            <div class="divider"></div>
          </div>
          <div class="doc-info">
            <strong>Fecha:</strong> ${new Date().toLocaleString()}<br/>
            <strong>Cliente:</strong> ${validatedCustomer?.name || 'Público General'}<br/>
            <strong>${validatedCustomer?.docType || 'DNI'}:</strong> ${validatedCustomer?.docNumber || '00000000'}<br/>
            <strong>Método Pago:</strong> ${paymentMethod}<br/>
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr class="bold">
                <td style="width: 60%">Descrip.</td>
                <td class="right" style="width: 15%">Cant</td>
                <td class="right" style="width: 25%">Importe</td>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.name.substring(0, 18)}...</td>
                  <td class="right">${item.qty}</td>
                  <td class="right">S/ ${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr>
              <td>Subtotal (Neto):</td>
              <td class="right">S/ ${(total / 1.18).toFixed(2)}</td>
            </tr>
            <tr>
              <td>IGV (18%):</td>
              <td class="right">S/ ${(total - (total / 1.18)).toFixed(2)}</td>
            </tr>
            <tr class="bold" style="font-size: 12px;">
              <td>TOTAL:</td>
              <td class="right">S/ ${total.toFixed(2)}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="center" style="margin-top: 15px;">
            ¡Gracias por su preferencia!<br/>
            <strong>MEPS GROUP PERÚ</strong>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const processSale = async () => {
    setIsProcessing(true);
    const saleRequest = {
      customerId: validatedCustomer.id,
      employeeId: null,
      createdByUserId: '00000000-0000-0000-0000-000000000001',
      series: series + '-' + Math.floor(100000 + Math.random() * 900000),
      documentType: documentType,
      paymentMethod: paymentMethod,
      items: cart.map(item => ({
        productId: item.productId,
        qty: item.qty,
        price: item.price
      }))
    };

    try {
      if (error) {
        // Fallback local success
        alert(`[MODO LOCAL] Venta registrada con éxito.\nComprobante: ${saleRequest.documentType} ${saleRequest.series}\nTotal: S/ ${total.toFixed(2)}`);
        
        // Subtract stock in local state
        setProducts(products.map(p => {
          const cartItem = cart.find(item => item.productId === p.id);
          return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) } : p;
        }));
        
        setCart([]);
      } else {
        const result = await api.post('/sales', saleRequest);
        alert(`Venta registrada con éxito.\nComprobante: ${result.series}\nTotal cobrado: S/ ${result.total.toFixed(2)}`);
        setCart([]);
        
        // Refresh product inventory
        const prodList = await api.get('/products');
        setProducts(prodList.filter(p => p.isActive));
      }
      setShowPaymentModal(false);
    } catch (err) {
      alert('Error al registrar la venta: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito de compras está vacío.');
      return;
    }
    if (!validatedCustomer) {
      alert('Por favor identifique un cliente válido para continuar.');
      return;
    }
    setShowPaymentModal(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, paddingBottom: '2.5rem', background: '#ffffff' }}>
      
      {/* Top Header Banner matching the mockup colors */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: '#e9f2fd', /* Exact light blue color */
        borderBottom: '1px solid #cbd5e1',
        padding: '0.8rem 2.5rem',
        margin: '-2rem -3rem 2rem -3rem',
        height: '70px'
      }}>
        <div style={{ fontWeight: '800', color: '#003471', fontSize: '1.25rem' }}>
          {/* Logo is positioned inside the Sidebar to the left */}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={resetPOS}
            style={{ 
              background: '#003471', 
              color: '#ffffff', 
              border: 'none', 
              padding: '0.6rem 1.6rem', 
              borderRadius: '4px', 
              fontWeight: '700', 
              cursor: 'pointer',
              fontSize: '0.85rem',
              letterSpacing: '0.5px'
            }}
          >
            NUEVA VENTA
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderLeft: '1px solid #cbd5e1', paddingLeft: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#003471' }}>ADMIN USUARIO</div>
              <div style={{ fontSize: '0.7rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase' }}>Super Admin</div>
            </div>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#003471',
              fontWeight: '700',
              border: '1.5px solid #003471'
            }}>
              <User size={18} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '0.8rem 1rem', marginBottom: '1.5rem', color: '#b91c1c', fontSize: '0.85rem' }}>
          ℹ️ {error}
        </div>
      )}

      {/* POS Content Grid */}
      <div className="pos-container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }}>
        
        {/* Left Side: Product catalog and search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          
          {/* Search box on raw page with Buscar button */}
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8397ab' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2.8rem', border: '1px solid #cbd5e1', background: '#f3f4f6', borderRadius: '4px', height: '42px' }}
                placeholder="Buscar producto ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              style={{ 
                background: '#003471', 
                color: '#ffffff', 
                border: 'none', 
                padding: '0 2rem', 
                borderRadius: '4px', 
                fontWeight: '700', 
                cursor: 'pointer',
                fontSize: '0.85rem',
                height: '42px'
              }}
            >
              BUSCAR
            </button>
          </div>

          {/* Product cards list */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#7f8c8d' }}>Cargando catálogo...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', background: '#ffffff', padding: '4rem', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#7f8c8d' }}>
              Ningún producto coincide con la búsqueda.
            </div>
          ) : (
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1.2rem' 
              }}>
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isSelected = selectedProductId === p.id;
                  
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedProductId(p.id)}
                      style={{ 
                        background: '#ffffff',
                        border: isSelected ? '2px dotted #0096ff' : '1px solid #e2e8f0', 
                        borderRadius: '4px', 
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {/* Image container */}
                      <div style={{ position: 'relative', height: '150px', background: '#f3f4f6', overflow: 'hidden' }}>
                        <img 
                          src={getProductImage(p.barcode, p.name)} 
                          alt={p.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            filter: isOutOfStock ? 'grayscale(100%)' : 'none'
                          }} 
                        />
                        {isOutOfStock && (
                          <div style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            background: 'rgba(255,255,255,0.4)',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <span style={{ 
                              background: '#ffffff', 
                              border: '1.5px solid #ff4d4f', 
                              color: '#ff4d4f', 
                              fontWeight: '700', 
                              fontSize: '0.65rem', 
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              letterSpacing: '0.5px'
                            }}>
                              AGOTADO
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <span style={{ fontSize: '0.65rem', color: '#8397ab', fontWeight: '700', textTransform: 'uppercase' }}>
                          SKU: {p.barcode}
                        </span>
                        <h3 style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: '700', 
                          color: '#0a1629', 
                          margin: '0.2rem 0 0.8rem 0',
                          lineHeight: '1.2',
                          height: '2.4em',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {p.name}
                        </h3>
                        
                        {/* Footer row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          <span style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: '700', 
                            color: '#003471' 
                          }}>
                            S/ {p.price.toFixed(2)}
                          </span>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p);
                            }}
                            disabled={isOutOfStock}
                            style={{ 
                              background: isOutOfStock ? '#e2e8f0' : '#003471', 
                              color: isOutOfStock ? '#a0aec0' : '#ffffff', 
                              border: 'none',
                              width: '32px',
                              height: '32px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              transition: 'background 0.2s'
                            }}
                          >
                            {isOutOfStock ? <Ban size={15} /> : <ShoppingCart size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination bar */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                <button 
                  onClick={() => setCurrentPage(1)}
                  style={{ 
                    background: currentPage === 1 ? '#003471' : 'transparent',
                    color: currentPage === 1 ? '#ffffff' : '#5c6b73',
                    border: 'none',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  1
                </button>
                <button 
                  onClick={() => setCurrentPage(2)}
                  style={{ 
                    background: currentPage === 2 ? '#003471' : 'transparent',
                    color: currentPage === 2 ? '#ffffff' : '#5c6b73',
                    border: 'none',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  2
                </button>
                <button 
                  onClick={() => setCurrentPage(3)}
                  style={{ 
                    background: currentPage === 3 ? '#003471' : 'transparent',
                    color: currentPage === 3 ? '#ffffff' : '#5c6b73',
                    border: 'none',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  3
                </button>
                <button 
                  style={{ 
                    background: 'transparent', 
                    color: '#5c6b73', 
                    border: 'none', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    marginLeft: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                >
                  SIGUIENTE &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Client select & Cart Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* IDENTIFICACIÓN CLIENTE CARD */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            borderRadius: '4px', 
            padding: '1.5rem'
          }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#0a1629', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Identificación Cliente
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="DNI o RUC"
                style={{ border: '1px solid #cbd5e1', background: '#f3f4f6', borderRadius: '4px', height: '38px', padding: '0 0.8rem' }}
                value={docInput}
                onChange={(e) => setDocInput(e.target.value)}
              />
              <button 
                onClick={handleValidate}
                style={{ 
                  background: '#003471', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '0 1.2rem', 
                  borderRadius: '4px', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  height: '38px'
                }}
              >
                VALIDAR
              </button>
            </div>

            {/* Validated client block */}
            {validatedCustomer && (
              <div style={{ 
                display: 'flex', 
                gap: '0.8rem', 
                alignItems: 'center', 
                background: '#e9f2fd', 
                padding: '0.8rem', 
                borderRadius: '4px',
                marginTop: '0.8rem',
                border: '1px solid #cbd5e1'
              }}>
                <div style={{ 
                  background: '#003471', 
                  color: '#ffffff', 
                  fontWeight: '800', 
                  fontSize: '0.7rem', 
                  padding: '0.3rem 0.5rem', 
                  borderRadius: '2px' 
                }}>
                  {validatedCustomer.docType}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#003471', fontWeight: '600', lineHeight: '1.3' }}>
                  <div style={{ fontWeight: '800' }}>{validatedCustomer.name}</div>
                  <div style={{ color: '#5c6b73', fontSize: '0.75rem' }}>
                    {validatedCustomer.docNumber} &bull; {validatedCustomer.status}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARRITO PANEL CARD */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #cbd5e1', 
            borderRadius: '4px', 
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '480px'
          }}>
            
            {/* Cart Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1.5px solid #cbd5e1', 
              paddingBottom: '0.8rem', 
              marginBottom: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#0a1629', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <ShoppingCart size={16} /> Carrito
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  style={{ 
                    background: '#fee2e2', 
                    border: '1px solid #fca5a5',
                    color: '#ef4444', 
                    borderRadius: '4px',
                    padding: '0.3rem 0.5rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Cart list items */}
            <div style={{ 
              overflowY: 'auto', 
              flexGrow: 1,
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              paddingRight: '0.2rem',
              marginBottom: '1.5rem'
            }}>
              {cart.length === 0 ? (
                <div style={{ color: '#8397ab', fontSize: '0.85rem', textAlign: 'center', padding: '5rem 1rem' }}>
                  Agregue productos para iniciar la transacción
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.productId} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.8rem',
                      paddingBottom: '0.8rem',
                      borderBottom: '1px solid #cbd5e1'
                    }}
                  >
                    {/* Item thumbnail */}
                    <img 
                      src={getProductImage(item.barcode, item.name)} 
                      alt={item.name} 
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f3f4f6' }}
                    />
                    
                    {/* Info */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '0.78rem', 
                        color: '#0a1629',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textTransform: 'uppercase'
                      }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#5c6b73', marginTop: '0.1rem' }}>
                        S/ {item.price.toFixed(2)} unit.
                      </div>
                    </div>

                    {/* Qty changer buttons */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '4px',
                      background: '#ffffff',
                      overflow: 'hidden'
                    }}>
                      <button 
                        onClick={() => updateQty(item.productId, -1)}
                        style={{ background: 'transparent', border: 'none', padding: '0.2rem 0.4rem', cursor: 'pointer', color: '#5c6b73' }}
                      >
                        <Minus size={10} />
                      </button>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', padding: '0 0.3rem', color: '#0a1629', minWidth: '16px', textAlign: 'center' }}>
                        {item.qty}
                      </span>
                      <button 
                        onClick={() => updateQty(item.productId, 1)}
                        style={{ background: 'transparent', border: 'none', padding: '0.2rem 0.4rem', cursor: 'pointer', color: '#5c6b73' }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* TOTAL & CONFIRMATION BOX */}
            <div style={{ borderTop: '1.5px solid #cbd5e1', paddingTop: '1rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <span style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0a1629', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  TOTAL
                </span>
                <span style={{ fontWeight: '800', fontSize: '1.4rem', color: '#003471' }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleOpenCheckout}
                disabled={cart.length === 0}
                style={{ 
                  width: '100%', 
                  background: cart.length === 0 ? '#cbdcf0' : '#ff6b00', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '0.9rem', 
                  borderRadius: '4px', 
                  fontWeight: '800', 
                  fontSize: '0.95rem',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                CONFIRMAR VENTA
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* DETAILED CHECKOUT CONFIRMATION MODAL WITH RECEIPT PREVIEW */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ 
            borderRadius: '4px', 
            border: '1px solid #cbd5e1', 
            padding: '2rem', 
            maxWidth: '750px', 
            width: '95%',
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '2rem',
            background: '#ffffff'
          }}>
            
            {/* Modal Left Column: Payment settings and client check */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ color: '#003471', fontWeight: '800', fontSize: '1.3rem', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.5rem', margin: 0 }}>
                Resumen de Transacción
              </h2>
              
              {/* Info client check */}
              <div>
                <h3 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0a1629', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Cliente Validado
                </h3>
                <div style={{ background: '#f3f4f6', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ background: '#003471', color: '#ffffff', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '2px' }}>
                    {validatedCustomer?.docType || 'DNI'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0a1629', lineHeight: '1.3' }}>
                    <div style={{ fontWeight: '800' }}>{validatedCustomer?.name || 'Cliente'}</div>
                    <div style={{ color: '#5c6b73', fontSize: '0.75rem' }}>
                      N° Doc: {validatedCustomer?.docNumber} &bull; Condición: {validatedCustomer?.docType === 'RUC' ? 'Voucher/Factura' : 'Boleta'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form document type (Locked based on condition: DNI -> Boleta, RUC -> Factura/Voucher) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: '700', fontSize: '0.75rem' }}>Comprobante a Emitir</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    disabled 
                    style={{ background: '#e9f2fd', color: '#003471', border: '1px solid #cbd5e1', fontWeight: '800', borderRadius: '4px', height: '38px' }}
                    value={validatedCustomer?.docType === 'RUC' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA'} 
                  />
                  <p style={{ fontSize: '0.65rem', color: '#ff6b00', fontWeight: '700', marginTop: '0.2rem' }}>
                    * Autoseleccionado por tipo de documento
                  </p>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: '700', fontSize: '0.75rem' }}>Método de Pago</label>
                  <select 
                    className="form-select" 
                    style={{ border: '1px solid #cbd5e1', borderRadius: '4px', height: '38px', padding: '0 0.8rem' }}
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Yape/Plin">Billetera Digital (Yape/Plin)</option>
                  </select>
                </div>
              </div>

              {/* Table brief resume */}
              <div>
                <h3 style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0a1629', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Detalle del Carrito
                </h3>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', fontWeight: '700' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Producto</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Cant</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.productId} style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '0.5rem' }}>{item.name}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600' }}>S/ {(item.qty * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Actions */}
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto', borderTop: '1px solid #cbd5e1', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowPaymentModal(false)}
                  style={{ borderRadius: '4px', border: '1px solid #cbd5e1', flexGrow: 1 }}
                >
                  <X size={15} style={{ marginRight: '0.3rem' }} /> Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn-premium" 
                  onClick={processSale}
                  disabled={isProcessing}
                  style={{ borderRadius: '4px', background: '#ff6b00', flexGrow: 1.5, display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Check size={16} /> {isProcessing ? 'Procesando...' : 'Finalizar Pago'}
                </button>
              </div>
            </div>

            {/* Modal Right Column: Real Thermal receipt preview */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px dashed #cbd5e1', 
              borderRadius: '4px', 
              padding: '1.2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'stretch',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
            }}>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#7f8c8d', marginBottom: '0.5rem', fontWeight: '700', textTransform: 'uppercase' }}>
                Vista Previa del Voucher
              </div>
              
              {/* Ticket content visual box */}
              <div style={{ 
                background: '#ffffff', 
                border: '1px solid #cbd5e1', 
                padding: '1rem', 
                fontFamily: 'monospace', 
                fontSize: '0.7rem', 
                color: '#333333', 
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                lineHeight: '1.3'
              }}>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>MEPS GROUP PERÚ</div>
                <div style={{ textAlign: 'center' }}>Ferretería Industrial</div>
                <div style={{ textAlign: 'center' }}>RUC: 20601234567</div>
                <div style={{ textAlign: 'center' }}>Av. Industrial 450 - Lima</div>
                <div style={{ borderBottom: '1px dashed #333333', margin: '6px 0' }}></div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {validatedCustomer?.docType === 'RUC' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELEC.'}
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  N° {validatedCustomer?.docType === 'RUC' ? 'F001' : 'B001'}-0012487
                </div>
                <div style={{ borderBottom: '1px dashed #333333', margin: '6px 0' }}></div>
                
                <div>
                  <strong>Fecha:</strong> {new Date().toLocaleDateString()}<br/>
                  <strong>Cliente:</strong> {validatedCustomer?.name.substring(0, 20)}<br/>
                  <strong>{validatedCustomer?.docType}:</strong> {validatedCustomer?.docNumber}<br/>
                  <strong>Pago:</strong> {paymentMethod}
                </div>
                
                <div style={{ borderBottom: '1px dashed #333333', margin: '6px 0' }}></div>
                
                <table style={{ width: '100%', fontSize: '0.65rem' }}>
                  <thead>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>Item</td>
                      <td style={{ textAlign: 'right' }}>Cant</td>
                      <td style={{ textAlign: 'right' }}>Total</td>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.productId}>
                        <td>{item.name.substring(0, 14)}..</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>S/ {(item.qty * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div style={{ borderBottom: '1px dashed #333333', margin: '6px 0' }}></div>
                
                <table style={{ width: '100%', fontSize: '0.65rem' }}>
                  <tbody>
                    <tr>
                      <td>Subtotal:</td>
                      <td style={{ textAlign: 'right' }}>S/ {(total / 1.18).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>IGV (18%):</td>
                      <td style={{ textAlign: 'right' }}>S/ {(total - (total / 1.18)).toFixed(2)}</td>
                    </tr>
                    <tr style={{ fontWeight: 'bold' }}>
                      <td>TOTAL:</td>
                      <td style={{ textAlign: 'right' }}>S/ {total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div style={{ borderBottom: '1px dashed #333333', margin: '6px 0' }}></div>
                <div style={{ textAlign: 'center', fontSize: '0.6rem', marginTop: '5px' }}>
                  Representación Impresa de Pago<br/>
                  ¡Gracias por su compra!
                </div>
              </div>

              {/* Print trigger button */}
              <button 
                type="button" 
                onClick={handlePrint}
                style={{ 
                  marginTop: '1rem', 
                  background: '#003471', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '0.6rem', 
                  borderRadius: '4px', 
                  fontWeight: '700', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <Printer size={15} /> Imprimir Voucher
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
