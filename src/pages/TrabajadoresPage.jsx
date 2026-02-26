import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Search, Users } from 'lucide-react';
import Swal from 'sweetalert2';

const areasDisponibles = [
    { id: 1, nombre: 'Producción' },
    { id: 2, nombre: 'Administración' },
    { id: 3, nombre: 'Logística' },
    { id: 4, nombre: 'Recursos Humanos' },
    { id: 5, nombre: 'Mantenimiento' },
];

const initialTrabajadores = [
    { id: 1, codigo: 'TRB-001', nombres: 'Juan Carlos', apellidos: 'García López', sexo: 'M', celular: '987654321', areaId: 1 },
    { id: 2, codigo: 'TRB-002', nombres: 'María Elena', apellidos: 'Torres Ruiz', sexo: 'F', celular: '987654322', areaId: 2 },
    { id: 3, codigo: 'TRB-003', nombres: 'Pedro', apellidos: 'Rodríguez Vargas', sexo: 'M', celular: '987654323', areaId: 1 },
    { id: 4, codigo: 'TRB-004', nombres: 'Ana Lucía', apellidos: 'Mendoza Ríos', sexo: 'F', celular: '987654324', areaId: 3 },
    { id: 5, codigo: 'TRB-005', nombres: 'Carlos Alberto', apellidos: 'Sánchez Díaz', sexo: 'M', celular: '987654325', areaId: 4 },
];

const emptyForm = { codigo: '', nombres: '', apellidos: '', sexo: 'M', celular: '', areaId: '' };

export default function TrabajadoresPage() {
    const [trabajadores, setTrabajadores] = useState(initialTrabajadores);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const getAreaNombre = (areaId) => {
        const area = areasDisponibles.find((a) => a.id === Number(areaId));
        return area ? area.nombre : '—';
    };

    const filtered = trabajadores.filter(
        (t) =>
            t.codigo.toLowerCase().includes(search.toLowerCase()) ||
            t.nombres.toLowerCase().includes(search.toLowerCase()) ||
            t.apellidos.toLowerCase().includes(search.toLowerCase()) ||
            getAreaNombre(t.areaId).toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (trab) => {
        setEditingId(trab.id);
        setForm({
            codigo: trab.codigo,
            nombres: trab.nombres,
            apellidos: trab.apellidos,
            sexo: trab.sexo,
            celular: trab.celular,
            areaId: trab.areaId.toString(),
        });
        setShowModal(true);
    };

    const handleDelete = (trab) => {
        Swal.fire({
            title: '¿Eliminar trabajador?',
            text: `Se eliminará a "${trab.nombres} ${trab.apellidos}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                setTrabajadores(trabajadores.filter((t) => t.id !== trab.id));
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El trabajador ha sido eliminado correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.codigo.trim() || !form.nombres.trim() || !form.apellidos.trim() || !form.celular.trim() || !form.areaId) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos obligatorios',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (editingId) {
            setTrabajadores(
                trabajadores.map((t) =>
                    t.id === editingId ? { ...t, ...form, areaId: Number(form.areaId) } : t
                )
            );
            Swal.fire({
                icon: 'success',
                title: '¡Actualizado!',
                text: 'El trabajador ha sido actualizado correctamente.',
                timer: 1500,
                showConfirmButton: false,
            });
        } else {
            setTrabajadores([
                ...trabajadores,
                { id: Date.now(), ...form, areaId: Number(form.areaId) },
            ]);
            Swal.fire({
                icon: 'success',
                title: '¡Registrado!',
                text: 'El trabajador ha sido registrado correctamente.',
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
                        <Users className="w-8 h-8 text-primary" />
                        Trabajadores
                    </h1>
                    <p className="text-gray-500 mt-1">Administra el personal de la empresa</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Trabajador
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código, nombre o área..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombres</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Apellidos</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Sexo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Celular</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Área</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron trabajadores
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((trab) => (
                                    <tr key={trab.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{trab.codigo}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{trab.nombres}</td>
                                        <td className="px-6 py-4 text-gray-700">{trab.apellidos}</td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${trab.sexo === 'M'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'bg-pink-50 text-pink-700'
                                                }`}>
                                                {trab.sexo === 'M' ? 'Masculino' : 'Femenino'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{trab.celular}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                {getAreaNombre(trab.areaId)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(trab)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(trab)}
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
                    {filtered.length} trabajador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Editar Trabajador' : 'Agregar Trabajador'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Código de Trabajador *</label>
                                <input
                                    type="text"
                                    value={form.codigo}
                                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                    placeholder="Ej: TRB-006"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombres *</label>
                                    <input
                                        type="text"
                                        value={form.nombres}
                                        onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                                        placeholder="Ej: Juan Carlos"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos *</label>
                                    <input
                                        type="text"
                                        value={form.apellidos}
                                        onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                                        placeholder="Ej: García López"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sexo *</label>
                                    <select
                                        value={form.sexo}
                                        onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    >
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nro. Celular *</label>
                                    <input
                                        type="tel"
                                        value={form.celular}
                                        onChange={(e) => setForm({ ...form, celular: e.target.value })}
                                        placeholder="Ej: 987654321"
                                        maxLength={9}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Área *</label>
                                <select
                                    value={form.areaId}
                                    onChange={(e) => setForm({ ...form, areaId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                >
                                    <option value="">Seleccionar área...</option>
                                    {areasDisponibles.map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.nombre}
                                        </option>
                                    ))}
                                </select>
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
                                    {editingId ? 'Guardar Cambios' : 'Registrar Trabajador'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
