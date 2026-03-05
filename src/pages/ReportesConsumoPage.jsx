import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Search, Calendar, Users, Utensils, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useReporteStore } from '../store/useReporteStore';
import { useAreaStore } from '../store/useAreaStore';
import { useTrabajadorStore } from '../store/useTrabajadorStore';

// Libraries for Chart and Exports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

export default function ReportesConsumoPage() {
    // Initial Dates
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];

    // States
    const [fechaInicio, setFechaInicio] = useState(lastWeek);
    const [fechaFin, setFechaFin] = useState(today);
    const [idArea, setIdArea] = useState('');
    const [idTrabajador, setIdTrabajador] = useState('');
    const [search, setSearch] = useState('');

    // Stores
    const { reportes, fetchReportes, loading } = useReporteStore();
    const { areas, fetchAreas } = useAreaStore();
    const { trabajadores, fetchTrabajadores } = useTrabajadorStore();

    useEffect(() => {
        fetchAreas();
        fetchTrabajadores();
    }, [fetchAreas, fetchTrabajadores]);

    useEffect(() => {
        // Fetch report based on backend filters
        fetchReportes(fechaInicio, fechaFin, idArea || null, idTrabajador || null);
    }, [fechaInicio, fechaFin, idArea, idTrabajador, fetchReportes]);

    // Local Search Filter (for filtering on top of DB data)
    const filteredReportes = useMemo(() => {
        if (!search) return reportes || [];
        const s = search.toLowerCase();
        return (reportes || []).filter(c =>
            (c.empleado && c.empleado.toLowerCase().includes(s)) ||
            (c.segundo && c.segundo.toLowerCase().includes(s)) ||
            (c.area && c.area.toLowerCase().includes(s))
        );
    }, [reportes, search]);

    // Stats Computation
    const stats = useMemo(() => {
        let totalRaciones = 0;
        let racionesPersonal = 0;
        let racionesVisitas = 0;
        const areasCount = {};

        filteredReportes.forEach((c) => {
            totalRaciones += c.raciones || 0;
            if (c.esVisita) racionesVisitas += c.raciones || 0;
            else racionesPersonal += c.raciones || 0;

            if (c.area) {
                areasCount[c.area] = (areasCount[c.area] || 0) + (c.raciones || 0);
            }
        });

        const areaDataForChart = Object.entries(areasCount)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        const areaMasActiva = areaDataForChart.length > 0
            ? `${areaDataForChart[0].name} (${areaDataForChart[0].total})`
            : '—';

        return {
            totalRaciones,
            racionesPersonal,
            racionesVisitas,
            areaMasActiva,
            chartData: areaDataForChart
        };
    }, [filteredReportes]);

    // Exportación a EXCEL
    const exportToExcel = () => {
        if (filteredReportes.length === 0) return;
        const wsData = filteredReportes.map(r => ({
            'Fecha': r.fecha,
            'Empleado / Visita de': r.empleado,
            'Área': r.area,
            'Entrada': r.entrada,
            'Menú Elegido': r.segundo,
            'Raciones': r.raciones,
            'Tipo': r.esVisita ? 'Visita' : 'Propio'
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Consumo");
        XLSX.writeFile(wb, `Reporte_Consumo_${fechaInicio}_al_${fechaFin}.xlsx`);
    };

    // Exportación a PDF
    const exportToPDF = () => {
        if (filteredReportes.length === 0) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Reporte de Consumo AgroFood", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Desde: ${fechaInicio} - Hasta: ${fechaFin}`, 14, 30);

        const tableColumn = ["Fecha", "Empleado / Solicitante", "Área", "Menú", "Raciones", "Tipo"];
        const tableRows = [];

        filteredReportes.forEach(r => {
            const ticketData = [
                r.fecha,
                r.empleado,
                r.area,
                r.segundo,
                r.raciones?.toString(),
                r.esVisita ? 'Visita' : 'Propio'
            ];
            tableRows.push(ticketData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [4, 120, 87] } // Primary green color
        });

        doc.save(`Reporte_Consumo_${fechaInicio}_al_${fechaFin}.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Reportes de Raciones
                    </h1>
                    <p className="text-gray-500 mt-1">Conteo total de almuerzos y gráficas de consumo</p>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToExcel}
                        disabled={loading || filteredReportes.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50 border border-emerald-200"
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                        Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        disabled={loading || filteredReportes.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50 border border-red-200"
                    >
                        <FileText className="w-5 h-5" />
                        PDF
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Inicio</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fin</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Filtrar por Área</label>
                        <select
                            value={idArea}
                            onChange={(e) => setIdArea(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer"
                        >
                            <option value="">Todas las Áreas</option>
                            {areas.map(a => (
                                <option key={a.idArea} value={a.idArea}>{a.nombreArea}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Filtrar por Trabajador</label>
                        <select
                            value={idTrabajador}
                            onChange={(e) => setIdTrabajador(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer"
                        >
                            <option value="">Todos los Trabajadores</option>
                            {trabajadores.map(t => (
                                <option key={t.idTrabajador} value={t.idTrabajador}>{t.nombres} {t.apellidos}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Buscar</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Empleado o menú..."
                                className="w-full pl-10 pr-3 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl text-white shadow-xl shadow-primary/30 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-primary-light text-xs font-bold uppercase tracking-widest">Total Raciones</p>
                        <p className="text-5xl font-black mt-2">{stats.totalRaciones}</p>
                    </div>
                    <Utensils className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Personal Propio</p>
                    <p className="text-4xl font-black text-gray-800 mt-2">{stats.racionesPersonal}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Visitas / Invitados</p>
                    <p className="text-4xl font-black text-blue-600 mt-2">{stats.racionesVisitas}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">Área Mayor Consumo</p>
                    <p className="text-xl font-black text-primary mt-2 leading-tight">{stats.areaMasActiva}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabla de Detalle */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-primary" />
                            Detalle de Consumo {loading && <span className="text-xs text-primary animate-pulse">(Cargando...)</span>}
                        </h3>
                        <span className="text-xs font-bold text-gray-400">{filteredReportes.length} registros</span>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                        {filteredReportes.length === 0 && !loading ? (
                            <div className="h-full flex flex-col justify-center items-center text-gray-400">
                                <Search className="w-12 h-12 mb-3 opacity-20" />
                                <p>No se encontraron registros para estos filtros.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha / Empleado</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Menú Elegido</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Raciones</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Área</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredReportes.map((c, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{c.fecha}</p>
                                                <p className="font-bold text-gray-800 whitespace-nowrap">{c.empleado}</p>
                                                {c.esVisita && (
                                                    <span className="inline-block mt-1 text-[9px] bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                                        Visitante de: {c.solicitadoPor}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 font-medium line-clamp-1">{c.entrada}</span>
                                                    <span className="text-sm text-gray-800 font-bold line-clamp-1">{c.segundo}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg font-black text-sm ${c.raciones > 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {c.raciones}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-gray-100 text-gray-500">
                                                    {c.area}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Gráfica Recharts por Áreas */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Consumo por Área
                        </h3>
                    </div>
                    <div className="flex-1 p-6" style={{ minHeight: 0 }}>
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.chartData}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={32}>
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#9ca3af'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Sin datos para graficar
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

