import { useState, useEffect, useMemo } from 'react';
import {
    CalendarCheck, Check, Clock, Users, UserPlus,
    Trash2, AlertCircle, Utensils, ChevronRight,
    CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';

// Datos de ejemplo para hoy (simulando lo que el admin publicó)
const MENU_HOY = {
    fecha: new Date().toISOString().split('T')[0],
    horaLimite: '16:00',
    esMenuUnico: false,
    entradas: ['Sopa de res', 'Tequeños'],
    segundos: ['Pollo al huacatay', 'Olluquito', 'Dieta pollo al pimiento']
};

export default function SeleccionMenuPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    // Estados principales
    const [miEntrada, setMiEntrada] = useState('');
    const [miSegundo, setMiSegundo] = useState('');
    const [visitas, setVisitas] = useState([]); // [{ id, nombre, entrada, segundo }]
    const [confirmado, setConfirmado] = useState(false);

    // Estado de tiempo
    const [tiempoAgotado, setTiempoAgotado] = useState(false);
    const [horaActual, setHoraActual] = useState(new Date());

    // Verificar tiempo cada minuto
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setHoraActual(now);

            const [limiteH, limiteM] = MENU_HOY.horaLimite.split(':').map(Number);
            const limite = new Date();
            limite.setHours(limiteH, limiteM, 0, 0);

            if (now > limite && !isAdmin) {
                setTiempoAgotado(true);
            }
        }, 1000);

        // Ejecución inicial
        const [limiteH, limiteM] = MENU_HOY.horaLimite.split(':').map(Number);
        const limite = new Date();
        limite.setHours(limiteH, limiteM, 0, 0);
        if (new Date() > limite && !isAdmin) setTiempoAgotado(true);

        return () => clearInterval(timer);
    }, [isAdmin]);

    const addVisita = () => {
        setVisitas([...visitas, {
            id: Date.now(),
            nombre: '',
            entrada: MENU_HOY.entradas[0] || '',
            segundo: MENU_HOY.segundos[0] || ''
        }]);
    };

    const removeVisita = (id) => {
        setVisitas(visitas.filter(v => v.id !== id));
    };

    const updateVisita = (id, field, value) => {
        setVisitas(visitas.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleConfirmar = () => {
        if (!miEntrada || !miSegundo) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección incompleta',
                text: 'Debes elegir una entrada y un segundo para ti.',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        const totalRaciones = 1 + visitas.length;

        Swal.fire({
            title: '¿Confirmar pedido?',
            html: `
                <div class="text-sm text-left space-y-2">
                    <p><strong>Para ti:</strong> ${miEntrada} + ${miSegundo}</p>
                    ${visitas.length > 0 ? `
                        <p className="border-t pt-2"><strong>Visitas (${visitas.length}):</strong></p>
                        <ul class="list-disc pl-5">
                            ${visitas.map(v => `<li>${v.nombre || 'Invitado'}: ${v.entrada} + ${v.segundo}</li>`).join('')}
                        </ul>
                    ` : ''}
                    <p class="border-t pt-2 font-bold text-primary">Total raciones: ${totalRaciones}</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setConfirmado(true);
                Swal.fire({
                    icon: 'success',
                    title: '¡Pedido registrado!',
                    text: 'Buen provecho. Tu selección y raciones adicionales han sido guardadas.',
                    timer: 2500,
                    showConfirmButton: false,
                });
            }
        });
    };

    const fechaHoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

    if (confirmado) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">¡Pedido Confirmado!</h1>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left space-y-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Tu Almuerzo</p>
                        <p className="text-lg font-medium text-gray-800">{miEntrada} <span className="text-gray-400 mx-2">+</span> {miSegundo}</p>
                    </div>
                    {visitas.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Raciones para Visitas ({visitas.length})</p>
                            <div className="space-y-2">
                                {visitas.map((v, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-xl text-sm flex justify-between">
                                        <span className="font-semibold text-gray-700">{v.nombre || 'Invitado'}</span>
                                        <span className="text-gray-500">{v.entrada} + {v.segundo}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setConfirmado(false)}
                    className="text-primary font-medium hover:underline cursor-pointer"
                >
                    Modificar mi pedido
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header / Banner de Tiempo */}
            <div className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <p className="text-primary font-bold text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Utensils className="w-4 h-4" /> Almuerzo de Hoy
                        </p>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-800 capitalize leading-tight">
                            {fechaHoy}
                        </h1>
                    </div>

                    <div className={`p-4 rounded-2xl flex items-center gap-4 transition-colors ${tiempoAgotado ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse ${tiempoAgotado ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${tiempoAgotado ? 'text-red-600' : 'text-amber-600'}`}>
                                {tiempoAgotado ? 'Cerrado' : 'Hora Límite'}
                            </p>
                            <p className={`text-xl font-black ${tiempoAgotado ? 'text-red-700' : 'text-amber-700'}`}>
                                {MENU_HOY.horaLimite} AM
                            </p>
                        </div>
                    </div>
                </div>

                {tiempoAgotado && (
                    <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-2xl flex items-center gap-3 border border-red-200">
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                        <p className="text-sm font-medium">El horario de recepción de pedidos ha finalizado. Solo el personal administrador puede realizar registros extemporáneos.</p>
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${tiempoAgotado && !isAdmin ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                {/* Lado Izquierdo: Tu Selección */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                            <CalendarCheck className="w-7 h-7 text-primary" />
                            Tu Almuerzo Individual
                        </h2>

                        <div className="space-y-10">
                            {/* Entradas */}
                            <div>
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-4">1. Selecciona tu Entrada / Sopa</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {MENU_HOY.entradas.map(plato => (
                                        <label key={plato} className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${miEntrada === plato ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input
                                                type="radio" name="miEntrada" value={plato}
                                                checked={miEntrada === plato} onChange={(e) => setMiEntrada(e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${miEntrada === plato ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                                {miEntrada === plato && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </span>
                                            <span className={`text-base font-semibold ${miEntrada === plato ? 'text-primary' : 'text-gray-700'}`}>{plato}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Segundos */}
                            <div>
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-4">2. Selecciona tu Segundo / Fondo</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {MENU_HOY.segundos.map(plato => (
                                        <label key={plato} className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${miSegundo === plato ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input
                                                type="radio" name="miSegundo" value={plato}
                                                checked={miSegundo === plato} onChange={(e) => setMiSegundo(e.target.value)}
                                                className="sr-only"
                                            />
                                            <span className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${miSegundo === plato ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                                {miSegundo === plato && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </span>
                                            <span className={`text-base font-semibold ${miSegundo === plato ? 'text-primary' : 'text-gray-700'}`}>{plato}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visitas */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Users className="w-7 h-7 text-blue-500" />
                                    Personal de Visita
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Si traes invitados de tu área, regístralos aquí</p>
                            </div>
                            <button
                                onClick={addVisita}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" /> Agregar Ración
                            </button>
                        </div>

                        {visitas.length === 0 ? (
                            <div className="bg-gray-50 p-8 rounded-3xl text-center border-2 border-dashed border-gray-100">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">No has agregado raciones para visitas aún</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {visitas.map((v, idx) => (
                                    <div key={v.id} className="relative p-6 bg-gray-50 rounded-3xl border border-gray-100 group">
                                        <button
                                            onClick={() => removeVisita(v.id)}
                                            className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-md flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Nombre (Opcional)</label>
                                                <input
                                                    type="text" value={v.nombre}
                                                    onChange={(e) => updateVisita(v.id, 'nombre', e.target.value)}
                                                    placeholder="Ej: Juan Pérez"
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Entrada</label>
                                                <select
                                                    value={v.entrada} onChange={(e) => updateVisita(v.id, 'entrada', e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                >
                                                    {MENU_HO_HOY.entradas.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 ml-1">Segundo</label>
                                                <select
                                                    value={v.segundo} onChange={(e) => updateVisita(v.id, 'segundo', e.target.value)}
                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                                >
                                                    {MENU_HOY.segundos.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumen del Pedido Flotante (Desktop) */}
                <div className="lg:col-span-12 xl:col-span-4 lg:sticky lg:top-6 self-start">
                    <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl space-y-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Resumen de Pedido
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-xs text-white/50 uppercase font-black tracking-widest">Tus Porciones</p>
                                    <p className="text-lg font-bold">1 Ración</p>
                                </div>
                                <CheckCircle2 className={`w-6 h-6 ${(miEntrada && miSegundo) ? 'text-green-400' : 'text-white/20'}`} />
                            </div>

                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <p className="text-xs text-white/50 uppercase font-black tracking-widest">Visitas</p>
                                    <p className="text-lg font-bold">{visitas.length} Invitados</p>
                                </div>
                                <Users className={`w-6 h-6 ${visitas.length > 0 ? 'text-blue-400' : 'text-white/20'}`} />
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <span className="text-3xl font-black">{1 + visitas.length}</span>
                                <span className="text-sm font-bold text-white/60">Total Raciones</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmar}
                            disabled={tiempoAgotado && !isAdmin}
                            className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirmar Pedido <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Pequeño fix para el typo
const MENU_HO_HOY = MENU_HOY;
