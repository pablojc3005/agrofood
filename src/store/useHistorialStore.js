import { create } from 'zustand';
import api from '../services/api';

export const useHistorialStore = create((set) => ({
    historial: [],
    loading: false,
    error: null,

    fetchHistorialUsuario: async (idUsuario, fechaInicio, fechaFin) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/reportes/historial/${idUsuario}`, {
                params: {
                    fechaInicio,
                    fechaFin
                }
            });
            set({ historial: response, loading: false });
        } catch (error) {
            console.error('Error fetching historial:', error);
            set({ error: error.message, loading: false });
        }
    }
}));
