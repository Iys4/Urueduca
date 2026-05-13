import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    
    const signUp = useAuthStore(state => state.signUp);
    const isLoading = useAuthStore(state => state.isLoading);
    const storeError = useAuthStore(state => state.error);
    const clearError = useAuthStore(state => state.clearError);
    
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = [];
        if (formData.username.length < 3) errors.push("El usuario debe tener al menos 3 caracteres.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push("El formato de email es inválido.");
        
        const pwd = formData.password;
        if (pwd.length < 8) errors.push("La contraseña debe tener al menos 8 caracteres.");
        if (!/[A-Z]/.test(pwd)) errors.push("La contraseña requiere al menos una letra mayúscula.");
        if (!/[a-z]/.test(pwd)) errors.push("La contraseña requiere al menos una letra minúscula.");
        if (!/[0-9]/.test(pwd)) errors.push("La contraseña requiere al menos un número.");
        
        if (pwd !== formData.confirmPassword) errors.push("Las contraseñas no coinciden.");
        
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (validationErrors.length > 0) setValidationErrors([]);
        if (storeError) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        const success = await signUp({
            username: formData.username,
            email: formData.email,
            password: formData.password
        });
        
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 py-12">
            <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-xl border border-outline-variant">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Crear Cuenta</h1>
                    <p className="text-on-surface-variant">Únete a Academic Clarity</p>
                </div>

                {(validationErrors.length > 0 || storeError) && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex flex-col gap-2 text-error text-sm">
                        {storeError && (
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{storeError}</span>
                            </div>
                        )}
                        {validationErrors.map((err, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{err}</span>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="username">
                            Nombre de Usuario
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-surface-variant border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                            placeholder="Ej. profejuan"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="email">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-surface-variant border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                            placeholder="juan@ejemplo.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="password">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-surface-variant border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="confirmPassword">
                            Confirmar Contraseña
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-surface-variant border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-hover text-on-primary font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                <span>Crear Cuenta</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-on-surface-variant">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
