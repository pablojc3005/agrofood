import { useState } from 'react';
import { History, Search, Calendar, ChevronRight } from 'lucide-react';

// Datos mock actualizados para el historial del usuario
const mockMiHistorial = [
    { id: 1, fecha: '2026-02-26', entrada: 'Sopa de res', segundo: 'Pollo al huacatay', racionesExtra: 2, totalRaciones: 3, costoTotal: 37.50 },
    { id: 2, fecha: '2026-02-25', entrada: 'Tequeños', segundo: 'Olluquito', racionesExtra: 0, totalRaciones: 1, costoTotal: 12.50 },
    { id: 3, fecha: '2026-02-24', entrada: 'Sopa de res', segundo: 'Lomo saltado', racionesExtra: 1, totalRaciones: 2, costoTotal: 27.50 },
    { id: 4, fecha: '2026-02-23', entrada: 'Tequeños', segundo: 'Arroz con pollo', racionesExtra: 0, totalRaciones: 1, costoTotal: 12.50 },
];

export default function MiHistorialPage() {
    const [search, setSearch] = useState('');
    const [fechaDesde, setFechaDesde] = useState('2026-02-01');
    const [fechaHasta, setFechaHasta] = useState('2026-02-28');

    const filtered = mockMiHistorial.filter(h =>
        h.fecha >= fechaDesde && h.fecha <= fechaHasta &&
        (h.entrada.toLowerCase().includes(search.toLowerCase()) ||
            h.segundo.toLowerCase().includes(search.toLowerCase()))
    );

    const totales = filtered.reduce((acc, curr) => ({
        raciones: acc.raciones + curr.totalRaciones,
        costo: acc.costo + curr.costoTotal
    }), { raciones: 0, costo: 0 });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <History className="w-8 h-8 text-primary" />
                    Mi Historial de Almuerzos
                </h1>
                <p className="text-gray-500 mt-1">Revisa tus elecciones y raciones solicitadas</p>
            </div>

            {/* Filtros */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Desde</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hasta</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Buscar Plato</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Sopa, Pollo, etc..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Raciones</p>
                        <p className="text-3xl font-black text-gray-800">{totales.raciones}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                        #
                    </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-xl shadow-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Inversión Total</p>
                        <p className="text-3xl font-black text-white">S/ {totales.costo.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center font-bold">
                        S/
                    </div>
                </div>
            </div>

            {/* Lista de Historial */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Menú Seleccionado</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Raciones</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Costo Estimado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No hay registros para este período</td>
                            </tr>
                        ) : (
                            filtered.map((h) => (
                                <tr key={h.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">{new Date(h.fecha + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(h.fecha + 'T12:00:00').getFullYear()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 font-medium">Entrada: {h.entrada}</span>
                                            <span className="text-sm text-gray-800 font-bold">Segundo: {h.segundo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${h.racionesExtra > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {h.totalRaciones}
                                            </span>
                                            {h.racionesExtra > 0 && <span className="text-[9px] text-blue-500 font-bold mt-1">+{h.racionesExtra} Visitas</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="font-black text-gray-800">S/ {h.costoTotal.toFixed(2)}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-primary transition-colors" />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
