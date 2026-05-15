import api from './api.js';

// DOM Elements
const productsBody = document.querySelector('#products-body');
const lossForm = document.querySelector('#loss-form');
const lossModal = document.querySelector('#lossModal');

// State
let selectedProductId = null;

export async function loadProducts() {
    try {
        const products = await api.get('/products');
        renderProducts(products);
    } catch (error) {
        showNotification('Error al cargar productos', 'error');
    }
}

function renderProducts(products) {
    if (!productsBody) return;
    
    productsBody.innerHTML = products.map(p => `
        <tr>
            <td>
                <div style="font-weight: 600;">${p.name}</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">SKU: ${p.barcode}</div>
            </td>
            <td>${p.category}</td>
            <td style="color: ${p.stock <= p.minStock ? '#e84118' : 'var(--accent)'};">
                ${p.stock} ${p.unit} ${p.stock <= p.minStock ? '(Crítico)' : ''}
            </td>
            <td>S/ ${p.cost.toFixed(2)}</td>
            <td>
                <button class="btn-premium" style="padding: 0.5rem 1rem; font-size: 0.7rem;" 
                    onclick="window.prepareLoss('${p.id}', '${p.name}')">
                    Reportar Pérdida
                </button>
            </td>
        </tr>
    `).join('');
}

window.prepareLoss = (id, name) => {
    selectedProductId = id;
    document.getElementById('selectedProductName').innerText = name;
    document.getElementById('lossModal').style.display = 'flex';
};

window.closeLossModal = () => {
    document.getElementById('lossModal').style.display = 'none';
    lossForm.reset();
};

window.handleLossSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(lossForm);
    const data = {
        productId: selectedProductId,
        userId: 'some-default-uuid', // In a real app, this would come from the logged-in user
        qty: parseFloat(formData.get('qty')),
        reason: formData.get('reason'),
        responsible: formData.get('responsible')
    };

    try {
        await api.post('/losses', data);
        showNotification('Pérdida registrada con éxito', 'success');
        window.closeLossModal();
        loadProducts(); // Refresh list
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
};

function showNotification(msg, type) {
    // Luxury notification placeholder
    alert(msg); 
}

// Initial Load
document.addEventListener('DOMContentLoaded', loadProducts);
document.getElementById('loss-form').addEventListener('submit', window.handleLossSubmit);
