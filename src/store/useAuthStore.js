import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,

            login: async (username, password) => {
                try {
                    const response = await api.post('/usuarios/login', { username, password });

                    // El backend devuelve UsuarioResponseDTO que incluye el perfil completo
                    // Aplanamos el rol para facilitar el uso en el frontend
                    const userProfile = {
                        ...response,
                        role: response.nombreRol, // Usamos nombreRol como role ('ADMIN' o 'EMPLEADO')
                        name: response.nombresTrabajador || response.username,
                        token: 'mock-jwt-token', // Por ahora el backend no maneja JWT real, lo simulamos para que el interceptor funcione
                    };

                    set({ user: userProfile });
                    return userProfile;
                } catch (error) {
                    throw error;
                }
            },

            register: async (userData) => {
                try {
                    const response = await api.post('/usuarios/register', userData);

                    const userProfile = {
                        ...response,
                        role: response.nombreRol,
                        name: response.nombresTrabajador || response.username,
                        token: 'mock-jwt-token',
                    };

                    set({ user: userProfile });
                    return userProfile;
                } catch (error) {
                    throw error;
                }
            },

            logout: () => {
                set({ user: null });
            },
        }),
        {
            name: 'agrofood_auth',
        }
    )
);
