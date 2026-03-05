import { create } from 'zustand';
import api from '../services/api';

export const useTrabajadorStore = create((set) => ({
    trabajadores: [],
    loading: false,
    error: null,

    fetchTrabajadores: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/trabajadores');
            set({ trabajadores: response, loading: false });
            console.log("trabajadores", response);
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createTrabajador: async (trabajadorData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/trabajadores', trabajadorData);
            set((state) => ({
                trabajadores: [...state.trabajadores, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateTrabajador: async (id, trabajadorData) => {
        set({ loading: true, error: null });
        try {
            console.log("id trabajador", id);
            const response = await api.put(`/trabajadores/${id}`, trabajadorData);
            set((state) => ({
                trabajadores: state.trabajadores.map((t) => (t.idTrabajador === id ? response : t)),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteTrabajador: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/trabajadores/${id}`);
            set((state) => ({
                trabajadores: state.trabajadores.filter((t) => t.idTrabajador !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
