import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from '../components/RoleRoute';
import SidebarLayout from '../layouts/SidebarLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import MenuPlatosPage from '../pages/MenuPlatosPage';
import AreasPage from '../pages/AreasPage';
import TrabajadoresPage from '../pages/TrabajadoresPage';
import ReportesConsumoPage from '../pages/ReportesConsumoPage';
import SeleccionMenuPage from '../pages/SeleccionMenuPage';
import MiHistorialPage from '../pages/MiHistorialPage';
import RolesPage from '../pages/RolesPage';
import UsuariosPage from '../pages/UsuariosPage';
import MenuDiarioPage from '../pages/MenuDiarioPage';
import CategoriasPlatoPage from '../pages/CategoriasPlatoPage';

export default function AppRouter() {

    return (
        <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            {/* Registro ahora se maneja dentro de UsuariosPage por el Admin */}
            {/* <Route path="/register" element={<RegisterPage />} /> */}

            {/* Rutas protegidas con Sidebar */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <SidebarLayout />
                    </ProtectedRoute>
                }
            >
                {/* Dashboard — compartido (contenido varía por rol) */}
                <Route index element={<DashboardPage />} />

                {/* Rutas exclusivas Admin */}
                <Route path="usuarios" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <UsuariosPage />
                    </RoleRoute>
                } />
                {/* Rutas exclusivas Admin */}
                <Route path="roles" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <RolesPage />
                    </RoleRoute>
                } />
                {/* Rutas exclusivas Admin */}
                <Route path="areas" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <AreasPage />
                    </RoleRoute>
                } />
                <Route path="trabajadores" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <TrabajadoresPage />
                    </RoleRoute>
                } />
                <Route path="categorias" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <CategoriasPlatoPage />
                    </RoleRoute>
                } />
                <Route path="platos" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <MenuPlatosPage />
                    </RoleRoute>
                } />
                <Route path="configurar-menu" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <MenuDiarioPage />
                    </RoleRoute>
                } />
                <Route path="reportes" element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                        <ReportesConsumoPage />
                    </RoleRoute>
                } />

                {/* Rutas exclusivas Empleado */}
                <Route path="seleccionar-menu" element={
                    <RoleRoute allowedRoles={['EMPLEADO']}>
                        <SeleccionMenuPage />
                    </RoleRoute>
                } />
                <Route path="mi-historial" element={
                    <RoleRoute allowedRoles={['EMPLEADO']}>
                        <MiHistorialPage />
                    </RoleRoute>
                } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
