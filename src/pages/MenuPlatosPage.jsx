import { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, Clock, UtensilsCrossed, Save, Info, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Categorías según requerimiento
const CATEGORIAS = {
    ENTRADA: 'Entrada / Sopa',
    SEGUNDO: 'Segundo / Plato Fuerte'
};

export default function MenuPlatosPage() {
    const [fecha, setFecha] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    const [horaLimite, setHoraLimite] = useState('10:00');
    const [esMenuUnico, setEsMenuUnico] = useState(false);

    const [entradas, setEntradas] = useState(['Sopa de res', 'Tequeños']);
    const [segundos, setSegundos] = useState(['Pollo al huacatay', 'Olluquito', 'Dieta pollo al pimiento']);

    const [nuevaEntrada, setNuevaEntrada] = useState('');
    const [nuevoSegundo, setNuevoSegundo] = useState('');

    const addEntrada = (e) => {
        e.preventDefault();
        if (!nuevaEntrada.trim()) return;
        setEntradas([...entradas, nuevaEntrada.trim()]);
        setNuevaEntrada('');
    };

    const addSegundo = (e) => {
        e.preventDefault();
        if (!nuevoSegundo.trim()) return;
        setSegundos([...segundos, nuevoSegundo.trim()]);
        setNuevoSegundo('');
    };

    const removeEntrada = (index) => {
        setEntradas(entradas.filter((_, i) => i !== index));
    };

    const removeSegundo = (index) => {
        setSegundos(segundos.filter((_, i) => i !== index));
    };

    const handlePublicar = () => {
        if (!esMenuUnico && (entradas.length === 0 || segundos.length === 0)) {
            Swal.fire({
                icon: 'warning',
                title: 'Menú incompleto',
                text: 'Debes agregar al menos una entrada y un segundo.',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (esMenuUnico && segundos.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Menú incompleto',
                text: 'Debes agregar al menos un plato para el menú único.',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        Swal.fire({
            title: '¿Publicar menú?',
            html: `Se publicará el menú para la fecha: <strong>${fecha}</strong><br/>Hora límite: <strong>${horaLimite}</strong>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, publicar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // AQUÍ SE LLAMARÍA A LA API
                Swal.fire({
                    icon: 'success',
                    title: '¡Menú publicado!',
                    text: `El menú para el ${fecha} ya está disponible para los empleados.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <UtensilsCrossed className="w-8 h-8 text-primary" />
                        Gestionar Menú del Día
                    </h1>
                    <p className="text-gray-500 mt-1">Carga las opciones para que el personal elija su almuerzo</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        <Calendar className="w-5 h-5 text-primary" />
                        <input
                            type="date"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="text-sm font-medium text-gray-700 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Configuración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">Hora Límite de Pedido</h3>
                            <p className="text-xs text-gray-500">Los empleados solo pedirán hasta esta hora</p>
                        </div>
                    </div>
                    <input
                        type="time"
                        value={horaLimite}
                        onChange={(e) => setHoraLimite(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-bold focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer group w-full">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={esMenuUnico}
                                onChange={(e) => setEsMenuUnico(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${esMenuUnico ? 'bg-primary' : 'bg-gray-200'}`} />
                            <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${esMenuUnico ? 'translate-x-7' : 'translate-x-0'}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">¿Es Menú Único?</h3>
                            <p className="text-xs text-gray-500">Para sábados o ocasiones especiales (sin elecciones)</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Secciones de Platos */}
            <div className={`grid grid-cols-1 ${esMenuUnico ? '' : 'md:grid-cols-2'} gap-6`}>

                {/* ENTRADAS - Se oculta si es menú único */}
                {!esMenuUnico && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                1. Entradas / Sopas
                            </h3>
                        </div>
                        <div className="p-5 space-y-4 flex-1">
                            <form onSubmit={addEntrada} className="flex gap-2">
                                <input
                                    type="text"
                                    value={nuevaEntrada}
                                    onChange={(e) => setNuevaEntrada(e.target.value)}
                                    placeholder="Ej: Sopa de res"
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                />
                                <button type="submit" className="p-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {entradas.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl group transition-all">
                                        <span className="text-sm font-medium text-blue-900">{item}</span>
                                        <button onClick={() => removeEntrada(i)} className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {entradas.length === 0 && <p className="text-center py-4 text-xs text-gray-400 italic">No hay entradas agregadas</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* SEGUNDOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {esMenuUnico ? 'Platos del día' : '2. Segundos / Platos Fuertes'}
                        </h3>
                    </div>
                    <div className="p-5 space-y-4 flex-1">
                        <form onSubmit={addSegundo} className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoSegundo}
                                onChange={(e) => setNuevoSegundo(e.target.value)}
                                placeholder={esMenuUnico ? "Ej: Menú criollo completo" : "Ej: Lomo saltado"}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                            />
                            <button type="submit" className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </form>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {segundos.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl group transition-all">
                                    <span className="text-sm font-medium text-green-900">{item}</span>
                                    <button onClick={() => removeSegundo(i)} className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {segundos.length === 0 && <p className="text-center py-4 text-xs text-gray-400 italic">No hay platos agregados</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info y Botón Final */}
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-xs text-primary-dark leading-relaxed">
                    Al publicar este menú, se notificará a los empleados. Los sábados se recomienda usar el modo <strong>"Menú Único"</strong> si no hay opciones para elegir. El horario límite se aplicará automáticamente a todos los empleados (excepto administradores).
                </p>
            </div>

            <button
                onClick={handlePublicar}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
                <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Publicar Menú para el {fecha}
            </button>
        </div>
    );
}
