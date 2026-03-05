import axios from 'axios';

// const BASE_URL = 'http://localhost:8080/api'; 
const BASE_URL = 'https://agrofoodbackend-production.up.railway.app/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de request — adjunta token automáticamente
api.interceptors.request.use(
    (config) => {
        // En Zustand con persist, el store se guarda por defecto en un objeto JSON bajo la key de persistence
        const storedAuth = localStorage.getItem('agrofood_auth');
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                const user = parsed.state?.user;
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (err) {
                console.error("Error parsing auth state from local storage", err);
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
