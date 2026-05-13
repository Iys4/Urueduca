import React from 'react';
import { Button } from '../Shared';

const Settings = ({ user }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">Ajustes</h1>
                <p className="text-sm text-secondary mt-1">Administra tu perfil y preferencias del sistema.</p>
            </div>

            {/* Profile */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                    <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">Perfil Docente</h2>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Nombre Completo</label>
                            <input
                                type="text"
                                defaultValue={user?.name || "Juan Pérez"}
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                            <input
                                type="email"
                                defaultValue={user?.email || "juan@example.com"}
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Institución Principal</label>
                            <input
                                type="text"
                                defaultValue={user?.institution || ""}
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Año Lectivo</label>
                            <select className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white">
                                <option>2026</option>
                                <option>2025</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                    <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">Notificaciones</h2>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { title: 'Recordatorios de Evaluaciones', desc: 'Avisarme 48hs antes de una fecha de corrección.', checked: true },
                        { title: 'Alertas de Asistencia',         desc: 'Avisarme si olvido pasar lista en el día.', checked: true },
                        { title: 'Resumen Semanal',               desc: 'Enviar resumen de actividad cada viernes por correo.', checked: false },
                    ].map((item, i) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                defaultChecked={item.checked}
                                className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 transition-all"
                            />
                            <div>
                                <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{item.title}</p>
                                <p className="text-xs text-secondary">{item.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            {/* Appearance */}
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                    <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">Apariencia</h2>
                </div>
                <div className="p-6">
                    <p className="text-xs text-secondary mb-3">Tema de la interfaz</p>
                    <div className="flex gap-2">
                        {['Claro', 'Oscuro', 'Sistema'].map((theme, i) => (
                            <button
                                key={theme}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                                    i === 0
                                        ? 'bg-primary-container text-on-primary-container border-primary'
                                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                                }`}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pb-4">
                <Button variant="ghost">Cancelar</Button>
                <Button variant="primary">
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
};

export default Settings;
