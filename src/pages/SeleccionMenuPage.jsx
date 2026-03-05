import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    CalendarCheck, Check, Clock, Users, UserPlus,
    Trash2, AlertCircle, Utensils, ChevronRight,
    CheckCircle2,
    ArrowRight,
    History
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';
import { useMenuDiarioStore } from '../store/useMenuDiarioStore';
import { usePedidoStore } from '../store/usePedidoStore';

// Eliminamos MENU_HOY hardcodeado
const HORA_POR_DEFECTO = '10:00';

export default function SeleccionMenuPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { menus, fetchMenus, loading: loadingMenus } = useMenuDiarioStore();
    const { createPedidoCompleto, fetchPedidoHoy, loading: loadingPedido } = usePedidoStore();
    const isAdmin = user?.role === 'ADMIN';

    const [miEntrada, setMiEntrada] = useState('');
    const [miSegundo, setMiSegundo] = useState('');
    const [visitas, setVisitas] = useState([]);
    const [confirmado, setConfirmado] = useState(false);
    const [tiempoAgotado, setTiempoAgotado] = useState(false);

    // Obtener fecha local actual YYYY-MM-DD
    const getLocalDateStr = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fechaHoyStr = useMemo(() => getLocalDateStr(), []);

    useEffect(() => {
        fetchMenus();

        const isFromModify = location.state?.fromModify;

        // Verificar si ya existe un pedido hoy
        if (user?.idUsuario && !isFromModify) {
            fetchPedidoHoy(user.idUsuario).then(pedidoExistente => {
                if (pedidoExistente) {
                    setConfirmado(true);
                }
            });
        }
    }, [fetchMenus, fetchPedidoHoy, user?.idUsuario, location.state]);

    // Filtrar menús usando las propiedades del DTO plano (nombrePlato, nombreCategoria)
    const menuHoyList = useMemo(() =>
        menus.filter(m => m.fechaMenu === fechaHoyStr && m.activo),
        [menus, fechaHoyStr]);

    const entradas = useMemo(() =>
        menuHoyList.filter(m =>
            m.nombreCategoria?.toLowerCase().includes('entrada') ||
            m.nombreCategoria?.toLowerCase().includes('sopa')
        ), [menuHoyList]);

    const segundos = useMemo(() =>
        menuHoyList.filter(m =>
            m.nombreCategoria?.toLowerCase().includes('segundo') ||
            m.nombreCategoria?.toLowerCase().includes('fondo')
        ), [menuHoyList]);

    const horaLimiteOriginal = useMemo(() =>
        menuHoyList.length > 0 ? menuHoyList[0].horaLimite : '10:00:00',
        [menuHoyList]);

    // Formatear hora de 24h a 12h para mostrarla (Ej: 15:00 -> 3:00 PM)
    const formatTime12h = (time24) => {
        if (!time24) return '--:--';
        const [h, m] = time24.split(':');
        const hh = parseInt(h);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    const checkTimeLimit = useCallback(() => {
        if (!horaLimiteOriginal || isAdmin) return;

        const now = new Date();
        const [h, m, s] = horaLimiteOriginal.split(':').map(Number);

        const limite = new Date();
        limite.setHours(h, m, s || 0, 0);

        if (now > limite) {
            setTiempoAgotado(true);
        } else {
            setTiempoAgotado(false);
        }
    }, [horaLimiteOriginal, isAdmin]);

    useEffect(() => {
        checkTimeLimit();
        const timer = setInterval(checkTimeLimit, 30000); // Check every 30s
        return () => clearInterval(timer);
    }, [checkTimeLimit]);

    const addVisita = () => {
        setVisitas([...visitas, {
            id: Date.now(),
            nombre: '',
            entrada: entradas[0]?.idMenuDiario || '',
            segundo: segundos[0]?.idMenuDiario || ''
        }]);
    };

    const removeVisita = (id) => setVisitas(visitas.filter(v => v.id !== id));
    const updateVisita = (id, field, value) => {
        setVisitas(visitas.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleConfirmar = async () => {
        if (!miSegundo) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección incompleta',
                text: 'Debes elegir al menos un segundo/fondo para ti.',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        const menuEntrada = miEntrada ? menuHoyList.find(m => m.idMenuDiario === Number(miEntrada)) : null;
        const menuSegundo = menuHoyList.find(m => m.idMenuDiario === Number(miSegundo));
        const totalRaciones = 1 + visitas.length;

        const result = await Swal.fire({
            title: '¿Confirmar pedido?',
            html: `
                <div class="text-sm text-left p-2 bg-gray-50 rounded-xl space-y-2">
                    <p className="font-bold border-b pb-1">Para ti:</p>
                    <p className="pl-2">${menuEntrada ? '• ' + menuEntrada.nombrePlato + '<br/>' : ''}• ${menuSegundo?.nombrePlato}</p>
                    ${visitas.length > 0 ? `
                        <p className="font-bold border-b pb-1 pt-2">Visitas (${visitas.length}):</p>
                        <ul class="pl-2 space-y-1">
                            ${visitas.map(v => {
                const ve = v.entrada ? menuHoyList.find(m => m.idMenuDiario === Number(v.entrada)) : null;
                const vs = menuHoyList.find(m => m.idMenuDiario === Number(v.segundo));
                return `<li class="text-xs"><strong>${v.nombre || 'Invitado'}:</strong> ${ve ? ve.nombrePlato + ' + ' : ''}${vs?.nombrePlato}</li>`;
            }).join('')}
                        </ul>
                    ` : ''}
                    <div class="pt-2 mt-2 border-t flex justify-between font-black text-primary text-base">
                        <span>TOTAL RACIONES:</span>
                        <span>${totalRaciones}</span>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, registrar pedido',
            cancelButtonText: 'Revisar'
        });

        if (result.isConfirmed) {
            try {
                const pedidoRequestDTO = {
                    idUsuario: user.idUsuario,
                    idTrabajador: user.idTrabajador || null,
                    idMenuEntrada: miEntrada ? Number(miEntrada) : null,
                    idMenuSegundo: Number(miSegundo),
                    notasGenerales: `Pedido automático generado el ${getLocalDateStr()}`,
                    visitas: visitas.map(v => ({
                        nombreVisitante: v.nombre,
                        idMenuEntrada: v.entrada ? Number(v.entrada) : null,
                        idMenuSegundo: Number(v.segundo)
                    }))
                };

                await createPedidoCompleto(pedidoRequestDTO);

                setConfirmado(true);
                Swal.fire({ icon: 'success', title: '¡Realizado!', text: 'Tu pedido ha sido registrado exitosamente.', timer: 2000, showConfirmButton: false });
            } catch (err) {
                Swal.fire('Error', 'No se pudo sincronizar: ' + err.message, 'error');
            }
        }
    };

    const fechaHoyNormalizada = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

    if (confirmado) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 text-white rounded-3xl shadow-xl shadow-green-200 flex items-center justify-center mx-auto mb-8 rotate-3">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">¡Todo listo!</h1>
                <p className="text-gray-500 font-medium mb-12">Disfruta de tu almuerzo, ya hemos avisado a la cocina.</p>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-left space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Utensils className="w-20 h-20 rotate-12" /></div>
                    <div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Tu Selección</p>
                        <p className="text-xl font-bold text-gray-800 leading-tight">
                            {miEntrada && menuHoyList.find(m => m.idMenuDiario === Number(miEntrada)) ? (
                                <span>{menuHoyList.find(m => m.idMenuDiario === Number(miEntrada))?.nombrePlato} <br /> <ArrowRight className="inline w-4 h-4 text-gray-300 mx-2" /> </span>
                            ) : null}
                            {menuHoyList.find(m => m.idMenuDiario === Number(miSegundo))?.nombrePlato || 'Pedido registrado para hoy'}
                        </p>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <p className="text-sm text-gray-400 font-medium">
                        ¿Necesitas cambiar algo? Los cambios o cancelaciones se realizan desde tu historial.
                    </p>
                    <button
                        onClick={() => navigate('/mi-historial')}
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 mx-auto"
                    >
                        <History className="w-4 h-4" /> Ir a Mi Historial
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Banner Premium */}
            <div className="relative overflow-hidden bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Almuerzo de Hoy</span>
                            {tiempoAgotado && !isAdmin && <span className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">Finalizado</span>}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 capitalize leading-tight">
                            {fechaHoyNormalizada}
                        </h1>
                    </div>

                    <div className={`p-6 rounded-4xl flex items-center gap-5 border transition-all duration-500 ${tiempoAgotado ? 'bg-red-50 border-red-100' : 'bg-gray-900 border-gray-800 text-white shadow-2xl shadow-gray-200'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${tiempoAgotado ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white'}`}>
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hora Límite</p>
                            <p className="text-2xl font-black leading-none mt-1">
                                {formatTime12h(horaLimiteOriginal)}
                            </p>
                        </div>
                    </div>
                </div>

                {tiempoAgotado && (
                    <div className="mt-8 p-5 bg-red-100/50 text-red-700 rounded-2xl flex items-center gap-4 border border-red-100 backdrop-blur-sm">
                        <AlertCircle className="w-8 h-8 shrink-0 text-red-500" />
                        <div className="text-sm">
                            <p className="font-black text-red-800 uppercase tracking-tight">¡Atención!</p>
                            <p className="font-medium">El horario de cierre para pedidos online ha expirado. Comunícate con Administración para ingresos extemporáneos.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${tiempoAgotado && !isAdmin ? 'opacity-40 grayscale pointer-events-none' : ''}`}>

                {/* Selección Individual */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Utensils className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-800">Selección Individual</h2>
                        </div>

                        <div className="space-y-12">
                            {/* Entradas */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-6">1. Entrada o Sopa</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {entradas.map(m => (
                                        <label key={m.idMenuDiario} className={`group relative flex items-center p-5 rounded-3xl border-2 transition-all cursor-pointer ${miEntrada === m.idMenuDiario.toString() ? 'border-primary bg-primary/5' : 'border-gray-50 hover:bg-gray-50'}`}>
                                            <input type="radio" name="miEntrada" value={m.idMenuDiario} checked={miEntrada === m.idMenuDiario.toString()} onChange={(e) => setMiEntrada(e.target.value)} className="sr-only" />
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${miEntrada === m.idMenuDiario.toString() ? 'border-primary bg-primary shadow-lg shadow-primary/30' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                {miEntrada === m.idMenuDiario.toString() && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className={`text-lg font-bold ${miEntrada === m.idMenuDiario.toString() ? 'text-primary' : 'text-gray-700'}`}>{m.nombrePlato}</span>
                                        </label>
                                    ))}
                                    {entradas.length === 0 && <p className="text-gray-400 font-medium italic p-4 bg-gray-50 rounded-2xl w-full">Sin opciones de entrada hoy</p>}
                                </div>
                            </div>

                            {/* Segundos */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-6">2. Plato de Fondo</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {segundos.map(m => (
                                        <label key={m.idMenuDiario} className={`group relative flex items-center p-5 rounded-3xl border-2 transition-all cursor-pointer ${miSegundo === m.idMenuDiario.toString() ? 'border-primary bg-primary/5' : 'border-gray-50 hover:bg-gray-50'}`}>
                                            <input type="radio" name="miSegundo" value={m.idMenuDiario} checked={miSegundo === m.idMenuDiario.toString()} onChange={(e) => setMiSegundo(e.target.value)} className="sr-only" />
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${miSegundo === m.idMenuDiario.toString() ? 'border-primary bg-primary shadow-lg shadow-primary/30' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                {miSegundo === m.idMenuDiario.toString() && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className={`text-lg font-bold ${miSegundo === m.idMenuDiario.toString() ? 'text-primary' : 'text-gray-700'}`}>{m.nombrePlato}</span>
                                        </label>
                                    ))}
                                    {segundos.length === 0 && <p className="text-gray-400 font-medium italic p-4 bg-gray-50 rounded-2xl w-full">Sin platos de fondo hoy</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visitas Premium */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-800">Visitantes</h2>
                                    <p className="text-sm text-gray-400 font-medium tracking-tight">Agrega raciones para externos o visitas</p>
                                </div>
                            </div>
                            <button onClick={addVisita} className="flex items-center gap-2 px-6 py-3 bg-blue-500 active:scale-95 text-white rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 cursor-pointer">
                                <UserPlus className="w-4 h-4" /> AGREGAR
                            </button>
                        </div>

                        {visitas.length === 0 ? (
                            <div className="py-20 text-center border-4 border-dashed border-gray-50 rounded-[2.5rem] bg-gray-50/20">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold max-w-[200px] mx-auto opacity-60">No has registrado raciones adicionales aún.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {visitas.map((v, idx) => (
                                    <div key={v.id} className="relative p-8 bg-gray-50/50 rounded-4xl border border-gray-100 group animate-in slide-in-from-right-4 duration-300">
                                        <button onClick={() => removeVisita(v.id)} className="absolute top-4 right-4 w-10 h-10 bg-white text-gray-300 hover:text-red-500 hover:rotate-12 rounded-2xl shadow-sm flex items-center justify-center transition-all cursor-pointer">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nombre Completo</label>
                                                <input type="text" value={v.nombre} onChange={(e) => updateVisita(v.id, 'nombre', e.target.value)} placeholder="¿Quién nos visita?" className="w-full px-5 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-blue-300 outline-none text-sm font-bold shadow-sm" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Entrada</label>
                                                <select value={v.entrada} onChange={(e) => updateVisita(v.id, 'entrada', e.target.value)} className="w-full px-5 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-blue-300 outline-none text-sm font-bold shadow-sm">
                                                    <option value="">Ninguna</option>
                                                    {entradas.map(m => <option key={m.idMenuDiario} value={m.idMenuDiario}>{m.nombrePlato}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Segundo</label>
                                                <select value={v.segundo} onChange={(e) => updateVisita(v.id, 'segundo', e.target.value)} className="w-full px-5 py-3 rounded-2xl border-2 border-transparent bg-white focus:border-blue-300 outline-none text-sm font-bold shadow-sm">
                                                    {segundos.map(m => <option key={m.idMenuDiario} value={m.idMenuDiario}>{m.nombrePlato}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Resumen */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
                    <div className="bg-gray-900 bg-linear-to-br from-gray-900 to-gray-800 text-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] space-y-10 border border-gray-800">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Resumen</h3>
                            <div className="h-1 w-12 bg-primary rounded-full" />
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center group">
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Tus Porciones</p>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest border transition-all ${miSegundo ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-white/5 border-white/10 text-white/30'}`}>
                                    {miSegundo ? 'LISTO' : 'PENDIENTE'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Visitas</p>
                                <span className="text-lg font-black">{visitas.length}</span>
                            </div>

                            <div className="pt-8 border-t border-white/10">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">TOTAL RACIONES</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black text-primary">{1 + visitas.length}</span>
                                    <span className="text-sm font-bold text-white/40 italic">RACIONES</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmar}
                            disabled={(tiempoAgotado && !isAdmin) || loadingPedido}
                            className={`w-full py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none 
                                ${tiempoAgotado && !isAdmin ? 'bg-gray-800 text-gray-500' : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1'}`}
                        >
                            {loadingPedido ? 'PROCESANDO...' : 'CONFIRMAR PEDIDO'}
                            {!loadingPedido && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Pequeño fix para el typo
//const MENU_HO_HOY = MENU_HOY;
