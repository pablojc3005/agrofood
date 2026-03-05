import { create } from 'zustand';
import api from '../services/api';

export const useAreaStore = create((set) => ({
    areas: [],
    loading: false,
    error: null,

    fetchAreas: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/areas');
            console.log("lista de areas : ", response);
            set({ areas: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createArea: async (areaData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/areas', areaData);
            set((state) => ({
                areas: [...state.areas, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateArea: async (id, areaData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/areas/${id}`, areaData);
            set((state) => ({
                areas: state.areas.map((area) => (area.idArea === id ? response : area)),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteArea: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/areas/${id}`);
            set((state) => ({
                areas: state.areas.filter((area) => area.idArea !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
