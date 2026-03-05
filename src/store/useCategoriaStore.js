import { create } from 'zustand';
import api from '../services/api';

export const useCategoriaStore = create((set) => ({
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

    createCategoria: async (categoriaData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/categorias', categoriaData);
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

    updateCategoria: async (id, categoriaData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/categorias/${id}`, categoriaData);
            set((state) => ({
                categorias: state.categorias.map((c) => (c.idCategoria === id ? response : c)),
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
                categorias: state.categorias.filter((c) => c.idCategoria !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
