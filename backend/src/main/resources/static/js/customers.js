import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();

    const form = document.getElementById('customer-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCustomer();
    });
});

async function loadCustomers() {
    const tbody = document.getElementById('customers-body');
    try {
        const customers = await api.get('/customers');
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay clientes registrados en el sistema.</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td style="font-weight: 600; color: var(--text-muted); padding-left: 1.5rem;">${c.docType}: ${c.docNumber}</td>
                <td style="font-weight: 600; color: var(--primary-blue);">${c.name}</td>
                <td>${c.phone || '-'}</td>
                <td>${c.email || '-'}</td>
                <td style="font-weight: bold; color: #16a34a;">${c.preferredDiscount}%</td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;">Error al cargar los clientes.</td></tr>';
    }
}

async function saveCustomer() {
    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.innerText = 'Guardando...';

    const payload = {
        name: document.getElementById('c_name').value,
        docType: document.getElementById('c_type').value,
        docNumber: document.getElementById('c_doc').value,
        phone: document.getElementById('c_phone').value,
        preferredDiscount: parseFloat(document.getElementById('c_discount').value) || 0,
        address: document.getElementById('c_address').value,
        email: ''
    };

    try {
        await api.post('/customers', payload);
        document.getElementById('customerModal').style.display = 'none';
        loadCustomers();
    } catch (error) {
        alert('Error al guardar el cliente: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Guardar Cliente';
    }
}
