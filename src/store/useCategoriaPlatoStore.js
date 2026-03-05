import { create } from 'zustand';
import api from '../services/api';

export const useCategoriaPlatoStore = create((set) => ({
    categorias: [],
    loading: false,
    error: null,

    fetchCategorias: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/categorias');
            set({ categorias: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createCategoria: async (data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/categorias', data);
            set((state) => ({
                categorias: [...state.categorias, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateCategoria: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/categorias/${id}`, data);
            set((state) => ({
                categorias: state.categorias.map(c => c.idCategoria === id ? response : c),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteCategoria: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/categorias/${id}`);
            set((state) => ({
                categorias: state.categorias.filter(c => c.idCategoria !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
