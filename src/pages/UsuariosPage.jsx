import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Users, RefreshCcw, Save, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import { useUsuarioStore } from '../store/useUsuarioStore';
import { useRolStore } from '../store/useRolStore';
import { useTrabajadorStore } from '../store/useTrabajadorStore';

const emptyForm = { username: '', email: '', password: '', confirmPassword: '', trabajador: { idTrabajador: '' }, rol: { idRol: '' }, activo: true, idTrabajador: '', idRol: '' };

export default function UsuariosPage() {
    const { usuarios, fetchUsuarios, createUsuario, updateUsuario, deleteUsuario, loading } = useUsuarioStore();
    const { roles, fetchRoles } = useRolStore();
    const { trabajadores, fetchTrabajadores } = useTrabajadorStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchUsuarios();
        fetchTrabajadores();
        fetchRoles();
    }, [fetchUsuarios, fetchTrabajadores, fetchRoles]);

    const filtered = usuarios.filter(
        (t) =>
            t.username?.toLowerCase().includes(search.toLowerCase()) ||
            t.email?.toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (usu) => {
        setEditingId(usu.idUsuario);
        setForm({
            username: usu.username,
            email: usu.email,
            idTrabajador: usu.idTrabajador?.toString() || '',
            idRol: usu.idRol?.toString() || '',
            password: '',
            confirmPassword: '',
            activo: usu.activo,
        });
        setShowModal(true);
    };

    const handleDelete = (usu) => {
        Swal.fire({
            title: '¿Eliminar usuario?',
            text: `Se eliminará al usuario "${usu.username}". Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteUsuario(usu.idUsuario);
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: 'El usuario ha sido eliminado correctamente.',
                        timer: 1500,
                        showConfirmButton: false,
                    });
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username.trim() || !form.email.trim() || !form.idTrabajador.trim() || !form.idRol.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa todos los campos obligatorios (*)',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (!editingId && (!form.password || form.password.length < 6)) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña requerida',
                text: 'La contraseña debe tener al menos 6 caracteres',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (!editingId && form.password !== form.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        // Enviar los Datos que espera recibir el backend
        const usuarioData = {
            username: form.username,
            password: form.password,
            email: form.email,
            idTrabajador: Number(form.idTrabajador),
            idRol: Number(form.idRol),
            activo: form.activo !== undefined ? form.activo : true
        };

        if (!editingId) {
            usuarioData.password = form.password;
        }

        if (form.email) {
            usuarioData.email = form.email;
        }

        try {
            if (editingId) {
                await updateUsuario(editingId, usuarioData);
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'El usuario ha sido actualizado correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createUsuario(usuarioData);
                Swal.fire({
                    icon: 'success',
                    title: '¡Registrado!',
                    text: 'El usuario ha sido registrado correctamente.',
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
                        <Users className="w-8 h-8 text-primary" />
                        Usuarios
                    </h1>
                    <p className="text-gray-500 mt-1">Administra el personal de la empresa</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Agregar usuario
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trabajador</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rol</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((usu) => (
                                    <tr key={usu.idusuario} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{usu.username}</td>
                                        <td className="px-6 py-4 text-gray-700">{usu.nombresTrabajador + ', ' + usu.apellidosTrabajador}</td>
                                        <td className="px-6 py-4 text-gray-700">{usu.email}</td>
                                        <td className="px-6 py-4 text-gray-700">{usu.nombreRol}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${usu.activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {usu.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(usu)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(usu)}
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
                    {filtered.length} usuajador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Editar Usuario' : 'Agregar Usuario'}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    placeholder="Ej: TRB-006"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trabajador *</label>
                                <select
                                    value={form.idTrabajador}
                                    onChange={(e) => setForm({ ...form, idTrabajador: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                >
                                    <option value="">Seleccionar Trabajador...</option>
                                    {trabajadores.map((trabajador) => (
                                        <option key={trabajador.idTrabajador} value={trabajador.idTrabajador}>
                                            {trabajador.nombres} {trabajador.apellidos}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            {/*!editingId && (*/}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña *</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Contraseña *</label>
                                    <input
                                        type="password"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder="Repite la contraseña"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            {/*)*/}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div >
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                                    <select
                                        value={form.idRol}
                                        onChange={(e) => setForm({ ...form, idRol: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                        required
                                    >
                                        <option value="">Seleccionar Rol...</option>
                                        {roles.map((rol) => (
                                            <option key={rol.idRol} value={rol.idRol}>
                                                {rol.nombreRol}
                                            </option>
                                        ))}
                                    </select>
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



                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                                >
                                    <X className="w-6 h-6" />
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
                                            {editingId ? (
                                                <RefreshCcw className="w-6 h-6" />
                                            ) : (
                                                <Save className="w-6 h-6" />
                                            )}
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
