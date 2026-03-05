import { create } from 'zustand';
import api from '../services/api';

export const useUsuarioStore = create((set) => ({
    usuarios: [],
    loading: false,
    error: null,

    fetchUsuarios: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/usuarios');
            set({ usuarios: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createUsuario: async (usuarioData) => {
        set({ loading: true, error: null });
        try {
            // El backend ahora recibe UsuarioRequestDTO
            const response = await api.post('/usuarios', usuarioData);
            set((state) => ({
                usuarios: [...state.usuarios, response],
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateUsuario: async (id, usuarioData) => {
        set({ loading: true, error: null });
        try {
            // El backend ahora recibe UsuarioRequestDTO
            const response = await api.put(`/usuarios/${id}`, usuarioData);
            set((state) => ({
                usuarios: state.usuarios.map((u) => (u.idUsuario === id ? response : u)),
                loading: false
            }));
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteUsuario: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.delete(`/usuarios/${id}`);
            set((state) => ({
                usuarios: state.usuarios.filter((u) => u.idUsuario !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));
