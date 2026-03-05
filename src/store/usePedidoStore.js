import { create } from 'zustand';
import api from '../services/api';

export const usePedidoStore = create((set) => ({
    pedidos: [],
    loading: false,
    error: null,

    fetchPedidosUsuario: async (userId) => {
        set({ loading: true, error: null });
        try {
            // Adjust endpoint if necessary based on backend implementation
            const response = await api.get(`/pedidos/usuario/${userId}`);
            set({ pedidos: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createPedidoCompleto: async (pedidoData) => {
        set({ loading: true, error: null });
        try {
            const pedidoResponse = await api.post('/pedidos/completo', pedidoData);
            set({ loading: false });
            return pedidoResponse;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
