import api from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const summary = await api.get('/dashboard/summary');
        
        // Formatear moneda peruana
        const formatter = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        });

        if (document.getElementById('d_sales')) document.getElementById('d_sales').innerText = formatter.format(summary.totalSalesRevenue);
        if (document.getElementById('d_products')) document.getElementById('d_products').innerText = summary.totalProducts;
        if (document.getElementById('d_customers')) document.getElementById('d_customers').innerText = summary.totalCustomers;
        
        const alertEl = document.getElementById('d_alerts');
        if (alertEl) {
            alertEl.innerText = summary.lowStockAlerts;
            if (summary.lowStockAlerts > 0) {
                alertEl.style.color = '#ef4444';
                alertEl.style.fontWeight = '800';
                alertEl.innerText += ' ¡REVISAR!';
            }
        }

        // Render Recent Sales
        const salesBody = document.getElementById('recent-sales-body');
        if (summary.recentSales && summary.recentSales.length > 0) {
            salesBody.innerHTML = summary.recentSales.map(s => `
                <tr>
                    <td class="font-medium" style="color: var(--primary-blue);">${s.series}</td>
                    <td class="font-medium">${s.clientNameSnapshot}</td>
                    <td class="text-right font-bold" style="color: #10b981;">${formatter.format(s.total)}</td>
                </tr>
            `).join('');
        } else {
            salesBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No hay ventas registradas</td></tr>';
        }

        // Render Low Stock
        const alertsList = document.getElementById('alerts-list');
        if (summary.lowStockItems && summary.lowStockItems.length > 0) {
            alertsList.innerHTML = summary.lowStockItems.map(p => {
                const isOut = p.stock === 0;
                return `
                <div class="alert-item ${isOut ? 'alert-out' : ''}">
                    <div class="alert-info">
                        <h3>${p.name}</h3>
                        <span>SKU: ${p.barcode}</span>
                    </div>
                    <div class="alert-qty ${isOut ? 'text-red' : 'text-orange'}">${isOut ? 'AGOTADO' : p.stock + ' Un.'}</div>
                </div>
                `;
            }).join('');
        } else {
            alertsList.innerHTML = '<div style="text-align: center; padding: 1rem; color: #10b981;">Inventario saludable.</div>';
        }

    } catch (error) {
        console.error('Error cargando métricas del dashboard:', error);
    }
});
