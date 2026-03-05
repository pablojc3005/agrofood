import { create } from 'zustand';
import api from '../services/api';

export const useRolStore = create((set) => ({
    roles: [],
    loading: false,
    error: null,

    fetchRoles: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/roles');
            set({ roles: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createRol: async (rolData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/roles', rolData);
            set((state) => ({
                roles: [...state.roles, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateRol: async (id, rolData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/roles/${id}`, rolData);
            set((state) => ({
                roles: state.roles.map((r) => (r.idRol === id ? response : r)),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteRol: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/roles/${id}`);
            set((state) => ({
                roles: state.roles.filter((r) => r.idRol !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
