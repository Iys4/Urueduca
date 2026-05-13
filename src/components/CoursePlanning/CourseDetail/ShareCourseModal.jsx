import React, { useState } from 'react';
import { Modal, Button, SearchInput } from '../../Shared';
import { coursePlanService } from '../../../services/coursePlanService';

const ShareCourseModal = ({ isOpen, onClose, coursePlanId, currentCollaborators = [], onRefresh }) => {
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('viewer');
    const [results, setResults] = useState([]);
    const [feedback, setFeedback] = useState(null);

    const handleSearch = (q) => {
        setSearch(q);
        if (q.length >= 2) {
            const teachers = coursePlanService.searchTeachers(q);
            const collabIds = currentCollaborators.map(c => c.id);
            setResults(teachers.filter(t => !collabIds.includes(t.id)));
        } else {
            setResults([]);
        }
    };

    const handleInvite = (teacher) => {
        const result = coursePlanService.addCollaborator(coursePlanId, teacher.email, selectedRole);
        if (result) {
            setFeedback({ type: 'success', msg: `${teacher.name} invitado como ${selectedRole}` });
            setSearch('');
            setResults([]);
            onRefresh();
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    const getInitials = (name) => name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Compartir Curso" size="md">
            <div className="space-y-5">
                {/* Search */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        Buscar docente
                    </label>
                    <SearchInput
                        value={search}
                        onChange={handleSearch}
                        placeholder="Nombre o email del docente..."
                        debounceMs={200}
                    />
                </div>

                {/* Role selector */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        Permisos
                    </label>
                    <div className="flex gap-2">
                        {[
                            { value: 'viewer', label: 'Lector', icon: 'visibility', desc: 'Solo puede ver' },
                            { value: 'editor', label: 'Editor', icon: 'edit', desc: 'Puede editar contenido' },
                            { value: 'admin', label: 'Admin', icon: 'admin_panel_settings', desc: 'Control total' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedRole(opt.value)}
                                className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-semibold border transition-all ${
                                    selectedRole === opt.value
                                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                                {opt.label}
                                <span className={`text-[10px] font-normal ${selectedRole === opt.value ? 'text-on-primary/70' : 'text-outline'}`}>
                                    {opt.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        feedback.type === 'success' ? 'bg-success-container/40 text-on-success-container' : 'bg-error-container/40 text-on-error-container'
                    }`}>
                        <span className="material-symbols-outlined text-[18px]">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                        {feedback.msg}
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Resultados</p>
                        {results.map(teacher => (
                            <div key={teacher.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container/50 transition-colors">
                                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0">
                                    {getInitials(teacher.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-on-surface">{teacher.name}</p>
                                    <p className="text-xs text-on-surface-variant">{teacher.email}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleInvite(teacher)}>
                                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                                    Invitar
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {search.length >= 2 && results.length === 0 && (
                    <p className="text-sm text-on-surface-variant text-center py-4">
                        No se encontraron docentes con "{search}"
                    </p>
                )}

                {/* Current collaborators */}
                {currentCollaborators.length > 0 && (
                    <div className="pt-3 border-t border-outline-variant">
                        <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                            Colaboradores actuales ({currentCollaborators.length})
                        </p>
                        <div className="space-y-1">
                            {currentCollaborators.map(c => (
                                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container/30">
                                    <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[11px] font-bold shrink-0">
                                        {getInitials(c.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-on-surface">{c.name}</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-outline bg-surface-container px-2 py-0.5 rounded-full capitalize">
                                        {c.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ShareCourseModal;
