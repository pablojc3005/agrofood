import { useState, useEffect, useMemo } from 'react';
import { History, Search, Calendar, ChevronRight, Loader2, Pencil, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHistorialStore } from '../store/useHistorialStore';
import { usePedidoStore } from '../store/usePedidoStore';
import { getLocalDateStr } from '../utils/dateUtils';
import Swal from 'sweetalert2';

export default function MiHistorialPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { historial, fetchHistorialUsuario, loading } = useHistorialStore();
    const { deletePedido } = usePedidoStore();

    const [search, setSearch] = useState('');

    // Rango de fechas por defecto (mes actual)
    const [fechaDesde, setFechaDesde] = useState(() => {
        const d = new Date();
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
        const year = firstDay.getFullYear();
        const month = String(firstDay.getMonth() + 1).padStart(2, '0');
        const day = String(firstDay.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [fechaHasta, setFechaHasta] = useState(getLocalDateStr());

    useEffect(() => {
        if (user?.idUsuario) {
            fetchHistorialUsuario(user.idUsuario, fechaDesde, fechaHasta);
        }
    }, [user, fechaDesde, fechaHasta, fetchHistorialUsuario]);

    const filtered = useMemo(() => {
        return historial.filter(h =>
        (h.entrada?.toLowerCase().includes(search.toLowerCase()) ||
            h.segundo?.toLowerCase().includes(search.toLowerCase()))
        );
    }, [historial, search]);

    const totales = useMemo(() => {
        return filtered.reduce((acc, curr) => ({
            raciones: acc.raciones + (curr.totalRaciones || 0),
            costo: acc.costo + (curr.costoTotal || 0)
        }), { raciones: 0, costo: 0 });
    }, [filtered]);

    const hoyStr = useMemo(() => getLocalDateStr(), []);

    const handleModify = () => {
        navigate('/seleccionar-menu', { state: { isModifying: true } });
    };

    const handleCancel = async (idPedido) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se cancelará tu pedido de hoy.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#111827',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener'
        });

        if (result.isConfirmed) {
            try {
                await deletePedido(idPedido);
                Swal.fire('Cancelado', 'Tu pedido ha sido eliminado.', 'success');
                // Recargar historial
                fetchHistorialUsuario(user.idUsuario, fechaDesde, fechaHasta);
            } catch (err) {
                Swal.fire('Error', 'No se pudo cancelar: ' + err.message, 'error');
            }
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-gray-800 flex items-center gap-3">
                        <History className="w-10 h-10 text-primary" />
                        Mi Historial
                    </h1>
                    <p className="text-gray-500 font-medium">Revisa tus consumos y raciones solicitadas</p>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" /> Actualizando...
                    </div>
                )}
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Filtrar por Plato</label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-colors">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Raciones</p>
                        <p className="text-4xl font-black text-gray-800">{totales.raciones}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl">
                        #
                    </div>
                </div>
                <div className="bg-gray-900 p-6 rounded-3xl text-white shadow-xl shadow-gray-200 flex items-center justify-between group border border-gray-800 hover:border-gray-700 transition-colors">
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Inversión Total</p>
                        <p className="text-4xl font-black text-white">S/ {totales.costo.toFixed(2)}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                        S/
                    </div>
                </div>
            </div>

            {/* Lista de Historial */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menú Consumido</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Raciones</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Importe</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-300">
                                            <History className="w-12 h-12" />
                                            <p className="text-gray-400 font-medium italic">No se encontraron pedidos en este periodo</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((h, idx) => (
                                    <tr key={`${h.fecha}-${idx}`} className="group hover:bg-primary/2 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="bg-gray-50 rounded-2xl p-2 inline-block text-center min-w-[60px] group-hover:bg-white transition-colors">
                                                <p className="font-black text-gray-800 text-lg leading-tight">{new Date(h.fecha + 'T12:00:00').getDate()}</p>
                                                <p className="text-[10px] text-primary font-black uppercase tracking-tighter">{new Date(h.fecha + 'T12:00:00').toLocaleDateString('es-PE', { month: 'short' })}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Entrada: {h.entrada || 'No especificada'}</span>
                                                <span className="text-base text-gray-800 font-bold group-hover:text-primary transition-colors">Segundo: {h.segundo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-black text-gray-800">{h.totalRaciones}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">

                                                <span className="font-black text-gray-900 text-lg">S/ {(h.costoTotal || 0).toFixed(2)}</span>
                                                {/*
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-300 group-hover:bg-primary group-hover:text-white transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                                */}

                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {h.fecha === hoyStr && (
                                                    <div className="flex items-center gap-2 mr-4">
                                                        {(() => {
                                                            const now = new Date();
                                                            const [hLim, mLim, sLim] = (h.horaLimite || '09:00:00').split(':').map(Number);
                                                            const limite = new Date();
                                                            limite.setHours(hLim, mLim, sLim || 0, 0);
                                                            const isExpired = now > limite;

                                                            if (isExpired) return (
                                                                <span className="text-[10px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" /> Tiempo agotado
                                                                </span>
                                                            );

                                                            return (
                                                                <>
                                                                    <button
                                                                        onClick={handleModify}
                                                                        className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                                                                        title="Modificar pedido"
                                                                    >
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancel(h.idPedido)}
                                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                                        title="Cancelar pedido"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
