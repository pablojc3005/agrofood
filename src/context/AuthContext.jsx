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

    // TODO: Reemplazar con llamadas API reales
    const login = async (email, password) => {
        // Simulación — aceptar cualquier credencial por ahora
        const mockUser = { id: 1, name: 'Usuario', email };
        setUser(mockUser);
        return mockUser;
    };

    const register = async (name, email, password) => {
        // Simulación — crear usuario mock
        const mockUser = { id: Date.now(), name, email };
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
