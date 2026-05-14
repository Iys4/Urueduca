import React, { useState } from 'react';
import { Button } from '../Shared';
import { useAuthStore } from '../../store/useAuthStore';

const Settings = ({ user }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [birthdate, setBirthdate] = useState(user?.birthdate || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [institution, setInstitution] = useState(user?.institution || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/crud/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, birthdate, avatar, institution })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // The data returned by handleCrud is the updated document
                useAuthStore.setState({ currentUser: data });
                alert('Ajustes guardados correctamente');
            } else {
                alert(`Error: ${data.error || 'Hubo un error al guardar los ajustes'}`);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

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
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej. Juan Pérez"
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="juan@example.com"
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Foto de Perfil (URL)</label>
                            <input
                                type="url"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                placeholder="https://ejemplo.com/foto.jpg"
                                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1.5">Institución Principal</label>
                            <input
                                type="text"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pb-4">
                <Button variant="ghost">Cancelar</Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </div>
    );
};

export default Settings;
