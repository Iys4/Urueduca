import React, { useMemo } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { TabsNav } from '../Shared';
import LogClassTab from './Tabs/LogClassTab';
import HistoryTab from './Tabs/HistoryTab';
import PlanningTab from './Tabs/PlanningTab';
import EvaluationsTab from './Tabs/EvaluationsTab';
import RosterTab from './Tabs/RosterTab';
import { useAppStore } from '../../store/useAppStore';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const group = useAppStore(state => state.courses.find(c => String(c.id) === String(id)));
    
    // Selectors that return new arrays should be wrapped in useMemo or use a shallow equality check
    const allStudents = useAppStore(state => state.students);
    const allEvaluations = useAppStore(state => state.evaluations);
    const coursePlans = useAppStore(state => state.coursePlans);

    const students = useMemo(() => 
        allStudents.filter(s => String(s.course_id) === String(id)),
    [allStudents, id]);

    const evaluations = useMemo(() => 
        allEvaluations.filter(e => String(e.course_id) === String(id)),
    [allEvaluations, id]);

    const plan = useMemo(() => {
        if (!group?.coursePlanId) return null;
        return coursePlans.find(p => p.id === group.coursePlanId);
    }, [group?.coursePlanId, coursePlans]);

    const progress = useMemo(() => {
        if (!plan) return 0;
        const totalClasses = (plan.modules || []).reduce((sum, m) => sum + (m.classes || []).length, 0);
        if (totalClasses === 0) return 0;
        const completedCount = (group.completedClasses || []).length;
        return Math.round((completedCount / totalClasses) * 100);
    }, [plan, group?.completedClasses]);

    if (!group) return (
        <div className="space-y-4">
            <div className="skeleton h-28 w-full rounded-xl" />
            <div className="skeleton h-10 w-96" />
            <div className="skeleton h-64 w-full rounded-xl" />
        </div>
    );

    const pendingCount = evaluations.filter(e => e.status === 'pending_grading').length;

    const tabs = [
        { label: 'Registrar Clase', path: '',            icon: 'edit_note' },
        { label: 'Historial',       path: 'history',     icon: 'history' },
        { label: 'Planificación',   path: 'planning',    icon: 'event_note' },
        { label: 'Evaluaciones',    path: 'evaluations', icon: 'assignment',    badge: pendingCount > 0 ? pendingCount : null },
        { label: 'Alumnos',         path: 'roster',      icon: 'people',        badge: students.length },
    ];

    return (
        <div className="space-y-5">
            {/* Back + Header */}
            <button
                onClick={() => navigate('/groups')}
                className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Mis Grupos
            </button>

            <header className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-on-surface mb-1">{group.name}</h1>
                        <p className="text-sm text-secondary flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">domain</span>
                            {group.institution}
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary leading-none">{students.length}</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Alumnos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary leading-none">
                                {typeof group.performance === 'number' ? group.performance.toFixed(1) : '0.0'}
                            </p>
                            <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Promedio</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary leading-none">{progress}%</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Progreso</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs + Content */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-4 lg:p-6 min-h-[460px]">
                <TabsNav tabs={tabs} baseUrl={`/groups/${id}`} />

                <Routes>
                    <Route path="" element={<LogClassTab groupId={id} />} />
                    <Route path="history" element={<HistoryTab groupId={id} />} />
                    <Route path="planning" element={<PlanningTab groupId={id} />} />
                    <Route path="evaluations" element={<EvaluationsTab groupId={id} />} />
                    <Route path="roster" element={<RosterTab groupId={id} />} />
                    <Route path="*" element={<Navigate to="" replace />} />
                </Routes>
            </div>
        </div>

    );
};

export default GroupDetail;
