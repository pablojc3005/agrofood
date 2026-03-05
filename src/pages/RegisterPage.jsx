import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRolStore } from '../store/useRolStore';
import { useTrabajadorStore } from '../store/useTrabajadorStore';
import { Leaf, Eye, EyeOff, User, Mail, Lock, Shield, Contact } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RegisterPage() {
    const { register } = useAuth();
    const { roles, fetchRoles } = useRolStore();
    const { trabajadores, fetchTrabajadores } = useTrabajadorStore();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        idRol: '',
        idTrabajador: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
        fetchTrabajadores();
    }, [fetchRoles, fetchTrabajadores]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username || !form.password || !form.confirmPassword || !form.idRol) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa los campos obligatorios (*)',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (form.password !== form.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        try {
            setLoading(true);

            const userData = {
                username: form.username,
                email: form.email,
                password: form.password,
                idRol: parseInt(form.idRol),
                idTrabajador: form.idTrabajador ? parseInt(form.idTrabajador) : null,
                activo: true
            };

            const user = await register(userData);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: 'success',
                title: `¡Cuenta creada, ${user.username}!`,
            });

            navigate('/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al registrarse',
                text: err.message || 'No se pudo crear la cuenta',
                confirmButtonColor: '#16a34a',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 px-4 py-12 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-green-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-xl">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-3">
                        <Leaf className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Crear Cuenta</h2>
                    <p className="text-green-200/70">Únete al sistema AgroFood</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-green-100 mb-1.5 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Nombre de usuario *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Ej: PCORZO"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-green-100 mb-1.5 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-green-100 mb-1.5 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Contraseña *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-green-100 mb-1.5 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Confirmar *
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repite la contraseña"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Rol */}
                            <div>
                                <label className="block text-sm font-medium text-green-100 mb-1.5 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Asignar Rol *
                                </label>
                                <select
                                    name="idRol"
                                    value={form.idRol}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="" className="bg-slate-800">Seleccionar Rol</option>
                                    {roles.map(rol => (
                                        <option key={rol.idRol} value={rol.idRol} className="bg-slate-800">
                                            {rol.nombreRol}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Trabajador */}
                            <div>
                                <label className="block text-sm font-medium text-green-100 mb-1.5 flex items-center gap-2">
                                    <Contact className="w-4 h-4" /> Vincular Trabajador
                                </label>
                                <select
                                    name="idTrabajador"
                                    value={form.idTrabajador}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="" className="bg-slate-800">Ninguno (Opcional)</option>
                                    {trabajadores.map(t => (
                                        <option key={t.idTrabajador} value={t.idTrabajador} className="bg-slate-800">
                                            {t.nombres} {t.apellidos} ({t.codigo})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                'Registrar Usuario'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-green-200/60">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to="/login"
                            className="text-primary-light hover:text-white font-medium transition-colors"
                        >
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
