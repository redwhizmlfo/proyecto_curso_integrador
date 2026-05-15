const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('API Get Error:', error);
            throw error;
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error processing request');
            }
            return await response.json();
        } catch (error) {
            console.error('API Post Error:', error);
            throw error;
        }
    },
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return true;
        } catch (error) {
            console.error('API Delete Error:', error);
            throw error;
        }
    }
};

export default api;
