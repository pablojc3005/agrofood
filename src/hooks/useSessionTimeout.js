import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import Swal from 'sweetalert2';

export function useSessionTimeout(timeoutMs = 180000) { // Default 3 minutes (180,000 ms)
    const { user, logout } = useAuth();
    const timeoutRef = useRef(null);

    const handleLogout = useCallback(() => {
        if (user) {
            logout();
            Swal.fire({
                icon: 'info',
                title: 'Sesión finalizada',
                text: 'Tu sesión ha cerrado por inactividad para mejorar el rendimiento del sistema.',
                confirmButtonColor: '#111827',
                timer: 5000
            });
        }
    }, [user, logout]);

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (user) {
            timeoutRef.current = setTimeout(handleLogout, timeoutMs);
        }
    }, [handleLogout, timeoutMs, user]);

    useEffect(() => {
        if (!user) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        // Eventos a monitorear para resetear el timer
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const resetHandler = () => resetTimeout();

        events.forEach(event => {
            window.addEventListener(event, resetHandler);
        });

        // Iniciar el timer al montar o al loguear
        resetTimeout();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetHandler);
            });
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [user, resetTimeout]);

    return { resetTimeout };
}
