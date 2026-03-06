import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStore } from '../store/useDashboardStore';
import { Link } from 'react-router-dom';
import {
    UtensilsCrossed,
    Users,
    Building2,
    BarChart3,
    CalendarCheck,
    History,
    TrendingUp,
    ClipboardList,
} from 'lucide-react';

// Dashboard Admin
function AdminDashboard({ user, stats, loading }) {
    const statCards = [
        { label: 'Platos Registrados', value: stats.platosRegistrados, icon: UtensilsCrossed, color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-600' },
        { label: 'Trabajadores', value: stats.trabajadores, icon: Users, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Pedidos Hoy', value: stats.pedidosHoy, icon: ClipboardList, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
        { label: 'Áreas', value: stats.areas, icon: Building2, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-600' },
    ];

    const acciones = [
        { to: '/areas', label: 'Gestionar Áreas', desc: 'Agregar o editar áreas', icon: Building2, bg: 'bg-purple-50 hover:bg-purple-100', iconBg: 'bg-purple-500' },
        { to: '/trabajadores', label: 'Gestionar Trabajadores', desc: 'Agregar o editar personal', icon: Users, bg: 'bg-blue-50 hover:bg-blue-100', iconBg: 'bg-blue-500' },
        { to: '/platos', label: 'Gestionar Platos', desc: 'Agregar o editar menú', icon: UtensilsCrossed, bg: 'bg-green-50 hover:bg-green-100', iconBg: 'bg-green-500' },
        { to: '/reportes', label: 'Ver Reportes', desc: 'Consumo diario/semanal', icon: BarChart3, bg: 'bg-amber-50 hover:bg-amber-100', iconBg: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Bienvenido, <span className="text-primary">{user?.nombresTrabajador || user?.username || 'Admin'}</span> 👋
                </h1>
                <p className="text-gray-500 mt-1">Panel de administración — resumen general del sistema.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map(({ label, value, icon: Icon, lightColor, textColor }) => (
                    <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${lightColor} rounded-xl flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${textColor}`} />
                            </div>
                        </div>
                        {loading ? (
                            <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mb-1" />
                        ) : (
                            <p className="text-3xl font-bold text-gray-800">{value}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {acciones.map(({ to, label, desc, icon: Icon, bg, iconBg }) => (
                        <Link key={to} to={to} className={`flex items-center gap-3 p-4 rounded-xl ${bg} transition-colors group`}>
                            <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Dashboard Empleado
function EmpleadoDashboard({ user, history, loading }) {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Hola, <span className="text-primary">{user?.nombresTrabajador || user?.username || 'Empleado'}</span> 👋
                </h1>
                <p className="text-gray-500 mt-1">Selecciona tu menú del día o revisa tu historial.</p>
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    to="/seleccionar-menu"
                    className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all group"
                >
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CalendarCheck className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold">Seleccionar Menú</h3>
                    <p className="text-green-100 mt-1 text-sm">Elige tu almuerzo para hoy</p>
                </Link>

                <Link
                    to="/mi-historial"
                    className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all group"
                >
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <History className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold">Mi Historial</h3>
                    <p className="text-blue-100 mt-1 text-sm">Consulta tus almuerzos anteriores</p>
                </Link>
            </div>

            {/* Últimos almuerzos */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Últimos Almuerzos
                </h2>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 w-full bg-gray-100 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-3">
                        {history.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.segundo || 'Sin plato'}</p>
                                        <p className="text-xs text-gray-500">{item.entrada || 'Sin entrada'}</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">{item.fecha}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No tienes almuerzos registrados recientemente.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { stats, userHistory, loading, fetchAdminStats, fetchUserHistory } = useDashboardStore();

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchAdminStats();
        }
        if (user?.id) {
            fetchUserHistory(user.id);
        }
    }, [user, fetchAdminStats, fetchUserHistory]);

    if (user?.role === 'ADMIN') {
        return <AdminDashboard user={user} stats={stats} loading={loading} />;
    }

    return <EmpleadoDashboard user={user} history={userHistory} loading={loading} />;
}
