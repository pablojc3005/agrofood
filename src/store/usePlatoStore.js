import { create } from 'zustand';
import api from '../services/api';

export const usePlatoStore = create((set) => ({
    platos: [],
    loading: false,
    error: null,

    fetchPlatos: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/platos');
            set({ platos: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createPlato: async (platoData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/platos', platoData);
            set((state) => ({
                platos: [...state.platos, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updatePlato: async (id, platoData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/platos/${id}`, platoData);
            set((state) => ({
                platos: state.platos.map((p) => (p.idPlato === id ? response : p)),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deletePlato: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/platos/${id}`);
            set((state) => ({
                platos: state.platos.filter((p) => p.idPlato !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
