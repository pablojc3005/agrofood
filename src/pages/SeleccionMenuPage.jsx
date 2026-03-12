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
import { getLocalDateStr, formatLongDate } from '../utils/dateUtils';

// Eliminamos MENU_HOY hardcodeado
const HORA_POR_DEFECTO = '09:00';

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
    const [soloSegundoMode, setSoloSegundoMode] = useState(true); // Nuevo Modo Toggle

    const fechaHoyStr = useMemo(() => getLocalDateStr(), []);

    // ✅ PRIMERO: Todos los useMemo que dependen de menus
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
        (menuHoyList.length > 0 && menuHoyList[0].horaLimite) ? menuHoyList[0].horaLimite : '09:00:00',
        [menuHoyList]);

    // ✅ SEGUNDO: useEffect para verificar pedido existente
    useEffect(() => {
        const checkExistingOrder = async () => {
            if (user?.idUsuario && menuHoyList.length > 0) {
                const pedidoExistente = await fetchPedidoHoy(user.idUsuario);

                if (pedidoExistente && !location.state?.isModifying) {
                    setConfirmado(true);

                    // Pre-poblar para vista de confirmación
                    const detalles = pedidoExistente.detalles || [];
                    const miEntradaDet = detalles.find(d => !d.idVisitante && d.categoriaPlato === 'ENTRADA');
                    const miSegundoDet = detalles.find(d => !d.idVisitante && d.categoriaPlato === 'SEGUNDO');

                    if (miEntradaDet) {
                        const menuE = menuHoyList.find(m => m.idPlato === miEntradaDet.idPlato);
                        if (menuE) setMiEntrada(menuE.idMenuDiario.toString());
                    }
                    if (miSegundoDet) {
                        const menuS = menuHoyList.find(m => m.idPlato === miSegundoDet.idPlato);
                        if (menuS) setMiSegundo(menuS.idMenuDiario.toString());
                    }

                    // Para ventas en vista confirmada
                    const visitasGroup = {};
                    detalles.filter(d => d.idVisitante).forEach(d => {
                        const vid = d.idVisitante;
                        if (!visitasGroup[vid]) {
                            visitasGroup[vid] = {
                                id: vid,
                                nombre: d.nombreVisitante,
                                entrada: '',
                                segundo: ''
                            };
                        }
                        const isEntrada = d.categoriaPlato === 'ENTRADA';
                        const menuMatch = menuHoyList.find(m => m.idPlato === d.idPlato);
                        if (menuMatch) {
                            if (isEntrada) visitasGroup[vid].entrada = menuMatch.idMenuDiario.toString();
                            else visitasGroup[vid].segundo = menuMatch.idMenuDiario.toString();
                        }
                    });
                    setVisitas(Object.values(visitasGroup));

                } else if (pedidoExistente && location.state?.isModifying) {
                    // Si venimos de "Modificar", poblamos el estado editable
                    const detalles = pedidoExistente.detalles || [];
                    const miEntradaDet = detalles.find(d => !d.idVisitante && d.categoriaPlato === 'ENTRADA');
                    const miSegundoDet = detalles.find(d => !d.idVisitante && d.categoriaPlato === 'SEGUNDO');

                    if (miEntradaDet) {
                        const menuE = menuHoyList.find(m => m.idPlato === miEntradaDet.idPlato);
                        if (menuE) setMiEntrada(menuE.idMenuDiario.toString());
                    }
                    if (miSegundoDet) {
                        const menuS = menuHoyList.find(m => m.idPlato === miSegundoDet.idPlato);
                        if (menuS) setMiSegundo(menuS.idMenuDiario.toString());
                    }

                    const visitasGroup = {};
                    detalles.filter(d => d.idVisitante).forEach(d => {
                        const vid = d.idVisitante;
                        if (!visitasGroup[vid]) {
                            visitasGroup[vid] = {
                                id: vid,
                                nombre: d.nombreVisitante,
                                entrada: '',
                                segundo: ''
                            };
                        }
                        const isEntrada = d.categoriaPlato === 'ENTRADA';
                        const menuMatch = menuHoyList.find(m => m.idPlato === d.idPlato);
                        if (menuMatch) {
                            if (isEntrada) visitasGroup[vid].entrada = menuMatch.idMenuDiario.toString();
                            else visitasGroup[vid].segundo = menuMatch.idMenuDiario.toString();
                        }
                    });
                    setVisitas(Object.values(visitasGroup));

                    // Detección de Modo: Solo Segundo si no hay entrada
                    if (!miEntradaDet) {
                        setSoloSegundoMode(true);
                    } else {
                        setSoloSegundoMode(false);
                    }
                }
            }
        };

        if (menus.length === 0) {
            fetchMenus();
        } else {
            checkExistingOrder();
        }
    }, [fetchMenus, fetchPedidoHoy, user?.idUsuario, location.state, menus, menuHoyList]);

    // Formatear hora de 24h a 12h para mostrarla (Ej: 15:00 -> 3:00 PM)
    const formatTime12h = (time24) => {
        if (!time24) return '--:--';
        const [h, m] = time24.split(':');
        const hh = parseInt(h);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        const h12 = hh % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    };

    // ✅ TERCERO: useCallback
    const checkTimeLimit = useCallback(() => {
        if (!horaLimiteOriginal) return;

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

    // ✅ CUARTO: useEffect que depende de checkTimeLimit
    useEffect(() => {
        checkTimeLimit();
        const timer = setInterval(checkTimeLimit, 30000); // Check every 30s
        return () => clearInterval(timer);
    }, [checkTimeLimit]);

    // Auto-activar modo Solo Segundo si el admin solo puso un segundo (y nada de entrada)
    useEffect(() => {
        if (menuHoyList.length > 0 && !location.state?.isModifying) {
            const hasEntradas = entradas.length > 0;
            const isSingleMainDish = segundos.length === 1;

            if (!hasEntradas && isSingleMainDish) {
                setSoloSegundoMode(true);
                setMiSegundo(segundos[0].idMenuDiario.toString());
                setMiEntrada('');
            } else {
                setSoloSegundoMode(false);
            }
        }
    }, [menuHoyList, entradas, segundos, location.state]);

    // ✅ QUINTO: Funciones del componente
    const addVisita = () => {
        setVisitas([...visitas, {
            id: Date.now(),
            nombre: '',
            entrada: '', // Por defecto nada, para que sea "Solo segundo"
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
            title: location.state?.isModifying ? '¿Actualizar pedido?' : '¿Confirmar pedido?',
            html: `
                <div class="text-sm text-left p-2 bg-gray-50 rounded-xl space-y-2">
                    <p className="font-bold border-b pb-1 text-gray-700">Para ti:</p>
                    <p className="pl-2 text-gray-600">${menuEntrada ? '• ' + menuEntrada.nombrePlato + '<br/>' : ''}• ${menuSegundo?.nombrePlato}</p>
                    ${visitas.length > 0 ? `
                        <p className="font-bold border-b pb-1 pt-2 text-gray-700">Visitas (${visitas.length}):</p>
                        <ul class="pl-2 space-y-1">
                            ${visitas.map(v => {
                const ve = v.entrada ? menuHoyList.find(m => m.idMenuDiario === Number(v.entrada)) : null;
                const vs = menuHoyList.find(m => m.idMenuDiario === Number(v.segundo));
                return `<li class="text-xs text-gray-600"><strong>${v.nombre || 'Invitado'}:</strong> ${ve ? ve.nombrePlato + ' + ' : ''}${vs?.nombrePlato}</li>`;
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
            confirmButtonColor: location.state?.isModifying ? '#3b82f6' : '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: location.state?.isModifying ? 'Actualizar Mi Pedido' : 'Sí, registrar pedido',
            cancelButtonText: 'Revisar'
        });

        if (result.isConfirmed) {
            try {
                const pedidoRequestDTO = {
                    idUsuario: user.idUsuario,
                    idTrabajador: user.idTrabajador || null,
                    idMenuEntrada: miEntrada ? Number(miEntrada) : null,
                    idMenuSegundo: Number(miSegundo),
                    notasGenerales: location.state?.isModifying
                        ? `Pedido actualizado el ${getLocalDateStr()}`
                        : `Pedido automático generado el ${getLocalDateStr()}`,
                    visitas: visitas.map(v => ({
                        nombreVisitante: v.nombre,
                        idMenuEntrada: v.entrada ? Number(v.entrada) : null,
                        idMenuSegundo: Number(v.segundo)
                    }))
                };

                await createPedidoCompleto(pedidoRequestDTO);

                setConfirmado(true);
                // Limpiar el estado de navegación para que no se quede en modo modificación
                navigate(location.pathname, { replace: true, state: {} });

                Swal.fire({
                    icon: 'success',
                    title: location.state?.isModifying ? '¡Actualizado!' : '¡Realizado!',
                    text: 'Tu pedido ha sido procesado exitosamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire('Error', 'No se pudo sincronizar: ' + err.message, 'error');
            }
        }
    };

    const handleModificar = () => {
        if (tiempoAgotado && !isAdmin) {
            Swal.fire({
                icon: 'warning',
                title: 'Tiempo agotado',
                text: 'Ya no puedes modificar tu pedido porque ha pasado la hora límite.',
                confirmButtonColor: '#3b82f6'
            });
            return;
        }
        navigate(location.pathname, { state: { isModifying: true } });
    };

    const fechaHoyNormalizada = formatLongDate(fechaHoyStr);

    // ✅ VISTA DE CONFIRMACIÓN
    if (confirmado && !location.state?.isModifying) {
        const ent = miEntrada && menuHoyList.find(m => m.idMenuDiario === Number(miEntrada));
        const seg = menuHoyList.find(m => m.idMenuDiario === Number(miSegundo));

        return (
            <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="w-20 h-20 bg-linear-to-br from-green-400 to-emerald-600 text-white rounded-3xl shadow-2xl shadow-green-200 flex items-center justify-center mb-8 transform hover:scale-110 transition-transform duration-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-none">¡Buen provecho!</h1>
                        <p className="text-xl text-gray-500 font-medium mb-8">Tu pedido de hoy ya está registrado en nuestro sistema.</p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <button
                                onClick={handleModificar}
                                disabled={tiempoAgotado && !isAdmin}
                                className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                <Utensils className="w-5 h-5 text-blue-500" /> Modificar Pedido
                            </button>
                            <button
                                onClick={() => navigate('/mi-historial')}
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-gray-400 cursor-pointer"
                            >
                                <History className="w-5 h-5" /> Ver Mi Historial
                            </button>
                        </div>

                        {tiempoAgotado && !isAdmin && (
                            <p className="text-xs font-bold text-red-500 flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl">
                                <AlertCircle className="w-4 h-4" /> La hora de cambios ha expirado
                            </p>
                        )}
                    </div>

                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <Utensils className="w-32 h-32 rotate-12" />
                        </div>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-6">Detalle de tu selección</p>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Utensils className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Para ti</p>
                                    <h3 className="text-2xl font-bold text-gray-800 leading-tight">
                                        {ent ? `${ent.nombrePlato} + ` : ''}
                                        {seg?.nombrePlato || 'Plato registrado'}
                                    </h3>
                                </div>
                            </div>

                            {visitas.length > 0 && (
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Users className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Visitas ({visitas.length})</p>
                                        <div className="space-y-1 mt-2">
                                            {visitas.map((v, i) => (
                                                <p key={i} className="text-sm font-bold text-gray-600">
                                                    • {v.nombre || 'Invitado'}: <span className="text-blue-500">{v.segundo ? menuHoyList.find(m => m.idMenuDiario === Number(v.segundo))?.nombrePlato : 'Plato'}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-gray-50 flex justify-between items-baseline">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Raciones</p>
                                <p className="text-4xl font-black text-primary">0{1 + visitas.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ VISTA PRINCIPAL DE SELECCIÓN
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header / Banner Premium */}
            <div className="relative overflow-hidden bg-white p-8 md:p-10 rounded-4xl shadow-sm border border-gray-100">
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

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${tiempoAgotado ? 'opacity-40 grayscale pointer-events-none' : ''}`}>

                {/* Selección Individual */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Toggle Control Mode */}
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 ml-2">
                            <div className={`p-2 rounded-xl transition-colors ${soloSegundoMode ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                {soloSegundoMode ? <Utensils className="w-5 h-5" /> : <CalendarCheck className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-tight text-gray-900">Modo de Pedido</p>
                                <p className="text-[10px] text-gray-500 font-medium">{soloSegundoMode ? 'Menú Sugerido (Rápido)' : 'Selección Manual (Personalizado)'}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setSoloSegundoMode(!soloSegundoMode);
                                if (!soloSegundoMode) setMiEntrada('');
                            }}
                            disabled={tiempoAgotado}
                            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 outline-none focus:ring-4 focus:ring-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${soloSegundoMode ? 'bg-amber-500 shadow-lg shadow-amber-200' : 'bg-gray-200'}`}
                        >
                            <span className="sr-only">Cambiar modo de menú</span>
                            <span
                                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-all duration-300 shadow-md ${soloSegundoMode ? 'translate-x-11' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>

                    <div className="bg-white p-8 md:p-10 rounded-4xl shadow-sm border border-gray-100 relative overflow-hidden">
                        {soloSegundoMode && <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-50 blur-3xl animate-pulse"></div>}

                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${soloSegundoMode ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                                <Utensils className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                                {soloSegundoMode ? 'Menú Recomendado' : 'Selección Individual'}
                            </h2>
                        </div>

                        {soloSegundoMode ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="bg-linear-to-br from-amber-50 to-orange-50/30 p-8 rounded-4xl border border-amber-100 relative group overflow-hidden">
                                    <div className="absolute top-4 right-4 animate-bounce">
                                        <CheckCircle2 className="w-8 h-8 text-amber-400 opacity-50" />
                                    </div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Plato de Hoy</p>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 mb-2">{segundos[0]?.nombrePlato || 'Cargando...'}</h3>
                                            <p className="text-gray-500 font-medium">Este es el plato principal seleccionado por la administración para hoy.</p>
                                        </div>
                                    </div>
                                    {miSegundo !== segundos[0]?.idMenuDiario?.toString() && segundos[0] && setTimeout(() => setMiSegundo(segundos[0].idMenuDiario.toString()), 0)}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">1. Entrada o Sopa</label>
                                        {miEntrada && (
                                            <button onClick={() => setMiEntrada('')} disabled={tiempoAgotado} className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer uppercase tracking-widest flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none">
                                                <Trash2 className="w-3 h-3" /> Quitar Selección
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {entradas.map(m => (
                                            <label key={m.idMenuDiario} className={`group relative flex items-center p-5 rounded-3xl border-2 transition-all cursor-pointer ${miEntrada === m.idMenuDiario.toString() ? 'border-primary bg-primary/5' : 'border-gray-50 hover:bg-gray-50'} ${tiempoAgotado ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input type="radio" name="miEntrada" value={m.idMenuDiario} checked={miEntrada === m.idMenuDiario.toString()} onChange={(e) => setMiEntrada(e.target.value)} disabled={tiempoAgotado} className="sr-only" />
                                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${miEntrada === m.idMenuDiario.toString() ? 'border-primary bg-primary shadow-lg shadow-primary/30' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                    {miEntrada === m.idMenuDiario.toString() && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <span className={`text-lg font-bold ${miEntrada === m.idMenuDiario.toString() ? 'text-primary' : 'text-gray-700'}`}>{m.nombrePlato}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-6">2. Plato de Fondo</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {segundos.map(m => (
                                            <label key={m.idMenuDiario} className={`group relative flex items-center p-5 rounded-3xl border-2 transition-all cursor-pointer ${miSegundo === m.idMenuDiario.toString() ? 'border-primary bg-primary/5' : 'border-gray-50 hover:bg-gray-50'} ${tiempoAgotado ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input type="radio" name="miSegundo" value={m.idMenuDiario} checked={miSegundo === m.idMenuDiario.toString()} onChange={(e) => setMiSegundo(e.target.value)} disabled={tiempoAgotado} className="sr-only" />
                                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${miSegundo === m.idMenuDiario.toString() ? 'border-primary bg-primary shadow-lg shadow-primary/30' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                    {miSegundo === m.idMenuDiario.toString() && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <span className={`text-lg font-bold ${miSegundo === m.idMenuDiario.toString() ? 'text-primary' : 'text-gray-700'}`}>{m.nombrePlato}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Visitas Premium Rediseñadas */}
                    <div className="bg-white p-8 md:p-10 rounded-4xl shadow-sm border border-gray-100 overflow-hidden relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Visitantes</h2>
                                    <p className="text-sm text-gray-400 font-medium">Registra raciones adicionales rápidamente</p>
                                </div>
                            </div>
                            <button onClick={addVisita} disabled={tiempoAgotado} className="flex items-center gap-2 px-6 py-4 bg-blue-500 active:scale-95 text-white rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none">
                                <UserPlus className="w-4 h-4" /> AGREGAR VISITANTE
                            </button>
                        </div>

                        {visitas.length === 0 ? (
                            <div className="py-16 text-center border-4 border-dashed border-gray-50 rounded-4xl bg-gray-50/10">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold max-w-[200px] mx-auto opacity-60">Gestiona raciones extra aquí.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visitas.map((v, idx) => (
                                    <div key={v.id} className="group relative flex flex-col items-start gap-4 p-6 bg-white hover:bg-blue-50/30 rounded-3xl border border-gray-100 transition-all duration-300 animate-in slide-in-from-right-4">
                                        {/* Delete Button Top-Right */}
                                        <button
                                            onClick={() => removeVisita(v.id)}
                                            disabled={tiempoAgotado}
                                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer z-20 disabled:opacity-30 disabled:pointer-events-none"
                                            title="Eliminar visitante"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-4 w-full pr-10">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                                            <div className="flex-1 relative">
                                                <input type="text" value={v.nombre} onChange={(e) => updateVisita(v.id, 'nombre', e.target.value)} disabled={tiempoAgotado} placeholder="Nombre del visitante..." className="w-full px-5 py-3 rounded-2xl border-2 border-transparent bg-gray-50 focus:bg-white focus:border-blue-400 outline-none text-sm font-bold transition-all disabled:opacity-50" />
                                            </div>
                                        </div>

                                        {/* Dish Selection for Visitors */}
                                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            {soloSegundoMode ? (
                                                // Quick Mode: Pre-selected main dish
                                                <div className="md:col-span-2 flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-xs border border-gray-100 flex-1">
                                                        <Utensils className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="text-xs font-black text-gray-700 truncate">{segundos[0]?.nombrePlato || 'Plato del Día'}</span>
                                                    </div>
                                                    <div className={`p-1.5 rounded-lg border transition-all ${v.nombre ? 'bg-green-500 text-white border-green-500 shadow-md' : 'bg-white text-gray-200 border-gray-100'}`}>
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ) : (
                                                // Manual Mode: Select Entrada and Segundo
                                                <>
                                                    <div className="space-y-1.5">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Entrada / Sopa</p>
                                                         <select
                                                            value={v.entrada}
                                                            onChange={(e) => updateVisita(v.id, 'entrada', e.target.value)}
                                                            disabled={tiempoAgotado}
                                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-400 outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            <option value="">Seleccionar Entrada...</option>
                                                            {entradas.map(e => <option key={e.idMenuDiario} value={e.idMenuDiario}>{e.nombrePlato}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Plato de Fondo</p>
                                                         <select
                                                            value={v.segundo}
                                                            onChange={(e) => updateVisita(v.id, 'segundo', e.target.value)}
                                                            disabled={tiempoAgotado}
                                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent focus:border-blue-400 outline-none text-xs font-bold transition-all disabled:opacity-50"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            {segundos.map(s => <option key={s.idMenuDiario} value={s.idMenuDiario}>{s.nombrePlato}</option>)}
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Resumen */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
                    <div className="bg-gray-900 bg-linear-to-br from-gray-900 to-gray-800 text-white p-10 rounded-4xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] space-y-10 border border-gray-800">
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
                            disabled={tiempoAgotado || loadingPedido}
                            className={`w-full py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none 
                                ${tiempoAgotado ? 'bg-gray-800 text-gray-500' : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1'}`}
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