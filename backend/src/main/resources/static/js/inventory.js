import api from './api.js';

let currentProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadSuppliers();

    const form = document.getElementById('product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct();
    });
});

async function loadSuppliers() {
    const select = document.getElementById('p_supplier');
    try {
        const suppliers = await api.get('/suppliers');
        if (suppliers.length === 0) {
            select.innerHTML = '<option value="">No hay proveedores (¡Crea uno primero!)</option>';
            return;
        }
        select.innerHTML = suppliers.map(s => `<option value="${s.id}">${s.name} (RUC: ${s.ruc})</option>`).join('');
    } catch (error) {
        select.innerHTML = '<option value="">Error cargando proveedores</option>';
    }
}


async function loadProducts() {
    const tbody = document.getElementById('products-body');
    try {
        const products = await api.get('/products');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay productos registrados en el sistema.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => `
            <tr>
                <td style="font-weight: 600; color: var(--primary-blue); padding-left: 1.5rem;">${p.barcode}</td>
                <td>
                    <div style="font-weight: 600; color: var(--text-main);">${p.name}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Prov: ${p.supplierNameSnapshot}</div>
                </td>
                <td>${p.category}</td>
                <td style="font-weight: 600;">${p.stock} ${p.unit}</td>
                <td>S/ ${p.price.toFixed(2)}</td>
                <td>
                    <span class="badge ${p.active ? 'badge-active' : 'badge-inactive'}">
                        ${p.active ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td style="text-align: center;">
                    <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="deleteProduct('${p.id}')">
                        <i class="fas fa-trash-alt" style="color: #ef4444;"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">Error al cargar los productos. Verifica que el servidor backend esté corriendo.</td></tr>';
    }
}

async function saveProduct() {
    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.innerText = 'Guardando...';

    const payload = {
        name: document.getElementById('p_name').value,
        barcode: document.getElementById('p_barcode').value,
        category: document.getElementById('p_category').value,
        unit: document.getElementById('p_unit').value,
        description: "",
        cost: parseFloat(document.getElementById('p_cost').value),
        price: parseFloat(document.getElementById('p_price').value),
        minStock: parseFloat(document.getElementById('p_minstock').value),
        supplierId: document.getElementById('p_supplier').value,
        imageUrl: document.getElementById('p_image').value
    };

    try {
        if (currentProductId) {
            await api.put(`/products/${currentProductId}`, payload);
        } else {
            await api.post('/products', payload);
        }
        alert('Producto creado exitosamente!');
        document.getElementById('productModal').style.display = 'none';
        loadProducts();
    } catch (error) {
        alert('Error al crear producto: ' + error.message + '\n\nNOTA: Asegúrate de que el ID del proveedor exista en la base de datos.');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Guardar Producto';
    }
}

window.deleteProduct = async function(id) {
    if(confirm('¿Estás seguro de que deseas dar de baja este producto?')) {
        try {
            await api.delete(`/products/${id}`);
            loadProducts();
        } catch(error) {
            alert('Error al eliminar el producto');
        }
    }
};
