import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, UtensilsCrossed, RefreshCcw, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { usePlatoStore } from '../store/usePlatoStore';
import { useCategoriaPlatoStore } from '../store/useCategoriaPlatoStore';

const emptyForm = { nombrePlato: '', descripcion: '', precioBase: '', idCategoria: '', imagenUrl: '', activo: true };

export default function MenuPlatosPage() {
    const { platos, fetchPlatos, createPlato, updatePlato, deletePlato, loading } = usePlatoStore();
    const { categorias, fetchCategorias } = useCategoriaPlatoStore();

    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchPlatos();
        fetchCategorias();
    }, [fetchPlatos, fetchCategorias]);

    const filtered = platos.filter(
        (p) =>
            p.nombrePlato?.toLowerCase().includes(search.toLowerCase()) ||
            p.nombreCategoria?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (plato) => {
        setEditingId(plato.idPlato);
        setForm({
            nombrePlato: plato.nombrePlato,
            descripcion: plato.descripcion || '',
            precioBase: plato.precioBase,
            idCategoria: plato.idCategoria?.toString() || '',
            imagenUrl: plato.imagenUrl || '',
            activo: plato.activo,
        });
        setShowModal(true);
    };

    const handleDelete = (plato) => {
        Swal.fire({
            title: '¿Eliminar plato?',
            text: `Se eliminará el plato "${plato.nombrePlato}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deletePlato(plato.idPlato);
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: 'El plato ha sido eliminado correctamente.',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el plato.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nombrePlato.trim() || !form.precioBase || !form.idCategoria) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos obligatorios',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        const data = {
            nombrePlato: form.nombrePlato,
            descripcion: form.descripcion,
            precioBase: parseFloat(form.precioBase),
            idCategoria: Number(form.idCategoria),
            imagenUrl: form.imagenUrl,
            activo: form.activo !== undefined ? form.activo : true
        };

        try {
            if (editingId) {
                await updatePlato(editingId, data);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'El plato ha sido actualizado correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createPlato(data);
                Swal.fire({
                    icon: 'success',
                    title: '¡Registrado!',
                    text: 'El plato ha sido registrado correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            setShowModal(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <UtensilsCrossed className="w-8 h-8 text-primary" />
                        Base de Platos
                    </h1>
                    <p className="text-gray-500 mt-1">Administra los platos disponibles para el menú</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Plato
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o categoría..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
                        No se encontraron platos
                    </div>
                ) : (
                    filtered.map((plato) => (
                        <div key={plato.idPlato} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="h-32 bg-gray-100 relative overflow-hidden">
                                {plato.imagenUrl ? (
                                    <img src={plato.imagenUrl} alt={plato.nombrePlato} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-green-50">
                                        <UtensilsCrossed className="w-10 h-10 text-green-200" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-1">
                                    <button onClick={() => openEdit(plato)} className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-gray-600 hover:text-blue-500 shadow-sm transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(plato)} className="p-1.5 bg-white/90 backdrop-blur rounded-lg text-gray-600 hover:text-red-500 shadow-sm transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold rounded-lg shadow-sm">
                                        {plato.nombreCategoria}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">{plato.nombrePlato}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">{plato.descripcion || 'Sin descripción'}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${plato.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {plato.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <span className="text-lg font-black text-primary">
                                        S/ {plato.precioBase?.toFixed(2)}
                                    </span>
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
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Editar Plato' : 'Nuevo Plato'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del Plato</label>
                                <input
                                    type="text"
                                    value={form.nombrePlato}
                                    onChange={(e) => setForm({ ...form, nombrePlato: e.target.value })}
                                    placeholder="Ej: Lomo Saltado"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
                                    <select
                                        value={form.idCategoria}
                                        onChange={(e) => setForm({ ...form, idCategoria: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.idCategoria} value={cat.idCategoria}>
                                                {cat.nombreCategoria}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio Base</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">S/</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.precioBase}
                                            onChange={(e) => setForm({ ...form, precioBase: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    placeholder="Ingredientes o breve detalle..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none h-20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL de Imagen (Opcional)</label>
                                <input
                                    type="url"
                                    value={form.imagenUrl}
                                    onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                                <button type="button"
                                    onClick={() => setForm({ ...form, activo: !form.activo })}
                                    className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full
                                        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                        ${form.activo ? 'bg-green-600' : 'bg-gray-200'}
                                    `}
                                >
                                    <span
                                        className={`
                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                        ${form.activo ? 'translate-x-6' : 'translate-x-1'}
                                        `}
                                    />
                                </button>
                                <span className="ml-3 text-sm text-gray-700">
                                    {form.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                                >
                                    <X className="w-5 h-5" />
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium shadow-lg shadow-primary/25 transition-all duration-300 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            {editingId ? <RefreshCcw className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                            {editingId ? 'Actualizar' : 'Guardar'}
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
