import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../../Shared';
import { dashboardService } from '../../../services/dashboardService';
import { mockDb } from '../../../data/mockDb';
import PlanDocumentQuickView from '../../Groups/PlanDocumentQuickView';

const PlanningTab = ({ groupId }) => {
    const [lessons, setLessons] = useState([]);
    const [showQuickView, setShowQuickView] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);

    useEffect(() => {
        const data = dashboardService.getLessonsByCourse(groupId);
        setLessons(data);
        
        // Mock finding the plan for the course
        const groupStr = dashboardService.getCourseById(groupId)?.name || '';
        const isBio4 = groupStr.includes('4to');
        const planId = isBio4 ? 'cp-bio-4' : 'cp-bio-5';
        setCurrentPlan(mockDb.coursePlans.find(p => p.id === planId));
    }, [groupId]);

    const todayStr = new Date().toISOString().split('T')[0];

    if (lessons.length === 0) return (
        <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3">event_busy</span>
            <p className="text-secondary font-medium mb-4">No hay clases planificadas aún</p>
            <Button variant="primary">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Agregar Primera Clase
            </Button>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-on-surface">Cronograma de Clases</h2>
                <div className="flex gap-2">
                    {currentPlan && currentPlan.curriculumDocument && (
                        <Button variant="outline" size="sm" onClick={() => setShowQuickView(true)}>
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            Ver Documento
                        </Button>
                    )}
                    <Button variant="primary" size="sm">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Nueva Clase
                    </Button>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative ml-4 border-l-2 border-outline-variant space-y-6 pb-4">
                {lessons.map((cls) => {
                    const isPast = cls.date < todayStr;
                    const isToday = cls.date === todayStr;
                    const isFuture = cls.date > todayStr;

                    let dotClass = 'bg-outline-variant';
                    if (isToday) dotClass = 'bg-primary ring-4 ring-primary/15';
                    else if (isPast) dotClass = 'bg-tertiary';

                    let statusBadge = null;
                    if (isToday) statusBadge = <Badge variant="primary" dot>Hoy</Badge>;
                    else if (isPast) statusBadge = <Badge variant="success" icon="check_circle">Dictada</Badge>;
                    else statusBadge = <Badge variant="neutral">Planificada</Badge>;

                    const dateFormatted = new Date(cls.date + 'T12:00:00').toLocaleDateString('es-UY', {
                        weekday: 'short', day: 'numeric', month: 'short'
                    });

                    return (
                        <div key={cls.id} className={`relative pl-8 ${isPast ? 'opacity-60' : ''}`}>
                            {/* Dot */}
                            <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-surface-container-lowest ${dotClass}`} />

                            <div className={`
                                p-4 rounded-lg border transition-all
                                ${isToday ? 'border-primary bg-primary-container/20 shadow-sm' : 'border-outline-variant bg-surface hover:shadow-sm'}
                            `}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                    <h3 className={`font-bold text-sm ${isToday ? 'text-primary' : 'text-on-surface'}`}>
                                        {cls.topic}
                                    </h3>
                                    {statusBadge}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-secondary">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        {dateFormatted}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                        {cls.start_time} – {cls.end_time}
                                    </span>
                                    {cls.notes && (
                                        <span className="flex items-center gap-1 text-primary">
                                            <span className="material-symbols-outlined text-[14px]">sticky_note_2</span>
                                            {cls.notes}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showQuickView && currentPlan && (
                <PlanDocumentQuickView 
                    plan={currentPlan} 
                    onClose={() => setShowQuickView(false)} 
                />
            )}
        </div>
    );
};

export default PlanningTab;
