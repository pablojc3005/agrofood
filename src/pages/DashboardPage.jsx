import { useAuth } from '../hooks/useAuth';
import { UtensilsCrossed, Users, ClipboardList, TrendingUp } from 'lucide-react';

const stats = [
    {
        label: 'Platos Registrados',
        value: '24',
        icon: UtensilsCrossed,
        color: 'bg-green-500',
        lightColor: 'bg-green-50',
        textColor: 'text-green-600',
    },
    {
        label: 'Personal Activo',
        value: '58',
        icon: Users,
        color: 'bg-blue-500',
        lightColor: 'bg-blue-50',
        textColor: 'text-blue-600',
    },
    {
        label: 'Pedidos Hoy',
        value: '42',
        icon: ClipboardList,
        color: 'bg-amber-500',
        lightColor: 'bg-amber-50',
        textColor: 'text-amber-600',
    },
    {
        label: 'Satisfacción',
        value: '96%',
        icon: TrendingUp,
        color: 'bg-purple-500',
        lightColor: 'bg-purple-50',
        textColor: 'text-purple-600',
    },
];

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Bienvenido, <span className="text-primary">{user?.name || 'Usuario'}</span> 👋
                </h1>
                <p className="text-gray-500 mt-1">
                    Aquí tienes un resumen general de tu sistema.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map(({ label, value, icon: Icon, color, lightColor, textColor }) => (
                    <div
                        key={label}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${lightColor} rounded-xl flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${textColor}`} />
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${lightColor} ${textColor}`}>
                                +12%
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{value}</p>
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <a
                        href="/platos"
                        className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
                    >
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Gestionar Platos</p>
                            <p className="text-xs text-gray-500">Agregar o editar menú</p>
                        </div>
                    </a>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group cursor-pointer">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Ver Personal</p>
                            <p className="text-xs text-gray-500">Próximamente</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors group cursor-pointer">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Ver Pedidos</p>
                            <p className="text-xs text-gray-500">Próximamente</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
