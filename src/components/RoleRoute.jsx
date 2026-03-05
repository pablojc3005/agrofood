import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ allowedRoles, children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Si el usuario es ADMIN, puede acceder a TODO
    if (user.role === 'ADMIN') {
        return children;
    }

    // Si no es ADMIN, verificar que su rol esté en los permitidos
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}