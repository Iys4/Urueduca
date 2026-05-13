import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Shared';

const EventQuickView = ({ event, onClose }) => {
    const navigate = useNavigate();

    if (!event) return null;

    // Overlay click handler
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Actions based on source
    const handleNavigate = () => {
        if (event.source === 'classplan' || event.source === 'evaluation') {
            const le = event.linked_entity;
            navigate(`/planning/${le.coursePlanId}/class/${le.moduleId}/${le.classId}`);
        }
        onClose();
    };

    const isClassOrEval = event.source === 'classplan' || event.source === 'evaluation';
    const isBirthday = event.source === 'birthday';

    return (
        <div 
            className="fixed inset-0 z-[100] flex justify-end bg-scrim/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-md h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header Strip */}
                <div className="h-32 p-6 flex flex-col justify-between relative overflow-hidden" style={{ backgroundColor: `${event.color}15` }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-symbols-outlined text-[100px]" style={{ color: event.color }}>{event.icon}</span>
                    </div>
                    
                    <div className="flex justify-between items-start z-10">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: event.color }}>
                            <span className="material-symbols-outlined text-[20px]">{event.icon}</span>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-lowest/50 hover:bg-surface-container-lowest text-on-surface-variant transition-colors backdrop-blur-md">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    <div className="z-10 mt-auto">
                        <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: event.color }}>
                            {event.type === 'evaluation' ? 'Evaluación' : event.type === 'class' ? 'Clase Planificada' : event.type}
                        </p>
                        <h2 className="text-xl font-bold text-on-surface leading-tight">{event.title}</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Time block */}
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-outline mt-0.5">schedule</span>
                        <div>
                            <p className="text-sm font-semibold text-on-surface">
                                {new Date(event.date + 'T12:00:00').toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            {event.startTime && (
                                <p className="text-sm text-on-surface-variant mt-0.5">
                                    {event.startTime} {event.endTime ? `— ${event.endTime}` : ''}
                                </p>
                            )}
                            {isBirthday && <p className="text-sm text-on-surface-variant mt-0.5">Todo el día</p>}
                        </div>
                    </div>

                    {/* Context info block */}
                    {isClassOrEval && event.linked_entity && (
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-outline mt-0.5">school</span>
                            <div>
                                <p className="text-sm font-semibold text-on-surface">Curso asociado</p>
                                <p className="text-sm text-on-surface-variant mt-0.5">{event.linked_entity.courseName}</p>
                            </div>
                        </div>
                    )}

                    {/* Description block */}
                    {event.description && (
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-outline mt-0.5">notes</span>
                            <div>
                                <p className="text-sm font-semibold text-on-surface">Descripción</p>
                                <p className="text-sm text-on-surface-variant mt-0.5 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Birthday specifics */}
                    {isBirthday && (
                        <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-pink-500">celebration</span>
                            <div>
                                <p className="text-sm font-semibold text-pink-900">¡Hoy es su cumpleaños!</p>
                                <p className="text-xs text-pink-700 mt-1">Este evento se genera automáticamente basado en los datos del {event.linked_entity?.type === 'student' ? 'alumno' : 'docente'}.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
                    {isClassOrEval ? (
                        <Button variant="primary" className="w-full justify-center" onClick={handleNavigate}>
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            Ir al Detalle de la Clase
                        </Button>
                    ) : event.source === 'manual' ? (
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 justify-center text-error hover:bg-error-container/20 border-transparent hover:border-error/20" onClick={onClose}>
                                Eliminar
                            </Button>
                            <Button variant="primary" className="flex-1 justify-center" onClick={onClose}>
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Editar
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full justify-center" onClick={onClose}>Cerrar</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventQuickView;
