import { create } from 'zustand';
import api from '../services/api';

export const useReporteStore = create((set) => ({
    reportes: [],
    loading: false,
    error: null,

    fetchReportes: async (fechaInicio, fechaFin, idArea = null, idTrabajador = null) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams();
            params.append('fechaInicio', fechaInicio);
            params.append('fechaFin', fechaFin);
            if (idArea) params.append('idArea', idArea);
            if (idTrabajador) params.append('idTrabajador', idTrabajador);

            const response = await api.get(`/reportes/consumo?${params.toString()}`);
            set({ reportes: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    }
}));
