import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    LayoutDashboard,
    UtensilsCrossed,
    LogOut,
    Leaf,
    X,
    Users,
    Building2,
    BarChart3,
    CalendarCheck,
    History,
    UserRoundKey,
    ShieldUser,
    Tags, // Added Tags icon
} from 'lucide-react';

const adminMenu = [
    //{ to: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
        //title: 'Menú Principal',
        items: [
            { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        ]
    },
    {
        title: 'Gestión Maestra',
        items: [
            { to: '/roles', label: 'Roles', icon: ShieldUser },
            { to: '/usuarios', label: 'Usuarios', icon: UserRoundKey },
            { to: '/areas', label: 'Áreas', icon: Building2 },
            { to: '/trabajadores', label: 'Trabajadores', icon: Users },
            { to: '/categorias', label: 'Categorías Menú', icon: Tags },
            { to: '/platos', label: 'Platos / Menú', icon: UtensilsCrossed },
        ]
    },
    {
        title: 'Operaciones',
        items: [
            { to: '/configurar-menu', label: 'Gestión Menú Diario', icon: CalendarCheck },
            { to: '/reportes', label: 'Reportes de Consumo', icon: BarChart3 },
        ]
    },
    {
        title: 'Pedir Menú',
        items: [
            { to: '/seleccionar-menu', label: 'Seleccionar Menú', icon: CalendarCheck },
            { to: '/mi-historial', label: 'Mi Historial', icon: History },
        ]
    }
];

const empleadoMenu = [
    {
        title: 'Menú Principal',
        items: [
            { to: '/', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/seleccionar-menu', label: 'Seleccionar Menú', icon: CalendarCheck },
            { to: '/mi-historial', label: 'Mi Historial', icon: History },
        ]
    }
];

export default function Sidebar({ isOpen, onClose }) {
    const { logout, user } = useAuth();
    const menuGroups = user?.role === 'ADMIN' ? adminMenu : empleadoMenu;

    const roleBadge = user?.role === 'ADMIN'
        ? { text: 'Admin', color: 'bg-amber-500/20 text-amber-400' }
        : { text: 'Empleado', color: 'bg-blue-500/20 text-blue-400' };

    return (
        <>
            {/* Overlay para móvil */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 z-50 h-dvh w-64 bg-secondary text-white
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                {/* User Info */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-light/20 flex items-center justify-center text-primary-light font-bold text-sm">
                            {(user?.nombresTrabajador || user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-medium truncate">
                                {user?.nombresTrabajador
                                    ? `${user.nombresTrabajador} ${user.apellidosTrabajador?.split(' ')[0] || ''}`
                                    : user?.username || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{user?.email || (user?.emailTrabajador || '')}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge.color}`}>
                        {roleBadge.text}
                    </span>

                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto min-h-0">
                    {menuGroups.map((group) => (
                        <div key={group.title}>
                            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                {group.title}
                            </p>
                            <div className="space-y-1">
                                {group.items.map(({ to, label, icon: Icon }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={to === '/'}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`
                                        }
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 py-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
