import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';
import { Search, Plus, Minus, Trash2, ShoppingCart, Ban, Check, X, CreditCard, Landmark, Smartphone, KeyRound, Upload, DollarSign } from 'lucide-react';
import { resolveCatalogImageUrl } from '../services/catalogAssets';

// Product images
import taladroImg from '../assets/taladro.png';
import pernosImg from '../assets/pernos.png';
import cascoImg from '../assets/casco.png';
import interruptorImg from '../assets/interruptor.png';
import esmerilGws2200Img from '../assets/esmeril_gws2200.png';
import esmerilGws750Img from '../assets/esmeril_gws750.png';
import taladroDewaltImg from '../assets/taladro_dewalt.png';
import rotomartilloBoschImg from '../assets/rotomartillo_bosch.png';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value) => UUID_PATTERN.test(String(value || ''));
const getAuthenticatedUserId = () => {
  try {
    return JSON.parse(localStorage.getItem('current_user') || 'null')?.userId || null;
  } catch {
    return null;
  }
};

export default function Ventas() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [posCatalog, setPosCatalog] = useState([]);
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
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentEvidenceName, setPaymentEvidenceName] = useState('');
  const [offlineApprovalKey, setOfflineApprovalKey] = useState('');
  const [terminalConnected, setTerminalConnected] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [series, setSeries] = useState('F001');
  const [operationType, setOperationType] = useState('Venta Directa');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);

  // Pagination mockup state
  const [currentPage, setCurrentPage] = useState(1);

  // Checkout modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Inventory models and suppliers states
  const [modelos, setModelos] = useState([]);
  const [especificaciones, setEspecificaciones] = useState([]);
  const [productosImagenes, setProductosImagenes] = useState([]);

  // Variant selector modal states
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState(null);
  const [variantSearch, setVariantSearch] = useState('');
  const [activeVariantBrand, setActiveVariantBrand] = useState('ALL');
  const [transferReferenceHint] = useState(() => `TRF-${Date.now().toString().slice(-6)}`);

  // Helper to resolve product image
  const getProductImage = (barcode, name) => {
    const code = barcode?.toLowerCase() || '';
    const n = name?.toLowerCase() || '';
    if (n.includes('gbh') || n.includes('rotomartillo')) return rotomartilloBoschImg;
    if (n.includes('dcd771') || code.includes('30910482')) return taladroDewaltImg;
    if (n.includes('bosch')) return esmerilGws2200Img;
    if (n.includes('makita')) return esmerilGws750Img;
    if (n.includes('dewalt') || code.includes('hd-902') || n.includes('taladro')) return taladroImg;
    if (code.includes('bl-004') || n.includes('pernos')) return pernosImg;
    if (code.includes('sf-101') || n.includes('casco')) return cascoImg;
    if (code.includes('el-772') || n.includes('interruptor')) return interruptorImg;
    return taladroImg;
  };

  const getModelImageFallback = (model) => {
    const brand = model?.marca?.nombreMarca?.toLowerCase() || '';
    const name = `${model?.modelo || ''} ${model?.codigoModelo || ''}`.toLowerCase();

    if (name.includes('gbh') || name.includes('rotomartillo')) return rotomartilloBoschImg;
    if (brand.includes('dewalt') || name.includes('dcd')) return taladroDewaltImg;
    if (brand.includes('bosch') || name.includes('gws')) return esmerilGws2200Img;
    if (brand.includes('makita') || name.includes('ga') || name.includes('m0900')) return esmerilGws750Img;
    return taladroImg;
  };

  const getResolvedProductImage = (product) => {
    return resolveCatalogImageUrl(product?.imageUrl, getProductImage(product?.barcode, product?.name));
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodList, posCatalogList, custList, modelList, specList, imgList, bankList] = await Promise.all([
          api.get('/products'),
          api.get('/modelos/pos-catalog'),
          api.get('/customers'),
          api.get('/modelos'),
          api.get('/especificaciones'),
          api.get('/imagenes-modelos'),
          api.get('/payment-config/bank-accounts')
        ]);

        setProducts(prodList.filter((product) => product.isActive));
        setPosCatalog(posCatalogList);
        setCustomers(custList);
        setModelos(modelList);
        setEspecificaciones(specList);
        setProductosImagenes(imgList);
        setBankAccounts(bankList);
        setSelectedBankAccountId(bankList[0]?.id || '');

        const defaultCustomer = custList.find((customer) => customer.docNumber === docInput.replace(/\D/g, ''));
        setValidatedCustomer(defaultCustomer ? { ...defaultCustomer, status: 'Habido / Activo' } : null);
        setError(null);
      } catch {
        setError('No se pudo cargar datos desde el backend. Las operaciones estan deshabilitadas.');
        setProducts([]);
        setPosCatalog([]);
        setCustomers([]);
        setValidatedCustomer(null);
        setModelos([]);
        setEspecificaciones([]);
        setProductosImagenes([]);
        setBankAccounts([]);
        setSelectedBankAccountId('');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update documentType and series dynamically based on customer's docType
  useEffect(() => {
    if (validatedCustomer) {
      const timer = window.setTimeout(() => {
        const isRuc = validatedCustomer.docType === 'RUC';
        setDocumentType(isRuc ? 'Factura' : 'Boleta');
        setSeries(isRuc ? 'F001' : 'B001');
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [validatedCustomer]);

  const handleValidate = async () => {
    if (!docInput.trim()) {
      alert('Por favor ingrese un DNI o RUC');
      return;
    }
    const document = docInput.replace(/\D/g, '');
    if (![8, 11].includes(document.length)) {
      alert('Ingrese un DNI de 8 digitos o un RUC de 11 digitos.');
      return;
    }

    const found = customers.find(c => c.docNumber === document);
    if (found) {
      setValidatedCustomer({
        ...found,
        status: 'Habido / Activo'
      });
      return;
    }

    setCustomerLookupLoading(true);
    try {
      const customer = await api.get(`/customer-lookup/${document}`);
      const normalizedCustomer = {
        ...customer,
        status: customer.status || customer.condition || 'Validado'
      };
      setValidatedCustomer(normalizedCustomer);
      setCustomers((prev) => [
        ...prev.filter((item) => item.docNumber !== normalizedCustomer.docNumber),
        normalizedCustomer
      ]);
    } catch (err) {
      alert('No se pudo consultar datos reales del cliente: ' + err.message);
    } finally {
      setCustomerLookupLoading(false);
    }
  };

  const getCatalogProducts = () => {
    if (posCatalog.length > 0) {
      return posCatalog.map((product) => ({
        id: product.id,
        name: product.name,
        barcode: product.sku,
        price: Number(product.price || 0),
        stock: Number(product.stock || 0),
        isModel: true,
        brandName: product.brand,
        model: product.model,
        imageUrl: product.imageUrl || '',
      }));
    }

    return modelos.map((model) => {
      const brandName = model.marca?.nombreMarca || '';
      const modelName = model.modelo || '';
      const modelImages = productosImagenes.filter((img) => img.productoModelo?.id === model.id);
      return {
        id: model.id,
        name: `${brandName} ${modelName}`.trim(),
        barcode: model.sku,
        price: Number(model.precio || 0),
        stock: Number(model.stock || 0),
        isModel: true,
        brandName,
        model: model.codigoModelo,
        imageUrl: modelImages[0]?.urlImagen || '',
      };
    });
  };

  const handleCardClick = (product) => {
    if (!product) return;
    setSelectedProductId(product.id);
    if (product.isBrandCard) {
      setSelectedProductForVariant(product);
      setVariantSearch('');
      setActiveVariantBrand(product.brandId);
      setShowVariantModal(true);
    } else {
      addToCart(product);
    }
  };

  const addModelToCart = (model) => {
    if (model.stock <= 0) {
      alert('¡Sin stock disponible para este modelo!');
      return;
    }
    
    setIsCartOpen(true);

    const name = `${model.marca?.nombreMarca} - ${model.modelo} (${model.codigoModelo})`;
    const existingItem = cart.find(item => item.productId === model.id);
    
    if (existingItem) {
      if (existingItem.qty >= model.stock) {
        alert('No puedes vender más del stock actual disponible.');
        return;
      }
      setCart(cart.map(item => 
        item.productId === model.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, {
        productId: model.id,
        name: name,
        price: model.precio,
        barcode: model.sku,
        qty: 1,
        maxStock: model.stock,
        isModel: true,
        imageUrl: productosImagenes.find((img) => img.productoModelo?.id === model.id)?.urlImagen || ''
      }]);
    }
    
    setShowVariantModal(false);
  };

  const ensureProductForModel = async (model) => {
    // 1. Fetch current products
    const currentProducts = await api.get('/products');
    
    // 2. Find if a product with barcode equal to model's SKU already exists
    const existing = currentProducts.find(p => p.barcode === model.sku);
    if (existing) {
      return existing;
    }
    
    // 3. If not, check/create supplier
    let supplierId;
    const currentSuppliers = await api.get('/suppliers');
    if (currentSuppliers.length > 0) {
      supplierId = currentSuppliers[0].id;
    } else {
      const newSupplier = await api.post('/suppliers', {
        name: 'PROVEEDOR GENERAL S.A.C.',
        ruc: '20601111111',
        contact: 'Contacto de Ventas',
        phone: '999888777',
        email: 'proveedor@general.com'
      });
      supplierId = newSupplier.id;
    }
    
    // 4. Create product in products table
    const newProduct = await api.post('/products', {
      name: `${model.marca?.nombreMarca} - ${model.modelo} (${model.codigoModelo})`,
      barcode: model.sku,
      category: model.categoria?.nombreCategoria || 'Herramientas',
      unit: 'pza',
      description: `Creado automáticamente desde POS para la variante ${model.modelo}`,
      cost: model.precio * 0.7,
      price: model.precio,
      stock: model.stock,
      minStock: 2,
      imageUrl: productosImagenes.find((img) => img.productoModelo?.id === model.id)?.urlImagen || '',
      supplierId: supplierId
    });
    
    return newProduct;
  };

  const ensureProductForCartItem = async (item) => {
    if (isUuid(item.productId)) {
      return { id: item.productId };
    }

    const currentProducts = await api.get('/products');
    const existing = currentProducts.find(p => p.barcode === item.barcode);
    if (existing) {
      return existing;
    }

    let supplierId;
    const currentSuppliers = await api.get('/suppliers');
    if (currentSuppliers.length > 0) {
      supplierId = currentSuppliers[0].id;
    } else {
      const newSupplier = await api.post('/suppliers', {
        name: 'PROVEEDOR GENERAL S.A.C.',
        ruc: '20601111111',
        contact: 'Contacto de Ventas',
        phone: '999888777',
        email: 'proveedor@general.com'
      });
      supplierId = newSupplier.id;
    }

    return api.post('/products', {
      name: item.name,
      barcode: item.barcode || `POS-${Date.now()}`,
      category: 'Venta POS',
      unit: 'pza',
      description: 'Creado automaticamente desde POS para venta',
      cost: item.price * 0.7,
      price: item.price,
      stock: item.maxStock || item.qty,
      minStock: 1,
      imageUrl: item.imageUrl || '',
      supplierId
    });
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('¡Sin stock disponible (Agotado)!');
      return;
    }
    
    // Auto-open shopping cart drawer on item addition
    setIsCartOpen(true);

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
        maxStock: product.stock,
        imageUrl: product.imageUrl || ''
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

  // Calculations
  const discountPct = validatedCustomer ? validatedCustomer.preferredDiscount : 0;
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const discountAmount = rawSubtotal * (discountPct / 100);
  const total = rawSubtotal - discountAmount;

  const selectedBankAccount = bankAccounts.find((account) => account.id === selectedBankAccountId) || bankAccounts[0];
  const customerCondition = validatedCustomer?.docType === 'RUC' ? 'Factura electronica' : 'Boleta de venta';

  const resetPaymentFields = () => {
    setPaymentReference('');
    setPaymentEvidenceName('');
    setOfflineApprovalKey('');
    setTerminalConnected(false);
    setSelectedBankAccountId(bankAccounts[0]?.id || '');
  };

  const ensureCustomerForOnlineSale = async () => {
    if (!validatedCustomer) {
      throw new Error('Por favor identifique un cliente válido para registrar la venta.');
    }

    if (isUuid(validatedCustomer.id)) {
      return validatedCustomer;
    }

    const existingCustomer = customers.find((customer) =>
      isUuid(customer.id) && customer.docNumber === validatedCustomer.docNumber
    );
    if (existingCustomer) {
      const resolvedCustomer = { ...existingCustomer, status: validatedCustomer.status || 'Habido / Activo' };
      setValidatedCustomer(resolvedCustomer);
      return resolvedCustomer;
    }

    const createdCustomer = await api.post('/customers', {
      name: validatedCustomer.name || 'Cliente POS',
      docType: validatedCustomer.docType || (String(validatedCustomer.docNumber || '').length === 11 ? 'RUC' : 'DNI'),
      docNumber: validatedCustomer.docNumber,
      phone: validatedCustomer.phone || '',
      email: validatedCustomer.email || '',
      address: validatedCustomer.address || '',
      preferredDiscount: validatedCustomer.preferredDiscount || 0
    });

    const resolvedCustomer = { ...createdCustomer, status: validatedCustomer.status || 'Habido / Activo' };
    setCustomers((prev) => [
      ...prev.filter((customer) => customer.docNumber !== resolvedCustomer.docNumber),
      resolvedCustomer
    ]);
    setValidatedCustomer(resolvedCustomer);
    return resolvedCustomer;
  };

  const getPaymentMethodMeta = () => {
    switch (paymentMethod) {
      case 'Tarjeta':
        return {
          icon: CreditCard,
          title: 'Terminal POS',
          detail: 'Confirma que el terminal este conectado y registra el codigo de aprobacion.'
        };
      case 'Izipay':
        return {
          icon: CreditCard,
          title: 'Izipay',
          detail: 'Usa Izipay Checkout/POS y registra la autorizacion devuelta por la pasarela.'
        };
      case 'Niubiz':
        return {
          icon: CreditCard,
          title: 'Niubiz',
          detail: 'Usa Niubiz para tarjeta/POS y registra la autorizacion devuelta por la pasarela.'
        };
      case 'Transferencia':
        return {
          icon: Landmark,
          title: 'Transferencia bancaria',
          detail: 'Registra la operacion bancaria y adjunta la constancia antes de generar el pedido.'
        };
      case 'Yape':
      case 'Plin':
        return {
          icon: Smartphone,
          title: `${paymentMethod} / billetera movil`,
          detail: 'Registra la operacion recibida y adjunta la constancia del pago.'
        };
      case 'Llave Offline':
        return {
          icon: KeyRound,
          title: 'Llave offline',
          detail: 'Usa un codigo de autorizacion emitido fuera de linea por caja o administracion.'
        };
      default:
        return {
          icon: DollarSign,
          title: 'Pago en efectivo',
          detail: 'El pago se confirma en caja antes de imprimir y registrar la operacion.'
        };
    }
  };

  const validatePaymentBeforeCommit = () => {
    if (total <= 0) {
      throw new Error('El total a pagar debe ser mayor a cero.');
    }

    if (paymentMethod === 'Tarjeta') {
      if (!terminalConnected) {
        throw new Error('Conecta o confirma el terminal POS antes de cobrar con tarjeta.');
      }
      if (paymentReference.trim().length < 4) {
        throw new Error('Registra el codigo de aprobacion de la tarjeta.');
      }
    }

    if (['Izipay', 'Niubiz'].includes(paymentMethod)) {
      if (!terminalConnected) {
        throw new Error(`Confirma que ${paymentMethod} Checkout/POS esta disponible antes de cobrar.`);
      }
      if (paymentReference.trim().length < 4) {
        throw new Error(`Registra el numero de operacion o autorizacion de ${paymentMethod}.`);
      }
    }

    if (['Transferencia', 'Yape', 'Plin'].includes(paymentMethod)) {
      if (paymentMethod === 'Transferencia' && !selectedBankAccount) {
        throw new Error('Selecciona una cuenta bancaria destino para la transferencia.');
      }
      if (paymentReference.trim().length < 4) {
        throw new Error(`Registra el numero de operacion de ${paymentMethod}.`);
      }
      if (!paymentEvidenceName) {
        throw new Error(`Adjunta la constancia de pago de ${paymentMethod}.`);
      }
    }

    if (paymentMethod === 'Llave Offline' && offlineApprovalKey.trim().length < 6) {
      throw new Error('Registra una llave offline valida de al menos 6 caracteres.');
    }

    return {
      method: paymentMethod,
      status: 'APROBADO',
      reference: paymentMethod === 'Llave Offline' ? offlineApprovalKey.trim() : paymentReference.trim(),
      evidenceName: paymentEvidenceName,
      bankAccount: paymentMethod === 'Transferencia' ? selectedBankAccount : null,
      terminalConnected: ['Tarjeta', 'Izipay', 'Niubiz'].includes(paymentMethod) ? terminalConnected : undefined,
      approvedAt: new Date().toISOString(),
      amount: total
    };
  };

  // Load quotation data passed from the quotations module.
  useEffect(() => {
    const pending = location.state?.quotation;
    if (products.length > 0 && pending) {
      setCart(pending.items || []);
      if (pending.customer) {
        setValidatedCustomer(pending.customer);
        setDocInput(pending.customer.docNumber);
      }
      window.history.replaceState({}, document.title);
    }
  }, [products, location.state]);

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
  void handlePrint;

  const handlePrintOrderTicket = (order) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert('Por favor permita las ventanas emergentes (pop-ups) para imprimir el comprobante.');
      return;
    }

    const itemsRows = order.items.map(item => `
      <tr>
        <td>${item.name.substring(0, 18)}...</td>
        <td style="text-align: right">${parseInt(item.qty)}</td>
        <td style="text-align: right">S/ ${parseFloat(item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Ticket de Pedido</title>
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
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; }
            td { padding: 2px 0; font-size: 11px; vertical-align: top; }
            .header-title { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header-title">MEPS GROUP PERÚ</div>
            <div>Ferretería Industrial</div>
            <div>RUC: 20601234567</div>
            <div class="divider"></div>
            <div class="bold">COMPROBANTE DE PEDIDO</div>
            <div class="bold">N° ${order.docNumber}</div>
            <div class="divider"></div>
          </div>
          <div>
            <strong>Fecha:</strong> ${new Date(order.date).toLocaleString()}<br/>
            <strong>Cliente:</strong> ${order.customer.name}<br/>
            <strong>${order.customer.docType}:</strong> ${order.customer.docNumber}<br/>
            <strong>Método Pago:</strong> ${order.paymentMethod}<br/>
            <strong>Estado:</strong> PENDIENTE DE DESPACHO<br/>
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr class="bold">
                <td style="width: 60%">Descrip.</td>
                <td style="text-align: right; width: 15%">Cant</td>
                <td style="text-align: right; width: 25%">Importe</td>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div class="divider"></div>
          <table>
            <tr>
              <td>Subtotal (Neto):</td>
              <td style="text-align: right">S/ ${parseFloat(order.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td>IGV (18%):</td>
              <td style="text-align: right">S/ ${parseFloat(order.igv).toFixed(2)}</td>
            </tr>
            <tr class="bold" style="font-size: 12px;">
              <td>TOTAL:</td>
              <td style="text-align: right">S/ ${parseFloat(order.total).toFixed(2)}</td>
            </tr>
          </table>
          <div class="divider"></div>
          <div class="center" style="margin-top: 15px;">
            Este ticket es un comprobante de PEDIDO.<br/>
            Conserve este documento para el despacho.<br/>
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
    try {
      const paymentApproval = validatePaymentBeforeCommit();

      if (operationType === 'Pedido') {
        const orderDocNumber = `PED-${Math.floor(100000 + Math.random() * 900000)}`;
        const order = {
          id: `ped_${Date.now()}`,
          docNumber: orderDocNumber,
          date: new Date().toISOString(),
          customer: {
            id: validatedCustomer.id,
            name: validatedCustomer.name,
            docType: validatedCustomer.docType,
            docNumber: validatedCustomer.docNumber,
            preferredDiscount: validatedCustomer.preferredDiscount || 0
          },
          items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
            barcode: item.barcode,
            maxStock: item.maxStock,
            isModel: item.isModel || false
          })),
          paymentMethod: paymentMethod,
          paymentStatus: paymentApproval.status,
          paymentReference: paymentApproval.reference,
          paymentEvidenceName: paymentApproval.evidenceName,
          paymentApprovedAt: paymentApproval.approvedAt,
          paymentBankName: paymentApproval.bankAccount?.bankName,
          paymentBankAccountAlias: paymentApproval.bankAccount?.accountAlias,
          paymentBankAccountNumber: paymentApproval.bankAccount?.accountNumber,
          subtotal: total / 1.18,
          igv: total - (total / 1.18),
          total: total,
          discountPct: discountPct,
          discountAmount: discountAmount,
          status: 'PENDIENTE'
        };

        const savedOrder = await api.post('/sales-workflow/orders', order);

        handlePrintOrderTicket(savedOrder);

        alert(`Pedido ${savedOrder.docNumber} registrado con exito.\nEnviado al submodulo Pedidos.`);
        setCart([]);
        resetPaymentFields();
        setOperationType('Venta Directa');
        setShowPaymentModal(false);
        setIsProcessing(false);
        return;
      }

      if (error) {
        throw new Error('No se puede registrar una venta sin conexion real con el backend.');
      } else {
        // ONLINE MODE
        const saleCustomer = await ensureCustomerForOnlineSale();
        const processedItems = [];
        
        for (const item of cart) {
          if (item.isModel) {
            // Find model variant object
            const modelObj = modelos.find(m => m.id === item.productId);
            if (modelObj) {
              // Ensure this model variant exists as a Product in database
              const dbProduct = await ensureProductForModel(modelObj);
              processedItems.push({
                productId: dbProduct.id,
                qty: item.qty,
                price: item.price
              });
            } else {
              processedItems.push({
                productId: item.productId,
                qty: item.qty,
                price: item.price
              });
            }
          } else {
            const dbProduct = await ensureProductForCartItem(item);
            processedItems.push({
              productId: dbProduct.id,
              qty: item.qty,
              price: item.price
            });
          }
        }
        
        const createdByUserId = getAuthenticatedUserId();
        if (!createdByUserId) {
          throw new Error('No se pudo identificar el usuario autenticado.');
        }

        const saleRequest = {
          customerId: saleCustomer.id,
          customerDocNumber: saleCustomer.docNumber,
          employeeId: null,
          createdByUserId,
          series: series + '-' + Math.floor(100000 + Math.random() * 900000),
          documentType: documentType,
          paymentMethod: paymentMethod,
          paymentReference: paymentApproval.reference,
          paymentStatus: paymentApproval.status,
          paymentEvidenceName: paymentApproval.evidenceName,
          paymentBankName: paymentApproval.bankAccount?.bankName,
          paymentBankAccountAlias: paymentApproval.bankAccount?.accountAlias,
          paymentBankAccountNumber: paymentApproval.bankAccount?.accountNumber,
          items: processedItems
        };
        
        const result = await api.post('/sales', saleRequest);
        
        // Now, we must update the stock of the modelos in the database!
        for (const item of cart) {
          if (item.isModel) {
            const modelObj = modelos.find(m => m.id === item.productId);
            if (modelObj) {
              const newStock = Math.max(0, modelObj.stock - item.qty);
              await api.put(`/modelos/${modelObj.id}`, {
                ...modelObj,
                id_categoria: modelObj.categoria?.id,
                id_marca: modelObj.marca?.id,
                stock: newStock
              });
            }
          }
        }
        
        alert(`Venta registrada con éxito.\nComprobante: ${result.series}\nTotal cobrado: S/ ${result.total.toFixed(2)}`);
        setCart([]);
        resetPaymentFields();
        
        // Refresh product inventory and modelos inventory
        const [prodList, modelList] = await Promise.all([
          api.get('/products'),
          api.get('/modelos')
        ]);
        setProducts(prodList.filter(p => p.isActive));
        setModelos(modelList);
      }
      setShowPaymentModal(false);
    } catch (err) {
      alert('Error al registrar la venta: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveQuotation = async () => {
    if (cart.length === 0) {
      alert('El carrito de compras está vacío.');
      return;
    }
    if (!validatedCustomer) {
      alert('Por favor identifique un cliente válido para guardar la cotización.');
      return;
    }
    
    const quotation = {
      id: `cot_${Date.now()}`,
      docNumber: `COT-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      customer: {
        id: validatedCustomer.id,
        name: validatedCustomer.name,
        docType: validatedCustomer.docType,
        docNumber: validatedCustomer.docNumber,
        preferredDiscount: validatedCustomer.preferredDiscount || 0
      },
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        barcode: item.barcode,
        maxStock: item.maxStock,
        isModel: item.isModel || false
      })),
      total: total
    };

    try {
      const savedQuotation = await api.post('/sales-workflow/quotations', quotation);
      alert(`Cotizacion ${savedQuotation.docNumber} guardada con exito.\nRegistrada en el submodulo Cotizaciones.`);
      setCart([]);
      setOperationType('Venta Directa');
    } catch (err) {
      alert('Error al guardar la cotizacion: ' + err.message);
    }
  };

  const saveOrder = () => {
    handleOpenCheckout();
  };

  const handleConfirmAction = () => {
    if (operationType === 'Cotizacion') {
      saveQuotation();
    } else if (operationType === 'Pedido') {
      saveOrder();
    } else {
      handleOpenCheckout();
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
    setIsCartOpen(false);
    setShowPaymentModal(true);
  };

  const getFilteredModels = () => {
    if (!selectedProductForVariant) return [];
    
    const pName = selectedProductForVariant.name.toLowerCase();
    const pCat = selectedProductForVariant.category.toLowerCase();
    
    // Filter by search query
    let list = modelos.filter(m => {
      let matchesSearch = true;
      if (variantSearch.trim()) {
        const searchTerms = String(variantSearch || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/);
        const searchableText = String(`${m.modelo} ${m.codigoModelo} ${m.sku} ${m.marca?.nombreMarca || ''} ${m.categoria?.nombreCategoria || ''}`).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        matchesSearch = searchTerms.every(term => searchableText.includes(term));
      }
        
      if (!matchesSearch) return false;
      
      if (activeVariantBrand !== 'ALL' && m.marca?.id !== activeVariantBrand) {
        return false;
      }
      
      return true;
    });
    
    // If product name indicates a tool, filter to only show tool models
    if (pName.includes('taladro') || pName.includes('esmeril') || pCat.includes('herramienta')) {
      list = list.filter(m => {
        const mCat = m.categoria?.nombreCategoria?.toLowerCase() || '';
        return mCat.includes('esmeril') || mCat.includes('taladro') || mCat.includes('rotomartillo');
      });
    } else if (pName.includes('perno') || pCat.includes('fijacion')) {
      const fijaciones = list.filter(m => m.categoria?.nombreCategoria?.toLowerCase().includes('fija'));
      if (fijaciones.length > 0) list = fijaciones;
    } else if (pName.includes('casco') || pCat.includes('seguridad')) {
      const seguridad = list.filter(m => m.categoria?.nombreCategoria?.toLowerCase().includes('segur'));
      if (seguridad.length > 0) list = seguridad;
    }
    
    return list;
  };

  const normalizeText = (text) => {
    return String(text || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredProducts = getCatalogProducts().filter(p => {
    if (!search.trim()) return true;
    const searchTerms = normalizeText(search).split(/\s+/);
    const searchableText = normalizeText(
      `${p.name} ${p.barcode} ${p.category} ${p.unit || ''} ${p.description || ''} ${p.brandName || ''}`
    );
    return searchTerms.every(term => searchableText.includes(term));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', minWidth: 0, paddingBottom: '2.5rem', background: '#ffffff' }}>
      
      <Header 
        title="Venta POS" 
        subtitle="Registra ventas de productos y emite comprobantes electrónicos en tiempo real"
      />

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '0.8rem 1rem', marginBottom: '1.5rem', color: '#b91c1c', fontSize: '0.85rem' }}>
          ℹ️ {error}
        </div>
      )}

      {/* POS Content Grid - FULL WIDTH */}
      <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        
        {/* Left Side: Product catalog and search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', width: '100%', minWidth: 0 }}>
          
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
            <div style={{ width: '100%', minWidth: 0 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', 
                gap: '1.2rem',
                width: '100%'
              }}>
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isSelected = selectedProductId === p.id;
                  
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => handleCardClick(p)}
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
                          src={getResolvedProductImage(p)}
                          alt={p.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getProductImage(p.barcode, p.name);
                          }}
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
                            fontSize: p.isBrandCard ? '0.9rem' : '1.1rem', 
                            fontWeight: '700', 
                            color: '#003471' 
                          }}>
                            {p.isBrandCard ? `Desde S/ ${p.price.toFixed(2)}` : `S/ ${p.price.toFixed(2)}`}
                          </span>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(p);
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.9rem', marginTop: '-0.7rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.6rem 0.9rem', fontSize: '0.76rem' }}>
                  <div>
                    <div style={{ color: '#8397ab', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.62rem' }}>Telefono</div>
                    <div style={{ color: '#0a1629', fontWeight: '700' }}>{validatedCustomer?.phone || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#8397ab', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.62rem' }}>Correo</div>
                    <div style={{ color: '#0a1629', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{validatedCustomer?.email || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#8397ab', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.62rem' }}>Descuento</div>
                    <div style={{ color: '#0a1629', fontWeight: '700' }}>{validatedCustomer?.preferredDiscount || 0}%</div>
                  </div>
                  <div>
                    <div style={{ color: '#8397ab', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.62rem' }}>Comprobante</div>
                    <div style={{ color: '#0a1629', fontWeight: '700' }}>{customerCondition}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ color: '#8397ab', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.62rem' }}>Direccion</div>
                    <div style={{ color: '#0a1629', fontWeight: '700' }}>{validatedCustomer?.address || '-'}</div>
                  </div>
                </div>
              </div>

              {/* Form document type (Locked based on condition: DNI -> Boleta, RUC -> Factura/Voucher) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem' }}>
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
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      resetPaymentFields();
                    }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Izipay">Izipay</option>
                    <option value="Niubiz">Niubiz</option>
                    <option value="Llave Offline">Llave Offline</option>
                  </select>
                </div>
              </div>

              {(() => {
                const meta = getPaymentMethodMeta();
                const PaymentIcon = meta.icon;

                return (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.9rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '4px', background: '#e9f2fd', color: '#003471', display: 'grid', placeItems: 'center' }}>
                        <PaymentIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0a1629', fontSize: '0.82rem' }}>{meta.title}</div>
                        <div style={{ color: '#5c6b73', fontSize: '0.7rem', lineHeight: 1.35 }}>{meta.detail}</div>
                      </div>
                    </div>

                    {['Tarjeta', 'Izipay', 'Niubiz'].includes(paymentMethod) && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', fontWeight: '700', color: '#003471', marginBottom: '0.65rem' }}>
                        <input type="checkbox" checked={terminalConnected} onChange={(e) => setTerminalConnected(e.target.checked)} />
                        {['Izipay', 'Niubiz'].includes(paymentMethod) ? `${paymentMethod} disponible y listo para cobrar` : 'Terminal conectado y listo para cobrar'}
                      </label>
                    )}

                    {['Tarjeta', 'Izipay', 'Niubiz', 'Transferencia', 'Yape', 'Plin'].includes(paymentMethod) && (
                      <div className="form-group" style={{ marginBottom: ['Transferencia', 'Yape', 'Plin'].includes(paymentMethod) ? '0.65rem' : 0 }}>
                        <label style={{ fontWeight: '700', fontSize: '0.72rem' }}>
                          {['Tarjeta', 'Izipay', 'Niubiz'].includes(paymentMethod) ? 'Codigo de aprobacion' : 'Numero de operacion'}
                        </label>
                        <input
                          className="form-input"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder={['Tarjeta', 'Izipay', 'Niubiz'].includes(paymentMethod) ? 'Ej. AP-847291' : 'Ej. OP-1029384756'}
                          style={{ height: '36px', borderRadius: '4px' }}
                        />
                      </div>
                    )}

                    {paymentMethod === 'Transferencia' && (
                      <div style={{ border: '1px solid #dbe5ef', borderRadius: '4px', padding: '0.75rem', background: '#ffffff', marginBottom: '0.65rem' }}>
                        <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                          <label style={{ fontWeight: '700', fontSize: '0.72rem' }}>Cuenta bancaria destino</label>
                          <select
                            className="form-select"
                            value={selectedBankAccountId}
                            onChange={(e) => setSelectedBankAccountId(e.target.value)}
                            style={{ height: '36px', borderRadius: '4px' }}
                          >
                            {bankAccounts.map((account) => (
                              <option key={account.id} value={account.id}>
                                {account.bankName} - {account.accountAlias}
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedBankAccount && (
                          <div style={{ display: 'grid', gap: '0.25rem', color: '#0a1629', fontSize: '0.72rem' }}>
                            <div><strong>Titular:</strong> {selectedBankAccount.accountHolderName}</div>
                            <div><strong>Banco:</strong> {selectedBankAccount.bankName}</div>
                            <div><strong>Cuenta:</strong> {selectedBankAccount.accountNumber}</div>
                            <div><strong>CCI:</strong> {selectedBankAccount.cci || 'No configurado'}</div>
                            <div style={{ color: '#ff6b00', fontWeight: '800', marginTop: '0.25rem' }}>
                              Referencia sugerida: {transferReferenceHint}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {['Transferencia', 'Yape', 'Plin'].includes(paymentMethod) && (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#003471', fontSize: '0.76rem', fontWeight: '800' }}>
                        <Upload size={14} />
                        <span>{paymentEvidenceName || 'Adjuntar constancia'}</span>
                        <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => setPaymentEvidenceName(e.target.files?.[0]?.name || '')} />
                      </label>
                    )}

                    {paymentMethod === 'Llave Offline' && (
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: '700', fontSize: '0.72rem' }}>Codigo de autorizacion offline</label>
                        <input
                          className="form-input"
                          value={offlineApprovalKey}
                          onChange={(e) => setOfflineApprovalKey(e.target.value)}
                          placeholder="Ej. OFF-CAJA-2048"
                          style={{ height: '36px', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

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
                  <strong>Cliente:</strong> {(validatedCustomer?.name || 'Cliente pendiente').substring(0, 20)}<br/>
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
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-STUCK CART MODAL DRAWER */}
      {isCartOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(10, 22, 41, 0.4)',
              backdropFilter: 'blur(3px)',
              zIndex: 9999,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />

          {/* Cart Drawer */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '420px',
            height: '100vh',
            background: '#ffffff',
            borderLeft: '1px solid #cbd5e1',
            boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
            padding: '1.8rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflowY: 'auto'
          }}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#003471', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <ShoppingCart size={18} /> Carrito de Ventas
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8397ab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* IDENTIFICACIÓN CLIENTE CARD */}
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid #cbd5e1', 
              borderRadius: '4px', 
              padding: '0.9rem'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#0a1629', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Identificación Cliente
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="DNI o RUC"
                  style={{ border: '1px solid #cbd5e1', background: '#f3f4f6', borderRadius: '4px', height: '38px', padding: '0 0.8rem', width: '100%', flexGrow: 1 }}
                  value={docInput}
                  onChange={(e) => setDocInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValidate();
                    }
                  }}
                />
                <button 
                  onClick={handleValidate}
                  disabled={customerLookupLoading}
                  style={{ 
                    background: customerLookupLoading ? '#8397ab' : '#003471', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '0 1.2rem', 
                    borderRadius: '4px', 
                    fontWeight: '700', 
                    cursor: customerLookupLoading ? 'wait' : 'pointer',
                    fontSize: '0.85rem',
                    height: '38px'
                  }}
                >
                  {customerLookupLoading ? '...' : 'VALIDAR'}
                </button>
              </div>

              {/* Validated client block */}
              {validatedCustomer && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  background: '#e9f2fd', 
                  padding: '0.45rem 0.6rem', 
                  borderRadius: '4px',
                  marginTop: '0.55rem',
                  border: '1px solid #cbd5e1'
                }}>
                  <div style={{ fontSize: '0.74rem', color: '#003471', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {validatedCustomer.name}
                  </div>
                  <div style={{ background: '#003471', color: '#ffffff', fontWeight: '800', fontSize: '0.64rem', padding: '0.18rem 0.42rem', borderRadius: '2px', flexShrink: 0 }}>
                    {validatedCustomer.docType} {validatedCustomer.docNumber}
                  </div>
                </div>
              )}
            </div>

            {/* CARRITO PANEL CARD */}
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid #cbd5e1', 
              borderRadius: '4px', 
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              minHeight: '260px'
            }}>
              
              {/* Cart Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1.5px solid #cbd5e1', 
                paddingBottom: '0.6rem', 
                marginBottom: '0.8rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#0a1629', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PRODUCTOS EN VENTA
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
                      fontSize: '0.72rem',
                      fontWeight: '700'
                    }}
                  >
                    <Trash2 size={12} /> Vaciar
                  </button>
                )}
              </div>

              {/* Type of Operation Selector */}
              <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontWeight: '700', fontSize: '0.75rem', color: '#5c6b73' }}>Tipo de Operación</label>
                <select 
                  className="form-select" 
                  style={{ border: '1px solid #cbd5e1', borderRadius: '4px', height: '36px', padding: '0 0.8rem', fontSize: '0.8rem', background: '#f8fafc' }}
                  value={operationType} 
                  onChange={(e) => setOperationType(e.target.value)}
                >
                  <option value="Venta Directa">Venta Directa</option>
                  <option value="Pedido">Pedido</option>
                  <option value="Cotizacion">Cotización</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                <label style={{ fontWeight: '700', fontSize: '0.75rem', color: '#5c6b73' }}>Metodo de pago</label>
                <select
                  className="form-select"
                  style={{ border: '1px solid #cbd5e1', borderRadius: '4px', height: '36px', padding: '0 0.8rem', fontSize: '0.8rem', background: '#f8fafc' }}
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    resetPaymentFields();
                  }}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Tarjeta">Tarjeta POS</option>
                  <option value="Izipay">Izipay</option>
                  <option value="Niubiz">Niubiz</option>
                  <option value="Llave Offline">Llave Offline</option>
                </select>
              </div>

              {/* Cart list items */}
              <div style={{ 
                overflowY: 'auto', 
                flexGrow: 1,
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.8rem',
                paddingRight: '0.2rem',
                marginBottom: '1rem',
                maxHeight: 'calc(100vh - 520px)'
              }}>
                {cart.length === 0 ? (
                  <div style={{ color: '#8397ab', fontSize: '0.85rem', textAlign: 'center', padding: '4rem 1rem' }}>
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
                        paddingBottom: '0.6rem',
                        borderBottom: '1px solid #cbd5e1',
                        textAlign: 'left'
                      }}
                    >
                      {/* Item thumbnail */}
                      <img 
                        src={getResolvedProductImage(item)}
                        alt={item.name} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getProductImage(item.barcode, item.name);
                        }}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#f3f4f6' }}
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
              <div style={{ borderTop: '1.5px solid #cbd5e1', paddingTop: '0.8rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0a1629', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    TOTAL A PAGAR
                  </span>
                  <span style={{ fontWeight: '800', fontSize: '1.35rem', color: '#003471' }}>
                    S/ {total.toFixed(2)}
                  </span>
                </div>

                <button 
                  onClick={handleConfirmAction}
                  disabled={cart.length === 0}
                  style={{ 
                    width: '100%', 
                    background: cart.length === 0 ? '#cbdcf0' : '#ff6b00', 
                    color: '#ffffff', 
                    border: 'none', 
                    padding: '0.8rem', 
                    borderRadius: '4px', 
                    fontWeight: '800', 
                    fontSize: '0.9rem',
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {operationType === 'Cotizacion' ? 'GUARDAR COTIZACIÓN' : operationType === 'Pedido' ? 'COBRAR Y GENERAR PEDIDO' : 'CONFIRMAR VENTA'}
                </button>
              </div>

            </div>

          </div>
        </>
      )}

      {/* FLOATING CART BUTTON */}
      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 25px rgba(255, 107, 0, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 0, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 0, 0.45)';
        }}
      >
        <ShoppingCart size={24} />
        
        {/* Item count badge */}
        {cart.reduce((acc, item) => acc + item.qty, 0) > 0 && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#ef4444',
            color: '#ffffff',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: '800',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {cart.reduce((acc, item) => acc + item.qty, 0)}
          </div>
        )}
      </button>

      {/* OVERLAY MODAL: VARIANT SELECTOR */}
      {showVariantModal && selectedProductForVariant && (
        <div className="modal-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ 
            borderRadius: '12px', 
            border: '1px solid #cbd5e1', 
            padding: '1.8rem', 
            maxWidth: '680px', 
            width: '95%',
            background: '#ffffff',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(0, 52, 113, 0.05)', color: '#003471' }}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#003471' }}>
                    Variantes y Modelos de Producto
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#8397ab', fontWeight: '600' }}>
                    Seleccione la variante específica para {selectedProductForVariant.name}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowVariantModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8397ab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Search Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.2rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#8397ab' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', border: '1px solid #cbd5e1', borderRadius: '6px', height: '36px', fontSize: '0.8rem' }}
                  placeholder="Buscar modelo por nombre, código técnico o SKU ..."
                  value={variantSearch}
                  onChange={(e) => setVariantSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Variants list with custom scroll */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '4px' }}>
              {(() => {
                const list = getFilteredModels();
                if (list.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: '#7f8c8d', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0', fontSize: '0.8rem' }}>
                      No se encontraron modelos disponibles para los filtros seleccionados.
                    </div>
                  );
                }
                
                return list.map(m => {
                  const mImages = productosImagenes.filter(img => img.productoModelo?.id === m.id);
                  const mImgUrl = resolveCatalogImageUrl(
                    mImages.length > 0 ? mImages[0].urlImagen : '',
                    getModelImageFallback(m)
                  );
                  const isOutOfStock = m.stock <= 0;
                  const mSpecs = especificaciones.filter(s => s.productoModelo?.id === m.id);

                  return (
                    <div 
                      key={m.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '50px minmax(0, 1fr) minmax(78px, auto) minmax(82px, auto)',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.6rem 0.8rem',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        opacity: isOutOfStock ? 0.6 : 1,
                        transition: 'border 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#003471'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: '45px', height: '45px', borderRadius: '4px', border: '1px solid #cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                        <img
                          src={mImgUrl}
                          alt={m.modelo}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getModelImageFallback(m);
                          }}
                          style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0a1629' }}>
                          {m.marca?.nombreMarca} - {m.modelo}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#5c6b73', fontWeight: '600' }}>
                          CÓD: {m.codigoModelo} &bull; SKU: {m.sku}
                        </div>
                        
                        {/* Mini Specs Row */}
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                          {mSpecs.slice(0, 2).map(s => (
                            <span key={s.id} style={{ fontSize: '0.55rem', background: '#e9f2fd', color: '#003471', fontWeight: '700', padding: '1px 5px', borderRadius: '10px' }}>
                              {s.atributo}: {s.valor}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Stock */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ff6b00' }}>
                          S/ {m.precio.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.68rem', fontWeight: '700', color: isOutOfStock ? '#ef4444' : '#22c55e' }}>
                          {isOutOfStock ? 'Agotado' : `${m.stock} uds`}
                        </div>
                      </div>

                      {/* Add Button */}
                      <div>
                        <button
                          disabled={isOutOfStock}
                          onClick={() => addModelToCart(m)}
                          style={{
                            background: isOutOfStock ? '#e2e8f0' : '#003471',
                            color: isOutOfStock ? '#a0aec0' : '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.4rem 0.8rem',
                            fontWeight: '700',
                            fontSize: '0.72rem',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.2rem',
                            transition: 'background 0.2s'
                          }}
                        >
                          <Plus size={12} /> Añadir
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', marginTop: '1.2rem', paddingTop: '0.8rem' }}>
              <button
                onClick={() => setShowVariantModal(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#5c6b73',
                  border: 'none',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '4px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                CERRAR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CSS Animations style block */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

    </div>
  );
}
