import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';

// Datos de ejemplo
const initialPlatos = [
    { id: 1, nombre: 'Arroz con pollo', descripcion: 'Arroz acompañado de pollo al horno', precio: 12.50, categoria: 'Plato fuerte' },
    { id: 2, nombre: 'Ensalada César', descripcion: 'Lechuga romana con aderezo césar y crutones', precio: 8.00, categoria: 'Entrada' },
    { id: 3, nombre: 'Sopa de verduras', descripcion: 'Sopa casera con verduras frescas', precio: 7.50, categoria: 'Sopa' },
    { id: 4, nombre: 'Lomo saltado', descripcion: 'Lomo de res salteado con tomate y cebolla', precio: 15.00, categoria: 'Plato fuerte' },
    { id: 5, nombre: 'Jugo de naranja', descripcion: 'Jugo natural de naranja recién exprimido', precio: 4.00, categoria: 'Bebida' },
];

const categorias = ['Entrada', 'Sopa', 'Plato fuerte', 'Postre', 'Bebida'];

const emptyForm = { nombre: '', descripcion: '', precio: '', categoria: 'Plato fuerte' };

export default function MenuPlatosPage() {
    const [platos, setPlatos] = useState(initialPlatos);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const filtered = platos.filter(
        (p) =>
            p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.categoria.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (plato) => {
        setEditingId(plato.id);
        setForm({
            nombre: plato.nombre,
            descripcion: plato.descripcion,
            precio: plato.precio.toString(),
            categoria: plato.categoria,
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este plato?')) {
            setPlatos(platos.filter((p) => p.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.nombre || !form.precio) return;

        if (editingId) {
            setPlatos(
                platos.map((p) =>
                    p.id === editingId
                        ? { ...p, ...form, precio: parseFloat(form.precio) }
                        : p
                )
            );
        } else {
            setPlatos([
                ...platos,
                { id: Date.now(), ...form, precio: parseFloat(form.precio) },
            ]);
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Platos / Menú</h1>
                    <p className="text-gray-500 mt-1">Administra los platos disponibles para el personal</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Plato
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

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Descripción</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron platos
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((plato) => (
                                    <tr key={plato.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800">{plato.nombre}</p>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <p className="text-sm text-gray-500 line-clamp-1">{plato.descripcion}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                {plato.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            S/ {plato.precio.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(plato)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(plato.id)}
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

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-sm text-gray-500">
                    {filtered.length} plato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Editar Plato' : 'Agregar Plato'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del plato *</label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Ej: Arroz con pollo"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                    placeholder="Breve descripción del plato"
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio (S/) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.precio}
                                        onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
                                    <select
                                        value={form.categoria}
                                        onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    >
                                        {categorias.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                    {editingId ? 'Guardar Cambios' : 'Agregar Plato'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
