import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.username || !form.password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        try {
            setLoading(true);
            const user = await login(form.username, form.password);

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
            });
            Toast.fire({
                icon: 'success',
                title: `¡Bienvenido, ${user.name || user.username}!`,
            });

            navigate('/');
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de acceso',
                text: err.message || 'Credenciales incorrectas',
                confirmButtonColor: '#16a34a',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-green-700 from-slate-900 px-4 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-4">
                    <img src="../src/assets/agrofood.png" alt="Logo" className="inline-flex items-center justify-center w-60% h-60% rounded-2xl" />

                    <h2>
                        <span className="text-6xl font-bold text-white">Agro</span>
                        <span className="text-6xl font-bold text-green-600">Food</span>
                    </h2>
                    <p className="text-green-200/70 mt-3">Gestión de comidas del personal</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">Iniciar Sesión</h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-green-100 mb-1.5">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="Ej: PCORZO"
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-green-100 mb-1.5">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/*<div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-green-200/60">
                            <p>💡 <strong>Tip:</strong> Usa un email con "admin" para entrar como Administrador.</p>
                        </div>*/}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Ingresando...
                                </span>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    {/* <p className="mt-6 text-center text-sm text-green-200/60">
                        ¿No tienes cuenta?{' '}
                        <Link
                            to="/register"
                            className="text-primary-light hover:text-white font-medium transition-colors"
                        >
                            Regístrate
                        </Link>
                    </p> */}
                </div>
            </div>
        </div>
    );
}
