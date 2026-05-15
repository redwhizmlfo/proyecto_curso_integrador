import api from './api.js';

// State
let products = [];
let cart = [];
let selectedCustomer = { id: 'some-customer-id', name: 'Cliente Varios' }; // Fallback

// DOM Elements
const productsList = document.getElementById('available-products');
const cartItems = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const igvEl = document.getElementById('igv');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');

export async function initPOS() {
    try {
        products = await api.get('/products');
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products for POS', error);
    }
}

function renderProducts(items) {
    if (!productsList) return;
    productsList.innerHTML = items.map(p => `
        <div class="luxury-card product-card" style="grid-template-columns: 2fr 1fr 1fr 80px; display: grid; border-radius: 12px; margin-bottom: 1rem; padding: 0.8rem;">
            <div>
                <div style="font-weight: 600;">${p.name}</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">SKU: ${p.barcode}</div>
            </div>
            <div style="color: var(--accent-gold);">S/ ${p.price.toFixed(2)}</div>
            <div style="color: ${p.stock < 5 ? '#e84118' : 'white'}">${p.stock} ${p.unit}</div>
            <button class="btn-premium" style="padding: 0.4rem; border-radius: 8px;" onclick="window.addToCart('${p.id}')">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `).join('');
}

window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        alert('Sin stock disponible');
        return;
    }

    const existingIdx = cart.findIndex(item => item.productId === productId);
    if (existingIdx > -1) {
        cart[existingIdx].qty += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            qty: 1
        });
    }
    updateCartUI();
};

function updateCartUI() {
    if (!cartItems) return;

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <div style="font-weight: 600;">${item.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.qty} x S/ ${item.price.toFixed(2)}</div>
            </div>
            <div style="font-weight: 600;">S/ ${(item.qty * item.price).toFixed(2)}</div>
        </div>
    `).join('');

    calculateTotals();
}

function calculateTotals() {
    const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    if (subtotalEl) subtotalEl.innerText = `S/ ${subtotal.toFixed(2)}`;
    if (igvEl) igvEl.innerText = `S/ ${igv.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `S/ ${total.toFixed(2)}`;
}

window.processSale = async () => {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const saleRequest = {
        customerId: '00000000-0000-0000-0000-000000000001', // Example UUID
        employeeId: null,
        createdByUserId: '00000000-0000-0000-0000-000000000001', // Example UUID
        series: 'F001',
        documentType: 'Factura',
        paymentMethod: 'Efectivo',
        items: cart.map(item => ({
            productId: item.productId,
            qty: item.qty,
            price: item.price
        }))
    };

    try {
        const result = await api.post('/sales', saleRequest);
        alert('Venta procesada con éxito: ' + result.series);
        cart = [];
        updateCartUI();
        initPOS(); // Refresh product stock
    } catch (error) {
        alert('Error al procesar la venta: ' + error.message);
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', initPOS);
if (checkoutBtn) checkoutBtn.addEventListener('click', window.processSale);
