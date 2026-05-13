import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { TabsNav } from '../Shared';
import AttendanceTab from './Tabs/AttendanceTab';
import PlanningTab from './Tabs/PlanningTab';
import EvaluationsTab from './Tabs/EvaluationsTab';
import RosterTab from './Tabs/RosterTab';
import { dashboardService } from '../../services/dashboardService';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);

    useEffect(() => {
        const course = dashboardService.getCourseById(id);
        if (!course) return;
        const students = dashboardService.getStudentsByCourse(id);
        const evals = dashboardService.getEvaluationsByCourse(id);
        setGroup({ ...course, students, evaluations: evals });
    }, [id]);

    if (!group) return (
        <div className="space-y-4">
            <div className="skeleton h-28 w-full rounded-xl" />
            <div className="skeleton h-10 w-96" />
            <div className="skeleton h-64 w-full rounded-xl" />
        </div>
    );

    const pendingCount = group.evaluations.filter(e => e.status === 'pending_grading').length;

    const tabs = [
        { label: 'Asistencia',    path: '',            icon: 'how_to_reg' },
        { label: 'Planificación', path: 'planning',    icon: 'event_note' },
        { label: 'Evaluaciones',  path: 'evaluations', icon: 'assignment',    badge: pendingCount > 0 ? pendingCount : null },
        { label: 'Alumnos',       path: 'roster',      icon: 'people',        badge: group.students.length },
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
                            <p className="text-2xl font-bold text-primary leading-none">{group.studentsCount}</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Alumnos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary leading-none">{group.performance.toFixed(1)}</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Promedio</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary leading-none">{group.moduleProgress}%</p>
                            <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Progreso</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs + Content */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-4 lg:p-6 min-h-[460px]">
                <TabsNav tabs={tabs} baseUrl={`/groups/${id}`} />

                <Routes>
                    <Route path="" element={<AttendanceTab groupId={id} />} />
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
