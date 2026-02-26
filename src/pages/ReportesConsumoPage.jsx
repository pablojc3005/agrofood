import { useState, useMemo } from 'react';
import { BarChart3, Search, Calendar, Filter, Users, Utensils } from 'lucide-react';

// Datos mock de consumo actualizados con raciones y visitas
const mockConsumos = [
    { id: 1, fecha: '2026-02-26', empleado: 'Juan Carlos García', entrada: 'Sopa de res', segundo: 'Pollo al huacatay', area: 'Producción', raciones: 1, esVisita: false },
    { id: 2, fecha: '2026-02-26', empleado: 'Juan Carlos García', entrada: 'Tequeños', segundo: 'Olluquito', area: 'Producción', raciones: 2, esVisita: true, solicitadoPor: 'Juan Carlos García' },
    { id: 3, fecha: '2026-02-26', empleado: 'María Elena Torres', entrada: 'Sopa de res', segundo: 'Dieta pollo al pimiento', area: 'Administración', raciones: 1, esVisita: false },
    { id: 4, fecha: '2026-02-25', empleado: 'Pedro Rodríguez', entrada: 'Sopa de res', segundo: 'Pollo al huacatay', area: 'Producción', raciones: 1, esVisita: false },
    { id: 5, fecha: '2026-02-25', empleado: 'Ana Lucía Mendoza', entrada: 'Tequeños', segundo: 'Olluquito', area: 'Logística', raciones: 1, esVisita: false },
    { id: 6, fecha: '2026-02-25', empleado: 'Ana Lucía Mendoza', entrada: 'Sopa de res', segundo: 'Pollo al huacatay', area: 'Logística', raciones: 3, esVisita: true, solicitadoPor: 'Ana Lucía Mendoza' },
];

export default function ReportesConsumoPage() {
    const [fechaInicio, setFechaInicio] = useState('2026-02-20');
    const [fechaFin, setFechaFin] = useState('2026-02-26');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return mockConsumos.filter((c) => {
            const dentroRango = c.fecha >= fechaInicio && c.fecha <= fechaFin;
            const coincideBusqueda =
                c.empleado.toLowerCase().includes(search.toLowerCase()) ||
                c.segundo.toLowerCase().includes(search.toLowerCase()) ||
                c.area.toLowerCase().includes(search.toLowerCase());
            return dentroRango && coincideBusqueda;
        });
    }, [fechaInicio, fechaFin, search]);

    // Estadísticas basadas en RACIONES
    const stats = useMemo(() => {
        let totalRaciones = 0;
        let racionesPersonal = 0;
        let racionesVisitas = 0;
        const areasCount = {};

        filtered.forEach((c) => {
            totalRaciones += c.raciones;
            if (c.esVisita) racionesVisitas += c.raciones;
            else racionesPersonal += c.raciones;

            areasCount[c.area] = (areasCount[c.area] || 0) + c.raciones;
        });

        const areaMasActiva = Object.entries(areasCount).sort((a, b) => b[1] - a[1])[0];

        return {
            totalRaciones,
            racionesPersonal,
            racionesVisitas,
            areaMasActiva: areaMasActiva ? `${areaMasActiva[0]} (${areaMasActiva[1]})` : '—',
            resumenAreas: Object.entries(areasCount).map(([nombre, total]) => ({ nombre, total }))
        };
    }, [filtered]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Reportes de Raciones
                    </h1>
                    <p className="text-gray-500 mt-1">Conteo total de almuerzos y raciones por área</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Inicio</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fecha Fin</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Buscador</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Empleado o área..."
                                className="w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20">
                    <p className="text-primary-light text-xs font-bold uppercase tracking-widest">Total Raciones</p>
                    <p className="text-4xl font-black mt-2">{stats.totalRaciones}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Personal Propio</p>
                    <p className="text-3xl font-black text-gray-800 mt-2">{stats.racionesPersonal}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Visitas / Invitados</p>
                    <p className="text-3xl font-black text-gray-800 mt-2">{stats.racionesVisitas}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Área con más consumo</p>
                    <p className="text-lg font-black text-primary mt-2">{stats.areaMasActiva}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabla de Detalle */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-primary" />
                            Detalle de Consumo
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha / Empleado</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Menú Elegido</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Raciones</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Área</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{c.fecha}</p>
                                            <p className="font-bold text-gray-800">{c.empleado}</p>
                                            {c.esVisita && (
                                                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">Solicitud para Visitas</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-medium">Entrada: {c.entrada}</span>
                                                <span className="text-sm text-gray-800 font-bold">Segundo: {c.segundo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-full font-black text-sm ${c.raciones > 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {c.raciones}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-gray-100 text-gray-500">
                                                {c.area}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resumen por Áreas */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            Consumo por Área
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {stats.resumenAreas.sort((a, b) => b.total - a.total).map((area, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary group-first:bg-primary group-hover:scale-125 transition-transform" />
                                    <span className="text-sm font-bold text-gray-700">{area.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 bg-gray-100 rounded-full w-24 overflow-hidden hidden sm:block">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(area.total / stats.totalRaciones) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-black text-gray-900 w-6 text-right">{area.total}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto p-4 bg-gray-900 text-white text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Área de mayor demanda</p>
                        <p className="font-bold">{stats.areaMasActiva}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
