import { create } from 'zustand';
import api from '../services/api';

export const useDashboardStore = create((set) => ({
    stats: {
        platosRegistrados: 0,
        trabajadores: 0,
        pedidosHoy: 0,
        areas: 0,
    },
    userHistory: [],
    loading: false,
    error: null,

    fetchAdminStats: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/dashboard/admin-stats');
            set({ stats: response, loading: false });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            set({ error: error.message, loading: false });
        }
    },

    fetchUserHistory: async (idUsuario) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get(`/dashboard/user-history/${idUsuario}`);
            set({ userHistory: response, loading: false });
        } catch (error) {
            console.error('Error fetching user history:', error);
            set({ error: error.message, loading: false });
        }
    }
}));
