import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    loadUsers();

    document.getElementById('employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEmployee();
    });

    document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveUser();
    });
});

async function loadEmployees() {
    try {
        const employees = await api.get('/employees');
        const tbody = document.getElementById('employees-body');
        const select = document.getElementById('u_employee');
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay empleados registrados.</td></tr>';
            select.innerHTML = '<option value="">No hay empleados</option>';
            return;
        }

        tbody.innerHTML = employees.map(e => `
            <tr>
                <td style="padding-left: 1.5rem; font-weight: 600;">${e.dni}</td>
                <td style="font-weight: 600; color: var(--primary-blue);">${e.name}</td>
                <td>${e.role}</td>
                <td>S/ ${e.payPerDay.toFixed(2)}</td>
                <td><span class="badge badge-active">ACTIVO</span></td>
            </tr>
        `).join('');

        select.innerHTML = employees.map(e => `<option value="${e.id}">${e.name} (${e.role})</option>`).join('');
    } catch (error) {
        console.error(error);
    }
}

async function loadUsers() {
    try {
        const users = await api.get('/users');
        const tbody = document.getElementById('users-body');
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay usuarios con acceso.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="padding-left: 1.5rem; font-weight: 600; color: var(--text-main);">${u.username}</td>
                <td>${u.employee ? u.employee.name : 'Desconocido'}</td>
                <td style="font-weight: 600;">${u.role}</td>
                <td><span class="badge badge-active">${u.status.toUpperCase()}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
    }
}

async function saveEmployee() {
    const payload = {
        dni: document.getElementById('e_dni').value,
        name: document.getElementById('e_name').value,
        initials: document.getElementById('e_initials').value,
        role: document.getElementById('e_role').value,
        payPerDay: parseFloat(document.getElementById('e_pay').value)
    };

    try {
        await api.post('/employees', payload);
        document.getElementById('employeeModal').style.display = 'none';
        document.getElementById('employee-form').reset();
        loadEmployees();
    } catch (error) {
        alert('Error al guardar empleado: ' + error.message);
    }
}

async function saveUser() {
    const payload = {
        employeeId: document.getElementById('u_employee').value,
        username: document.getElementById('u_username').value,
        password: document.getElementById('u_password').value,
        role: document.getElementById('u_role').value
    };

    try {
        await api.post('/users', payload);
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('user-form').reset();
        loadUsers();
    } catch (error) {
        alert('Error al crear usuario: ' + error.message);
    }
}
