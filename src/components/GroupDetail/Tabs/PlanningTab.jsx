import React, { useMemo, useState } from 'react';
import { Button, Badge, Accordion, EmptyState } from '../../Shared';
import { useAppStore } from '../../../store/useAppStore';
import { coursePlanService } from '../../../services/coursePlanService';

const PlanningTab = ({ groupId }) => {
    const group = useAppStore(state => state.courses.find(c => String(c.id) === String(groupId)));
    const coursePlans = useAppStore(state => state.coursePlans);
    const markClassCompleted = useAppStore(state => state.markClassCompleted);
    const unmarkClassCompleted = useAppStore(state => state.unmarkClassCompleted);
    const assignCoursePlan = useAppStore(state => state.assignCoursePlan);

    const [isAssigning, setIsAssigning] = useState(false);

    const plan = useMemo(() => {
        if (!group?.coursePlanId) return null;
        return coursePlans.find(p => p.id === group.coursePlanId);
    }, [group?.coursePlanId, coursePlans]);

    const modules = useMemo(() => {
        if (!plan) return [];
        return coursePlanService.getModules(plan.id);
    }, [plan]);

    const handleToggleClass = (classId) => {
        const isCompleted = group.completedClasses?.includes(classId);
        if (isCompleted) {
            unmarkClassCompleted(group.id, classId);
        } else {
            markClassCompleted(group.id, classId);
        }
    };

    if (!group?.coursePlanId && !isAssigning) {
        return (
            <EmptyState
                icon="event_note"
                title="Sin planificación vinculada"
                description="Vinculá una planificación de tus cursos para trackear el progreso real con este grupo."
                action={
                    <Button variant="primary" onClick={() => setIsAssigning(true)}>
                        <span className="material-symbols-outlined text-[18px]">link</span>
                        Vincular Planificación
                    </Button>
                }
            />
        );
    }

    if (isAssigning) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-on-surface">Seleccionar Planificación</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsAssigning(false)}>Cancelar</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coursePlans.length > 0 ? (
                        coursePlans.map(cp => (
                            <div 
                                key={cp.id}
                                className="p-4 rounded-xl border border-outline-variant bg-surface hover:border-primary cursor-pointer transition-all"
                                onClick={() => {
                                    assignCoursePlan(group.id, cp.id);
                                    setIsAssigning(false);
                                }}
                            >
                                <h3 className="font-bold text-on-surface">{cp.nombre}</h3>
                                <p className="text-xs text-on-surface-variant">{cp.materia} · {cp.año}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-outline col-span-2 text-center py-8">No tenés planificaciones creadas aún.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-bold text-on-surface">Seguimiento de Planificación</h2>
                    <p className="text-sm text-on-surface-variant">
                        Plan: <span className="font-semibold">{plan?.nombre || 'Cargando...'}</span>
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAssigning(true)}>
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    Cambiar Plan
                </Button>
            </div>

            {/* Modules Progress */}
            <div className="space-y-4">
                {modules.map((mod, idx) => {
                    const modClasses = mod.classes || [];
                    const completedInMod = modClasses.filter(c => group.completedClasses?.includes(c.id)).length;
                    const progressPercent = modClasses.length > 0 ? Math.round((completedInMod / modClasses.length) * 100) : 0;

                    return (
                        <Accordion
                            key={mod.id}
                            defaultOpen={idx === 0}
                            title={
                                <span className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-primary bg-primary-container/50 px-2 py-0.5 rounded-full shrink-0">
                                        {mod.order}
                                    </span>
                                    {mod.title}
                                </span>
                            }
                            subtitle={`${completedInMod}/${modClasses.length} clases dictadas`}
                            badges={
                                progressPercent === 100 ? (
                                    <Badge variant="success" icon="check_circle">Terminado</Badge>
                                ) : progressPercent > 0 ? (
                                    <Badge variant="primary">{progressPercent}%</Badge>
                                ) : null
                            }
                        >
                            <div className="space-y-2 mt-2">
                                {modClasses.map(cls => {
                                    const isDone = group.completedClasses?.includes(cls.id);
                                    return (
                                        <div 
                                            key={cls.id}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                                ${isDone ? 'bg-surface-container border-outline-variant opacity-75' : 'bg-surface border-outline-variant hover:border-primary'}
                                            `}
                                            onClick={() => {
                                                if (cls.type !== 'evaluation') handleToggleClass(cls.id);
                                            }}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                ${isDone ? 'bg-primary border-primary' : 'border-outline'}
                                            `}>
                                                {isDone && <span className="material-symbols-outlined text-[16px] text-on-primary">check</span>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-semibold ${isDone ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                                                        {cls.title}
                                                    </p>
                                                    <Badge variant={cls.type === 'evaluation' ? 'warning' : 'neutral'} className="text-[9px] uppercase">
                                                        {cls.type === 'evaluation' ? 'Evaluación' : cls.type === 'optional' ? 'Opcional' : 'Obligatoria'}
                                                    </Badge>
                                                </div>
                                                {cls.shortDescription && !isDone && (
                                                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{cls.shortDescription}</p>
                                                )}
                                            </div>
                                            {isDone ? (
                                                <span className="text-[10px] font-bold text-success uppercase">Dictada</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-outline uppercase group-hover:text-primary">Marcar dictada</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Accordion>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanningTab;
