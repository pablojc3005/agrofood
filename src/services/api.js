import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api'; // TODO: Ajustar con tu API

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de request — adjunta token automáticamente
api.interceptors.request.use(
    (config) => {
        const stored = localStorage.getItem('agrofood_user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response — manejo global de errores
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.response?.statusText ||
            'Error de conexión con el servidor';
        return Promise.reject(new Error(message));
    }
);

export default api;
