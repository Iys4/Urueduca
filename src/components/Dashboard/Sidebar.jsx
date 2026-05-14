import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';

const navItems = [
    { to: '/',            icon: 'space_dashboard', label: 'Panel',         end: true },
    { to: '/groups',      icon: 'groups',          label: 'Mis Grupos',    end: false },
    { to: '/planning',    icon: 'event_note',      label: 'Planificación', end: false },
    { to: '/students',    icon: 'person',          label: 'Alumnos',       end: false },
    { to: '/calendar',    icon: 'calendar_month',  label: 'Calendario',    end: false },
];

const SidebarLink = ({ to, icon, label, end = false }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `
            group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${isActive
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }
        `}
    >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span>{label}</span>
    </NavLink>
);

const Sidebar = ({ user }) => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sidebar-desktop fixed left-0 top-0 w-[260px] h-screen bg-surface-container-lowest border-r border-outline-variant flex flex-col z-50">
                {/* Brand */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-primary text-[18px]">school</span>
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-on-surface tracking-tight leading-none">EducaAmigo</h1>
                            <p className="text-[10px] text-outline mt-0.5 uppercase tracking-widest font-semibold">Portal Docente</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-6">
                    {navItems.map(item => (
                        <SidebarLink key={item.to} {...item} />
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-3 mt-auto border-t border-outline-variant flex flex-col gap-1">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `
                            flex items-center gap-3 p-3 rounded-lg transition-colors
                            ${isActive ? 'bg-surface-container-high' : 'hover:bg-surface-container'}
                        `}
                    >
                        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shrink-0">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-on-surface truncate">{user?.username || 'Usuario'}</p>
                            <p className="text-[11px] text-outline truncate">{user?.email || 'Sin email'}</p>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-outline">settings</span>
                    </NavLink>
                    <button
                        onClick={() => {
                            useAuthStore.getState().signOut();
                            useAppStore.getState().clear();
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg transition-colors text-error hover:bg-error/10 text-left w-full"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="bottom-nav-mobile fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-stretch z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                {navItems.slice(0, 4).map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `
                            flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                            ${isActive ? 'text-primary' : 'text-outline hover:text-on-surface'}
                        `}
                    >
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                        <span className="text-[10px] font-semibold">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </>
    );
};

export default Sidebar;
