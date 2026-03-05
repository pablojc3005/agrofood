import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
    // Retorna todo el estado y acciones del store de Zustand
    return useAuthStore();
}
