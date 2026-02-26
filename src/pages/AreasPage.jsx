import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';

const initialAreas = [
    { id: 1, nombre: 'Producción', centroCosto: 'CC-001' },
    { id: 2, nombre: 'Administración', centroCosto: 'CC-002' },
    { id: 3, nombre: 'Logística', centroCosto: 'CC-003' },
    { id: 4, nombre: 'Recursos Humanos', centroCosto: 'CC-004' },
    { id: 5, nombre: 'Mantenimiento', centroCosto: 'CC-005' },
];

const emptyForm = { nombre: '', centroCosto: '' };

export default function AreasPage() {
    const [areas, setAreas] = useState(initialAreas);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const filtered = areas.filter(
        (a) =>
            a.nombre.toLowerCase().includes(search.toLowerCase()) ||
            a.centroCosto.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (area) => {
        setEditingId(area.id);
        setForm({ nombre: area.nombre, centroCosto: area.centroCosto });
        setShowModal(true);
    };

    const handleDelete = (area) => {
        Swal.fire({
            title: '¿Eliminar área?',
            text: `Se eliminará "${area.nombre}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                setAreas(areas.filter((a) => a.id !== area.id));
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminada!',
                    text: 'El área ha sido eliminada correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.nombre.trim() || !form.centroCosto.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (editingId) {
            setAreas(areas.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
            Swal.fire({
                icon: 'success',
                title: '¡Actualizada!',
                text: 'El área ha sido actualizada correctamente.',
                timer: 1500,
                showConfirmButton: false,
            });
        } else {
            setAreas([...areas, { id: Date.now(), ...form }]);
            Swal.fire({
                icon: 'success',
                title: '¡Registrada!',
                text: 'El área ha sido registrada correctamente.',
                timer: 1500,
                showConfirmButton: false,
            });
        }

        setShowModal(false);
        setForm(emptyForm);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary" />
                        Áreas
                    </h1>
                    <p className="text-gray-500 mt-1">Administra las áreas de la empresa</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Área
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o centro de costo..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre del Área</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Centro de Costo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron áreas
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((area) => (
                                    <tr key={area.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{area.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                </div>
                                                <p className="font-medium text-gray-800">{area.nombre}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {area.centroCosto}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(area)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(area)}
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
                    {filtered.length} área{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Editar Área' : 'Agregar Área'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del Área *</label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Ej: Producción"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Centro de Costo *</label>
                                <input
                                    type="text"
                                    value={form.centroCosto}
                                    onChange={(e) => setForm({ ...form, centroCosto: e.target.value })}
                                    placeholder="Ej: CC-001"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium shadow-lg shadow-primary/25 transition-all duration-300 cursor-pointer"
                                >
                                    {editingId ? 'Guardar Cambios' : 'Registrar Área'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
