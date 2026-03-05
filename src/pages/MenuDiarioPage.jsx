import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Utensils, Calendar, Clock, Save, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import { useMenuDiarioStore } from '../store/useMenuDiarioStore';
import { usePlatoStore } from '../store/usePlatoStore';
import { useAuth } from '../hooks/useAuth';

const emptyForm = {
    fechaMenu: new Date().toISOString().split('T')[0],
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

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchMenus();
        fetchPlatos();
    }, [fetchMenus, fetchPlatos]);

    const filteredMenus = menus.filter(m => m.fechaMenu === selectedDate);

    const openAdd = () => {
        setEditingId(null);
        setForm({ ...emptyForm, fechaMenu: selectedDate });
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

        if (!form.idPlato || !form.horaLimite || !form.precioDia) {
            Swal.fire('Campos requeridos', 'Por favor completa todos los campos marcados con *', 'warning');
            return;
        }

        const menuData = {
            fechaMenu: form.fechaMenu,
            idPlato: parseInt(form.idPlato),
            horaLimite: form.horaLimite + ":00",
            precioDia: parseFloat(form.precioDia),
            notas: form.notas,
            idUsuario: user.idUsuario || 1, // Fallback to 1 if no user found
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Utensils className="w-8 h-8 text-primary" />
                        Gestión Menú Diario
                    </h1>
                    <p className="text-gray-500 mt-1">Define los platos disponibles para el personal</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Agregar al Menú
                </button>
            </div>

            {/* Date Selection */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3 text-gray-700 font-medium">
                    <Calendar className="w-5 h-5 text-primary" />
                    Seleccionar Fecha:
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex-1" />
                <div className="text-sm text-gray-500">
                    Mostrando <span className="font-bold text-gray-800">{filteredMenus.length}</span> platos para el día seleccionado
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenus.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium text-lg">No hay platos configurados para esta fecha</p>
                        <button onClick={openAdd} className="mt-4 text-primary font-bold hover:underline">
                            Comenzar a armar el menú
                        </button>
                    </div>
                ) : (
                    filteredMenus.map((m) => (
                        <div key={m.idMenuDiario} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="h-40 bg-gray-100 relative overflow-hidden">
                                {m.imagenUrl ? (
                                    <img src={m.imagenUrl} alt={m.nombrePlato} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-green-50">
                                        <Utensils className="w-12 h-12 text-green-200" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => openEdit(m)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(m)} className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-600 hover:text-red-500 transition-colors cursor-pointer">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                                        {m.nombreCategoria || 'Plato'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{m.nombrePlato}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{m.descripcionPlato}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-sm">Límite: {m.horaLimite.substring(0, 5)}</span>
                                    </div>
                                    <div className="text-lg font-black text-primary">
                                        S/ {m.precioDia.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {editingId ? 'Editar Menú' : 'Agregar al Menú'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Fecha</label>
                                <input
                                    type="date"
                                    value={form.fechaMenu}
                                    onChange={(e) => setForm({ ...form, fechaMenu: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Plato *</label>
                                <select
                                    value={form.idPlato}
                                    onChange={(e) => setForm({ ...form, idPlato: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                >
                                    <option value="">Selecciona un plato...</option>
                                    {platos.map(p => (
                                        <option key={p.idPlato} value={p.idPlato}>
                                            {p.nombrePlato} ({p.nombreCategoria})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Hora Límite *</label>
                                    <input
                                        type="time"
                                        value={form.horaLimite}
                                        onChange={(e) => setForm({ ...form, horaLimite: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Precio Día *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.precioDia}
                                            onChange={(e) => setForm({ ...form, precioDia: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Notas (Opcional)</label>
                                <textarea
                                    value={form.notas}
                                    onChange={(e) => setForm({ ...form, notas: e.target.value })}
                                    placeholder="Ej: Solo para hoy, incluye refresco..."
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <RefreshCcw className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        {editingId ? <RefreshCcw className="w-6 h-6" /> : <Save className="w-6 h-6" />}
                                        {editingId ? 'Actualizar Menú' : 'Guardar en Menú'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
