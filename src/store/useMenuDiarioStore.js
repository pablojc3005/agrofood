import { create } from 'zustand';
import api from '../services/api';

export const useMenuDiarioStore = create((set, get) => ({
    menus: [],
    loading: false,
    error: null,

    fetchMenus: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/menus');
            set({ menus: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createMenu: async (menuData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/menus', menuData);
            set((state) => ({
                menus: [...state.menus, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateMenu: async (id, menuData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.put(`/menus/${id}`, menuData);
            set((state) => ({
                menus: state.menus.map((m) => (m.idMenuDiario === id ? response : m)),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteMenu: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/menus/${id}`);
            set((state) => ({
                menus: state.menus.filter((m) => m.idMenuDiario !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
