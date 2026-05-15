import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();

    const form = document.getElementById('supplier-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSupplier();
    });
});

async function loadSuppliers() {
    const tbody = document.getElementById('suppliers-body');
    try {
        const suppliers = await api.get('/suppliers');
        
        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay proveedores registrados en el sistema.</td></tr>';
            return;
        }

        tbody.innerHTML = suppliers.map(s => `
            <tr>
                <td style="font-weight: 600; color: var(--primary-blue); padding-left: 1.5rem;">${s.ruc}</td>
                <td style="font-weight: 600; color: var(--text-main);">${s.name}</td>
                <td>${s.contact || '-'}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.email || '-'}</td>
                <td>
                    <span class="badge ${s.active ? 'badge-active' : 'badge-inactive'}">
                        ${s.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteSupplier('${s.id}')">
                        <i class="fas fa-trash-alt" style="color: #ef4444;"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">Error al cargar los proveedores.</td></tr>';
    }
}

async function saveSupplier() {
    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.innerText = 'Guardando...';

    const payload = {
        name: document.getElementById('s_name').value,
        ruc: document.getElementById('s_ruc').value,
        contact: document.getElementById('s_contact').value,
        phone: document.getElementById('s_phone').value,
        email: document.getElementById('s_email').value
    };

    try {
        await api.post('/suppliers', payload);
        document.getElementById('supplierModal').style.display = 'none';
        loadSuppliers(); // Reload table
    } catch (error) {
        alert('Error al guardar el proveedor: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Guardar Proveedor';
    }
}

window.deleteSupplier = async function(id) {
    if(confirm('¿Estás seguro de que deseas dar de baja a este proveedor? Los productos asociados a él seguirán existiendo pero el proveedor estará inactivo.')) {
        try {
            await api.delete(`/suppliers/${id}`);
            loadSuppliers();
        } catch(error) {
            alert('Error al eliminar el proveedor');
        }
    }
};
