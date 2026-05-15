import api from './api.js';

let availableProducts = [];
let availableCustomers = [];
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCustomers();
    loadUsers();

    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterProducts(e.target.value);
    });

    document.getElementById('btn-checkout').addEventListener('click', processSale);
    document.getElementById('btn-clear-cart').addEventListener('click', clearCart);
    document.getElementById('btn-validate-customer').addEventListener('click', validateCustomer);
});

async function loadUsers() {
    const select = document.getElementById('s_user');
    try {
        const users = await api.get('/users');
        if (users.length === 0) {
            select.innerHTML = '<option value="">Crea Usuario</option>';
            return;
        }
        select.innerHTML = users.map(u => `<option value="${u.id}">${u.username}</option>`).join('');
    } catch (error) {
        select.innerHTML = '<option value="">Error</option>';
    }
}

async function loadCustomers() {
    try {
        availableCustomers = await api.get('/customers');
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

function validateCustomer() {
    const docInput = document.getElementById('s_customer_doc').value.trim();
    if (!docInput) return;
    
    // Simple validation: search by docNumber
    const found = availableCustomers.find(c => c.docNumber === docInput);
    if (found) {
        document.getElementById('s_customer_id').value = found.id;
        document.getElementById('customer-name-display').innerText = found.name.toUpperCase();
        document.getElementById('customer-doc-display').innerText = found.docNumber;
        document.getElementById('customer-type-badge').innerText = found.docType;
        document.getElementById('customer-badge').style.display = 'flex';
        document.getElementById('s_doc_type').value = found.docType === 'RUC' ? 'FACTURA' : 'BOLETA';
    } else {
        alert('Cliente no encontrado en la base de datos.');
        document.getElementById('customer-badge').style.display = 'none';
        document.getElementById('s_customer_id').value = '';
    }
}

async function loadProducts() {
    try {
        availableProducts = await api.get('/products');
        renderProducts(availableProducts.filter(p => p.active));
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

function filterProducts(query) {
    if (!query) {
        renderProducts(availableProducts.filter(p => p.active));
        return;
    }
    const lowerQuery = query.toLowerCase();
    const filtered = availableProducts.filter(p => 
        p.active && (p.name.toLowerCase().includes(lowerQuery) || p.barcode.toLowerCase().includes(lowerQuery))
    );
    renderProducts(filtered);
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">No se encontraron productos.</div>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const isOut = p.stock <= 0;
        const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
        
        // Generate a random-looking color for placeholder based on string length
        const colors = ['475569', '334155', '1e293b', '0f172a'];
        const bg = colors[p.name.length % colors.length];
        const placeholderUrl = `https://placehold.co/400x300/e2e8f0/${bg}?text=${p.name.charAt(0).toUpperCase()}`;
        const imgUrl = p.imageUrl ? p.imageUrl : placeholderUrl;

        return `
            <div style="background: white; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; position: relative;">
                <div style="height: 140px; background: #f1f5f9; position: relative; ${isOut ? 'opacity: 0.5; filter: grayscale(1);' : ''}">
                    <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                    ${isOut ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; color: #ef4444; padding: 4px 12px; font-weight: 800; font-size: 0.75rem; border-radius: 4px;">AGOTADO</div>' : ''}
                </div>
                <div style="padding: 1rem;">
                    <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 800; margin-bottom: 0.25rem;">SKU: ${p.barcode}</div>
                    <div style="font-size: 0.85rem; font-weight: 800; color: var(--text-main); margin-bottom: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.name}">${p.name}</div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 1.1rem; font-weight: 900; color: var(--primary-blue);">${formatter.format(p.price)}</div>
                        ${!isOut ? 
                            `<button onclick="addToCart('${p.id}')" style="background: var(--primary-blue); color: white; border: none; width: 32px; height: 32px; border-radius: 4px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: background 0.2s;"><i class="fas fa-cart-plus"></i></button>` : 
                            `<button disabled style="background: #f1f5f9; color: var(--text-muted); border: none; width: 32px; height: 32px; border-radius: 4px; display: flex; justify-content: center; align-items: center;"><i class="fas fa-ban"></i></button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.addToCart = function(productId) {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(i => i.product.id === productId);
    if (existing) {
        if (existing.qty < product.stock) {
            existing.qty += 1;
        } else {
            alert('No hay suficiente stock.');
        }
    } else {
        if (product.stock > 0) {
            cart.push({ product, qty: 1 });
        } else {
            alert('Producto sin stock.');
        }
    }
    renderCart();
};

window.updateQty = function(productId, delta) {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
        cart = cart.filter(i => i.product.id !== productId);
    } else if (newQty <= item.product.stock) {
        item.qty = newQty;
    } else {
        alert('Stock máximo alcanzado.');
    }
    renderCart();
};

function clearCart() {
    cart = [];
    renderCart();
}
window.clearCart = clearCart;

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: 2rem;">El carrito está vacío.</div>';
        document.getElementById('cart-total').innerText = 'S/ 0.00';
        return;
    }

    const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
    let total = 0;

    container.innerHTML = cart.map(item => {
        const itemTotal = item.product.price * item.qty;
        total += itemTotal;
        
        const colors = ['475569', '334155', '1e293b', '0f172a'];
        const bg = colors[item.product.name.length % colors.length];
        const placeholderUrl = `https://placehold.co/100x100/e2e8f0/${bg}?text=${item.product.name.charAt(0).toUpperCase()}`;
        const imgUrl = item.product.imageUrl ? item.product.imageUrl : placeholderUrl;

        return `
            <div style="display: flex; gap: 0.75rem; background: white; border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px;">
                <img src="${imgUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-main); line-height: 1.2; margin-bottom: 0.2rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.product.name}</div>
                    <div style="font-size: 0.65rem; color: var(--text-muted);">${formatter.format(item.product.price)} unit.</div>
                </div>
                <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: 4px; height: 28px; align-self: center;">
                    <button onclick="updateQty('${item.product.id}', -1)" style="width: 24px; height: 100%; display: flex; justify-content: center; align-items: center; background: #f1f5f9; cursor: pointer; border: none; font-weight: bold; color: var(--text-main);">-</button>
                    <div style="width: 24px; text-align: center; font-size: 0.75rem; font-weight: 800; line-height: 28px;">${item.qty}</div>
                    <button onclick="updateQty('${item.product.id}', 1)" style="width: 24px; height: 100%; display: flex; justify-content: center; align-items: center; background: #f1f5f9; cursor: pointer; border: none; font-weight: bold; color: var(--text-main);">+</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total').innerText = formatter.format(total);
}

async function processSale() {
    if (cart.length === 0) return alert('El carrito está vacío.');
    
    const customerId = document.getElementById('s_customer_id').value;
    if (!customerId) return alert('Por favor, busca y valida el DNI/RUC del cliente primero.');

    const userId = document.getElementById('s_user').value;
    if (!userId) return alert('Por favor selecciona el Cajero en la parte superior del panel derecho.');

    const btn = document.getElementById('btn-checkout');
    btn.disabled = true;
    btn.innerText = 'PROCESANDO...';

    const payload = {
        customerId: customerId,
        createdByUserId: userId,
        series: document.getElementById('s_doc_type').value === 'FACTURA' ? "F001" : "B001",
        documentType: document.getElementById('s_doc_type').value,
        paymentMethod: document.getElementById('s_payment').value,
        items: cart.map(i => ({ productId: i.product.id, qty: i.qty }))
    };

    try {
        await api.post('/sales', payload);
        alert('¡Venta registrada con éxito!');
        clearCart();
        document.getElementById('s_customer_doc').value = '';
        document.getElementById('s_customer_id').value = '';
        document.getElementById('customer-badge').style.display = 'none';
        await loadProducts(); // Reload stock
    } catch (error) {
        alert('Error al procesar venta: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'CONFIRMAR VENTA';
    }
}
