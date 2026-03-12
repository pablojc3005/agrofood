import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Search, Utensils, Calendar, Clock, Save, RefreshCcw, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { useMenuDiarioStore } from '../store/useMenuDiarioStore';
import { usePlatoStore } from '../store/usePlatoStore';
import { useCategoriaPlatoStore } from '../store/useCategoriaPlatoStore';
import { useAuth } from '../hooks/useAuth';
import { getLocalDateStr } from '../utils/dateUtils';

const emptyForm = {
    fechaMenu: getLocalDateStr(),
    idPlato: '',
    horaLimite: '10:00',
    precioDia: '',
    notas: '',
    activo: true
};

export default function MenuDiarioPage() {
    const { user } = useAuth();
    const { menus, fetchMenus, createMenu, updateMenu, deleteMenu, loading } = useMenuDiarioStore();
    const { platos, fetchPlatos } = usePlatoStore();
    const { categorias, fetchCategorias } = useCategoriaPlatoStore();

    const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
    const [globalHoraLimite, setGlobalHoraLimite] = useState('09:00');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    // Category filtering for the modal
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    useEffect(() => {
        fetchMenus();
        fetchPlatos();
        fetchCategorias();
    }, [fetchMenus, fetchPlatos, fetchCategorias]);

    const filteredMenus = useMemo(() =>
        menus.filter(m => m.fechaMenu === selectedDate),
        [menus, selectedDate]);

    // Update globalHoraLimite based on existing menus for the selected date
    useEffect(() => {
        if (filteredMenus.length > 0) {
            setGlobalHoraLimite(filteredMenus[0].horaLimite.substring(0, 5));
        } else {
            setGlobalHoraLimite('09:00');
        }
    }, [filteredMenus]);

    const filteredPlatos = useMemo(() => {
        if (!selectedCategoryId) return platos;
        return platos.filter(p => p.idCategoria === parseInt(selectedCategoryId));
    }, [platos, selectedCategoryId]);

    const openAdd = () => {
        setEditingId(null);
        setForm({
            ...emptyForm,
            fechaMenu: selectedDate,
            horaLimite: globalHoraLimite
        });
        setSelectedCategoryId('');
        setShowModal(true);
    };

    const openEdit = (m) => {
        setEditingId(m.idMenuDiario);
        setForm({
            fechaMenu: m.fechaMenu,
            idPlato: m.idPlato?.toString() || '',
            horaLimite: m.horaLimite.substring(0, 5),
            precioDia: m.precioDia.toString(),
            notas: m.notas || '',
            activo: m.activo
        });
        // Try to find the category of the editing dish to set the filter
        const plato = platos.find(p => p.idPlato === m.idPlato);
        if (plato) {
            setSelectedCategoryId(plato.idCategoria.toString());
        }
        setShowModal(true);
    };

    const handleDelete = (m) => {
        Swal.fire({
            title: '¿Eliminar del menú?',
            text: `Se eliminará "${m.nombrePlato}" del menú del ${m.fechaMenu}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteMenu(m.idMenuDiario);
                    Swal.fire('Eliminado', 'El plato ha sido retirado del menú.', 'success');
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el elemento.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.idPlato || !form.precioDia) {
            Swal.fire('Campos requeridos', 'Por favor completa todos los campos marcados.', 'warning');
            return;
        }

        const menuData = {
            fechaMenu: form.fechaMenu,
            idPlato: parseInt(form.idPlato),
            horaLimite: globalHoraLimite + ":00", // Use global time
            precioDia: parseFloat(form.precioDia),
            notas: form.notas,
            idUsuario: user.idUsuario || 1,
            activo: form.activo
        };

        try {
            if (editingId) {
                await updateMenu(editingId, menuData);
                Swal.fire('Actualizado', 'El menú ha sido actualizado.', 'success');
            } else {
                await createMenu(menuData);
                Swal.fire('Guardado', 'El plato ha sido agregado al menú.', 'success');
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            Swal.fire('Error', error.message || 'Ocurrió un error al procesar la solicitud.', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="relative group w-full lg:w-auto">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary to-emerald-400 rounded-2xl blur-sm opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative flex items-center gap-3 md:gap-4 bg-white/50 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-white/20">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                            <Utensils className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                Gestión de <span className="text-primary italic">Menú Diario</span>
                            </h1>
                            <p className="text-gray-400 text-xs md:text-sm font-medium">Configura los almuerzos de cada día</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={openAdd}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all duration-300 active:scale-95 group"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        Nuevo Ingreso
                    </button>
                </div>
            </div>

            {/* Date & Global Settings Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl md:rounded-4xl p-5 md:p-8 shadow-sm border border-white/40 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 px-1">
                        <Calendar className="w-3 h-3" /> Fecha del Menú
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full md:w-64 pl-12 pr-4 py-4 rounded-2xl bg-gray-50/50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-800"
                        />
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="h-10 w-px bg-gray-100 hidden md:block"></div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 px-1">
                        <Clock className="w-3 h-3" /> Hora Límite (Global)
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 md:w-48">
                            <input
                                type="time"
                                value={globalHoraLimite}
                                onChange={(e) => setGlobalHoraLimite(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-amber-50/30 border border-amber-100 text-amber-700 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all font-bold"
                            />
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await useMenuDiarioStore.getState().updateGlobalHoraLimite(selectedDate, globalHoraLimite);
                                    Swal.fire({
                                        title: '¡Actualizado!',
                                        text: 'La hora límite ha sido aplicada a todos los platos de este día.',
                                        icon: 'success',
                                        toast: true,
                                        position: 'top-end',
                                        showConfirmButton: false,
                                        timer: 3000
                                    });
                                } catch (error) {
                                    Swal.fire('Error', 'No se pudo actualizar la hora global.', 'error');
                                }
                            }}
                            disabled={loading || filteredMenus.length === 0}
                            className="p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none group"
                            title="Aplicar a todos los platos de esta fecha"
                        >
                            <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 hidden lg:block"></div>

                <div className="bg-primary/5 px-6 py-4 rounded-2xl border border-primary/10">
                    <p className="text-xs text-primary font-bold uppercase tracking-tight mb-1">Resumen del Día</p>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-primary">{filteredMenus.length}</span>
                        <span className="text-sm font-medium text-gray-500">Platos Activos</span>
                    </div>
                </div>
            </div>

            {/* Content List Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredMenus.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 transform -rotate-12">
                            <Utensils className="w-12 h-12 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Menú vacío</h3>
                        <p className="text-gray-500 mt-2 max-w-sm">No hay platos registrados para el <span className="text-primary font-bold">{selectedDate}</span>. Comienza agregando uno ahora.</p>
                        <button onClick={openAdd} className="mt-8 px-8 py-3 bg-white border border-primary text-primary hover:bg-primary hover:text-white rounded-2xl font-bold transition-all shadow-sm">
                            Configurar mi primer plato
                        </button>
                    </div>
                ) : (
                    filteredMenus.map((m) => (
                        <div key={m.idMenuDiario} className="group relative bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary/10 border border-gray-100 overflow-hidden transition-all duration-500">
                            <div className="h-56 bg-gray-50 relative overflow-hidden">
                                {m.imagenUrl ? (
                                    <img src={m.imagenUrl} alt={m.nombrePlato} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-50/30">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                                            <Utensils className="w-8 h-8 text-emerald-100" />
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions Overlay */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <button onClick={() => openEdit(m)} className="p-3 bg-white rounded-2xl shadow-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110 active:scale-90">
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(m)} className="p-3 bg-white rounded-2xl shadow-xl text-red-500 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-90">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="absolute top-4 left-4">
                                    <span className={`px-4 py-1.5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider ${m.activo ? 'bg-emerald-500/90 text-white' : 'bg-gray-400/90 text-white'}`}>
                                        {m.activo ? 'Activo' : 'Pausado'}
                                    </span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-800 shadow-sm mb-2">
                                        {m.nombreCategoria || 'Plato'}
                                    </div>
                                    <h3 className="text-2xl font-black text-white drop-shadow-lg line-clamp-1">{m.nombrePlato}</h3>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent pointer-events-none"></div>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-500 text-sm line-clamp-2 min-h-10 italic leading-relaxed">
                                    {m.notas ? `"${m.notas}"` : 'Sin observaciones especiales...'}
                                </p>

                                <div className="mt-8 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Cierra a las</span>
                                        <div className="flex items-center gap-2 text-gray-800 font-black">
                                            <Clock className="w-4 h-4 text-amber-400" />
                                            <span>{m.horaLimite.substring(0, 5)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Precio Venta</span>
                                        <div className="text-3xl font-black text-gray-900 leading-none">
                                            <span className="text-sm font-medium text-gray-400 mr-1">S/</span>
                                            {m.precioDia.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Improved Elegant Modal */}
            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[6px] animate-in fade-in duration-300"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative bg-white rounded-4xl md:rounded-[3rem] shadow-2xl w-full max-w-xl md:max-w-2xl overflow-y-auto max-h-[90vh] lg:overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 md:px-8 md:py-6 border-b border-gray-100 relative">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${editingId ? 'bg-blue-500 shadow-blue-500/20' : 'bg-primary shadow-primary/20'}`}>
                                    {editingId ? <Pencil className="w-6 h-6 md:w-7 md:h-7 text-white" /> : <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />}
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
                                        {editingId ? 'Editar Registro' : 'Nuevo Plato'}
                                    </h3>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium">Completa la información para el menú diario</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 md:top-8 md:right-8 p-2 md:p-3 hover:bg-white rounded-2xl transition-all cursor-pointer text-gray-400 hover:text-red-500 shadow-sm hover:shadow-md"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                {/* Left Side: Selection */}
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">1. Filtrar Categoría</label>
                                        <div className="relative">
                                            <select
                                                value={selectedCategoryId}
                                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="">Todas las categorías</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.idCategoria} value={cat.idCategoria}>{cat.nombreCategoria}</option>
                                                ))}
                                            </select>
                                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-primary ml-1">2. Seleccionar Plato *</label>
                                        <div className="relative">
                                            <select
                                                value={form.idPlato}
                                                onChange={(e) => setForm({ ...form, idPlato: e.target.value })}
                                                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black text-gray-800 appearance-none cursor-pointer"
                                                required
                                            >
                                                <option value="">¿Qué plato incluiremos?</option>
                                                {filteredPlatos.map(p => (
                                                    <option key={p.idPlato} value={p.idPlato}>{p.nombrePlato}</option>
                                                ))}
                                            </select>
                                            <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                            {filteredPlatos.length === 0 && selectedCategoryId && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                                </div>
                                            )}
                                        </div>
                                        {filteredPlatos.length === 0 && selectedCategoryId && (
                                            <p className="text-[10px] text-amber-600 font-bold px-2 flex items-center gap-1">
                                                No hay platos registrados en esta categoría
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Details */}
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">3. Precio del Plato *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">S/</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.precioDia}
                                                onChange={(e) => setForm({ ...form, precioDia: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-black text-xl text-gray-800"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                        <Clock className="w-6 h-6 text-amber-400 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Tiempo Límite</span>
                                            <span className="text-lg font-black text-amber-700">{globalHoraLimite}</span>
                                        </div>
                                        <p className="flex-1 text-[9px] text-amber-500 font-medium ml-2 leading-tight">
                                            Se usará la hora configurada para este día.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between px-4 py-2">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Estado</label>
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, activo: !form.activo })}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${form.activo ? 'bg-primary' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${form.activo ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">4. Observaciones Finales</label>
                                <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    placeholder="Agrega detalles adicionales si es necesario (ej: Incluye bebida fría)..."
                                    className="w-full px-6 py-5 rounded-4xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all h-20 resize-none font-medium text-gray-700"
                                />
                            </div>


                            <div className="flex items-center gap-4">
                                {/*}
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    Descartar
                                </button>
                                */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-2 py-4 px-8 rounded-2xl text-white font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 ${editingId ? 'bg-blue-500 shadow-blue-500/30' : 'bg-primary shadow-primary/30'}`}
                                >
                                    {loading ? (
                                        <RefreshCcw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-6 h-6" />
                                            {editingId ? 'Guardar Cambios' : 'Confirmar Registro'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
