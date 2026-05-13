import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../../Shared';
import { dashboardService } from '../../../services/dashboardService';

const EvaluationsTab = ({ groupId }) => {
    const [evaluations, setEvaluations] = useState([]);

    useEffect(() => {
        const data = dashboardService.getEvaluationsByCourse(groupId);
        setEvaluations(data);
    }, [groupId]);

    if (evaluations.length === 0) return (
        <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3">assignment</span>
            <p className="text-secondary font-medium mb-4">No hay evaluaciones registradas</p>
            <Button variant="primary">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Crear Primera Evaluación
            </Button>
        </div>
    );

    const pending = evaluations.filter(e => e.status === 'pending_grading');
    const upcoming = evaluations.filter(e => e.status === 'upcoming');
    const graded = evaluations.filter(e => e.status === 'graded');

    const renderEval = (ev) => {
        const dateFormatted = new Date(ev.date + 'T12:00:00').toLocaleDateString('es-UY', { day: 'numeric', month: 'long' });

        const statusConfig = {
            pending_grading: { badge: <Badge variant="urgent" icon="edit_document">Por corregir</Badge> },
            upcoming:        { badge: <Badge variant="neutral" icon="event">Próxima</Badge> },
            graded:          { badge: <Badge variant="success" icon="check_circle">Completada</Badge> },
        };

        return (
            <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-outline-variant bg-surface hover:shadow-sm transition-shadow">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-on-surface">{ev.title}</h3>
                        {statusConfig[ev.status]?.badge}
                    </div>
                    <p className="text-xs text-secondary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">assignment</span>
                        {ev.type} · {dateFormatted}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {ev.status === 'graded' && ev.avg != null && (
                        <div className="text-center mr-2">
                            <p className="text-xl font-bold text-primary leading-none">{ev.avg}</p>
                            <p className="text-[9px] text-outline uppercase font-bold tracking-wider">Promedio</p>
                        </div>
                    )}

                    {ev.status === 'pending_grading' ? (
                        <Button variant="danger" size="sm">
                            <span className="material-symbols-outlined text-[16px]">edit_document</span>
                            Corregir ({ev.pendingCount})
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Ver
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-on-surface">Evaluaciones</h2>
                <Button variant="primary" size="sm">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Nueva Evaluación
                </Button>
            </div>

            <div className="space-y-6">
                {/* Pending grading — urgent section */}
                {pending.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-error uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                            Pendientes de Corrección ({pending.length})
                        </p>
                        <div className="space-y-2">{pending.map(renderEval)}</div>
                    </div>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Próximas ({upcoming.length})</p>
                        <div className="space-y-2">{upcoming.map(renderEval)}</div>
                    </div>
                )}

                {/* Graded */}
                {graded.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Completadas ({graded.length})</p>
                        <div className="space-y-2">{graded.map(renderEval)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EvaluationsTab;
