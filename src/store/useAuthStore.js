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
                const user = await userRepository.getById(userId);
                if (user && user.isActive) {
                    set({ currentUser: user, isAuthenticated: true, isLoading: false });
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
            const db = await getDB();
            let user = await db.getFromIndex('users', 'email', identifier);
            if (!user) {
                user = await db.getFromIndex('users', 'username', identifier);
            }

            if (!user) {
                set({ error: "Credenciales inválidas", isLoading: false });
                return false;
            }

            if (!user.isActive) {
                set({ error: "Cuenta desactivada", isLoading: false });
                return false;
            }

            // Verify password
            const isMatch = bcrypt.compareSync(password, user.passwordHash);
            if (!isMatch) {
                set({ error: "Credenciales inválidas", isLoading: false });
                return false;
            }

            // Update lastLoginAt
            const updatedUser = await userRepository.update(user.id, { lastLoginAt: new Date().toISOString() });

            // Create session
            localStorage.setItem('academic_clarity_session', updatedUser.id);
            set({ currentUser: updatedUser, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            console.error("Sign in error:", err);
            set({ error: "Ocurrió un error al iniciar sesión", isLoading: false });
            return false;
        }
    },

    signUp: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const db = await getDB();
            
            // Check uniqueness
            const existingEmail = await db.getFromIndex('users', 'email', userData.email);
            if (existingEmail) {
                set({ error: "El email ya está en uso", isLoading: false });
                return false;
            }

            const existingUsername = await db.getFromIndex('users', 'username', userData.username);
            if (existingUsername) {
                set({ error: "El nombre de usuario ya está en uso", isLoading: false });
                return false;
            }

            // Hash password
            const salt = bcrypt.genSaltSync(10);
            const passwordHash = bcrypt.hashSync(userData.password, salt);

            const newUser = {
                id: `usr-${Math.random().toString(36).substring(2, 9)}`,
                username: userData.username,
                email: userData.email,
                passwordHash,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                isActive: true,
                role: 'teacher'
            };

            await userRepository.add(newUser);

            // Auto-login
            localStorage.setItem('academic_clarity_session', newUser.id);
            set({ currentUser: newUser, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            console.error("Sign up error:", err);
            set({ error: "Ocurrió un error al registrar la cuenta", isLoading: false });
            return false;
        }
    },

    signOut: () => {
        localStorage.removeItem('academic_clarity_session');
        set({ currentUser: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null })
}));
