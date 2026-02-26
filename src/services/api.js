const BASE_URL = 'http://localhost:8080/api'; // TODO: Ajustar cuando tengas tu API

async function request(endpoint, options = {}) {
    const user = localStorage.getItem('agrofood_user');
    const token = user ? JSON.parse(user).token : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error del servidor' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    del: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
