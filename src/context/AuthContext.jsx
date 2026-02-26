import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('agrofood_user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('agrofood_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('agrofood_user');
        }
    }, [user]);

    // TODO: Reemplazar con llamadas API reales (api.post('/auth/login', ...))
    const login = async (email, password) => {
        // Simulación: si el email contiene "admin" → rol ADMIN, sino EMPLEADO
        const role = email.toLowerCase().includes('admin') ? 'ADMIN' : 'EMPLEADO';
        const mockUser = {
            id: 1,
            name: role === 'ADMIN' ? 'Administrador' : 'Empleado',
            email,
            role,
            token: 'mock-jwt-token',
        };
        setUser(mockUser);
        return mockUser;
    };

    const register = async (name, email, password) => {
        const mockUser = {
            id: Date.now(),
            name,
            email,
            role: 'EMPLEADO',
            token: 'mock-jwt-token',
        };
        setUser(mockUser);
        return mockUser;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
