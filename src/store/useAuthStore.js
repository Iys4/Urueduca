import { create } from 'zustand';
import bcrypt from 'bcryptjs';
import { userRepository } from '../data/repositories';
import { getDB } from '../data/db';

export const useAuthStore = create((set, get) => ({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    restoreSession: async () => {
        set({ isLoading: true, error: null });
        try {
            const userId = localStorage.getItem('academic_clarity_session');
            if (userId) {
                const response = await fetch(`/api/auth/me?userId=${userId}`);
                const data = await response.json();

                if (response.ok && data.user) {
                    set({ currentUser: data.user, isAuthenticated: true, isLoading: false });
                    return true;
                }
            }
            // Clear invalid session
            localStorage.removeItem('academic_clarity_session');
            set({ currentUser: null, isAuthenticated: false, isLoading: false });
            return false;
        } catch (err) {
            console.error("Session restore error:", err);
            set({ currentUser: null, isAuthenticated: false, isLoading: false });
            return false;
        }
    },

    signIn: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                set({ error: data.error || "Error al iniciar sesión", isLoading: false });
                return false;
            }

            // Update local session
            localStorage.setItem('academic_clarity_session', data.user.id);
            set({ currentUser: data.user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            console.error("Sign in error:", err);
            set({ error: "No se pudo conectar con el servidor", isLoading: false });
            return false;
        }
    },

    signUp: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                set({ error: data.error || "Error al registrar la cuenta", isLoading: false });
                return false;
            }

            // Auto-login
            localStorage.setItem('academic_clarity_session', data.user.id);
            set({ currentUser: data.user, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            console.error("Sign up error:", err);
            set({ error: "No se pudo conectar con el servidor", isLoading: false });
            return false;
        }
    },

    signOut: () => {
        localStorage.removeItem('academic_clarity_session');
        set({ currentUser: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null })
}));
