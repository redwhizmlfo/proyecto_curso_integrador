import api from './api.js';

let availableProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    loadDropdowns();

    document.getElementById('order-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveOrder();
    });
});

async function loadDropdowns() {
    try {
        const users = await api.get('/users');
        const suppliers = await api.get('/suppliers');
        availableProducts = await api.get('/products');

        document.getElementById('o_user').innerHTML = users.map(u => `<option value="${u.id}">${u.username}</option>`).join('');
        document.getElementById('o_supplier').innerHTML = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        
        populateProductSelects();
    } catch (e) {
        console.error('Error cargando catálogos:', e);
    }
}

function populateProductSelects() {
    const selects = document.querySelectorAll('.o_product_select');
    const options = availableProducts.map(p => `<option value="${p.id}">${p.name} (Stock actual: ${p.stock})</option>`).join('');
    selects.forEach(sel => {
        if (!sel.innerHTML) sel.innerHTML = options;
    });
}

window.addOrderRow = function() {
    const container = document.getElementById('order-items-container');
    const div = document.createElement('div');
    div.className = 'order-product-row';
    div.innerHTML = `
        <select class="form-control o_product_select" required></select>
        <input type="number" class="form-control o_qty" placeholder="Cantidad" required min="1">
    `;
    container.appendChild(div);
    populateProductSelects();
}

async function loadOrders() {
    const tbody = document.getElementById('orders-body');
    try {
        const orders = await api.get('/orders');
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay pedidos registrados.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td style="font-weight: 600; padding-left: 1.5rem;">#${o.id.substring(0, 8).toUpperCase()}</td>
                <td style="color: var(--primary-blue); font-weight: 600;">${o.supplierNameSnapshot}</td>
                <td>${new Date(o.orderedAt).toLocaleDateString()}</td>
                <td>${o.totalUnits} Un. (${o.totalLines} Ítems)</td>
                <td><span class="badge badge-${o.status.toLowerCase()}">${o.status.toUpperCase()}</span></td>
                <td style="text-align: center;">
                    ${o.status.toLowerCase() === 'pendiente' ? 
                        `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="receiveOrder('${o.id}')">RECIBIR STOCK</button>` : 
                        '<i class="fas fa-check text-green" style="color:#16a34a;"></i> Completado'
                    }
                </td>
            </tr>
        `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error cargando pedidos.</td></tr>';
    }
}

async function saveOrder() {
    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    
    const items = Array.from(document.querySelectorAll('.order-product-row')).map(row => {
        return {
            productId: row.querySelector('.o_product_select').value,
            qty: parseFloat(row.querySelector('.o_qty').value)
        };
    });

    const payload = {
        supplierId: document.getElementById('o_supplier').value,
        createdByUserId: document.getElementById('o_user').value,
        priority: document.getElementById('o_priority').value,
        note: 'Pedido de reabastecimiento web',
        items: items
    };

    try {
        await api.post('/orders', payload);
        document.getElementById('orderModal').style.display = 'none';
        loadOrders();
        
        // Reset form to exactly 1 row
        document.getElementById('order-items-container').innerHTML = `
            <div class="order-product-row">
                <select class="form-control o_product_select" required></select>
                <input type="number" class="form-control o_qty" placeholder="Cantidad" required min="1">
            </div>
        `;
        populateProductSelects();
    } catch (e) {
        alert('Error al crear pedido: ' + e.message);
    } finally {
        btn.disabled = false;
    }
}

window.receiveOrder = async function(orderId) {
    if(!confirm('¿Estás seguro que la mercadería llegó? Esto aumentará el stock de tu inventario inmediatamente.')) return;
    
    const users = await api.get('/users');
    if(users.length === 0) return alert('No hay usuarios para recibir');
    const receivedBy = users[0].id; // We take the first user for demo purposes

    try {
        await api.put(`/orders/${orderId}/receive?receivedBy=${receivedBy}`);
        alert('¡Stock actualizado con éxito en el inventario!');
        loadOrders();
    } catch (e) {
        alert('Error al recibir: ' + e.message);
    }
}
