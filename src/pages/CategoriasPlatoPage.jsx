import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Tags, RefreshCcw, Save } from 'lucide-react';
import Swal from 'sweetalert2';
import { useCategoriaPlatoStore } from '../store/useCategoriaPlatoStore';

const emptyForm = { nombreCategoria: '', descripcion: '', ordenVisual: 0, activo: true };

export default function CategoriasPlatoPage() {
    const { categorias, fetchCategorias, createCategoria, updateCategoria, deleteCategoria, loading } = useCategoriaPlatoStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    const filtered = categorias.filter(
        (c) =>
            c.nombreCategoria?.toLowerCase().includes(search.toLowerCase()) ||
            c.descripcion?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditingId(cat.idCategoria);
        setForm({
            nombreCategoria: cat.nombreCategoria,
            descripcion: cat.descripcion || '',
            ordenVisual: cat.ordenVisual || 0,
            activo: cat.activo,
        });
        setShowModal(true);
    };

    const handleDelete = (cat) => {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: `Se eliminará la categoría "${cat.nombreCategoria}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteCategoria(cat.idCategoria);
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminada!',
                        text: 'La categoría ha sido eliminada correctamente.',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nombreCategoria.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'El nombre de la categoría es obligatorio',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        const data = {
            nombreCategoria: form.nombreCategoria,
            descripcion: form.descripcion,
            ordenVisual: Number(form.ordenVisual),
            activo: form.activo !== undefined ? form.activo : true
        };

        try {
            if (editingId) {
                await updateCategoria(editingId, data);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizada!',
                    text: 'La categoría ha sido actualizada correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createCategoria(data);
                Swal.fire({
                    icon: 'success',
                    title: '¡Registrada!',
                    text: 'La categoría ha sido registrada correctamente.',
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
                        <Tags className="w-8 h-8 text-primary" />
                        Categorías de Platos
                    </h1>
                    <p className="text-gray-500 mt-1">Administra las clasificaciones del menú</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Categoría
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o descripción..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orden</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron categorías
                                    </td>
                                </tr>
                            ) : (
                                filtered.sort((a, b) => (a.ordenVisual || 0) - (b.ordenVisual || 0)).map((cat) => (
                                    <tr key={cat.idCategoria} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">{cat.nombreCategoria}</td>
                                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{cat.descripcion || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600">{cat.ordenVisual}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${cat.activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {cat.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(cat)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-sm text-gray-500">
                    {filtered.length} categoría{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de Categoría *</label>
                                <input
                                    type="text"
                                    value={form.nombreCategoria}
                                    onChange={(e) => setForm({ ...form, nombreCategoria: e.target.value })}
                                    placeholder="Ej: Entradas, Segundos, Bebidas..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    placeholder="Breve descripción..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none h-24"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden de visualización</label>
                                    <input
                                        type="number"
                                        value={form.ordenVisual}
                                        onChange={(e) => setForm({ ...form, ordenVisual: e.target.value })}
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
