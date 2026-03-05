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

    fetchPedidoHoy: async (userId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/pedidos/usuario/${userId}/hoy`);
            set({ loading: false });
            return response; // Can be a Pedido object or 204 No Content (null/undefined)
        } catch (error) {
            set({ error: error.message, loading: false });
            return null;
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
    },

    deletePedido: async (pedidoId) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/pedidos/${pedidoId}`);
            set({ loading: false });
            return true;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
