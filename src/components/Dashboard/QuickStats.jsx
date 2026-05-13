import React from 'react';

const statItems = [
    { key: 'totalStudents',   label: 'Estudiantes',      icon: 'person',       color: 'text-primary' },
    { key: 'pendingEvals',    label: 'Por Corregir',      icon: 'edit_document', color: 'text-error' },
    { key: 'attendanceRate',  label: 'Asistencia',        icon: 'how_to_reg',   color: 'text-tertiary', suffix: '%' },
    { key: 'plannedSessions', label: 'Clases Planificadas', icon: 'event_note', color: 'text-primary' },
];

const QuickStats = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-5">Resumen</h2>

            <div className="grid grid-cols-2 gap-4">
                {statItems.map(item => (
                    <div key={item.key} className="flex flex-col items-center text-center p-3 rounded-lg bg-surface-container-low">
                        <span className={`material-symbols-outlined text-[22px] ${item.color} mb-1`}>{item.icon}</span>
                        <p className="text-xl font-bold text-on-surface leading-tight">
                            {stats[item.key]}{item.suffix || ''}
                        </p>
                        <p className="text-[10px] text-outline font-semibold uppercase tracking-wider mt-0.5">{item.label}</p>
                    </div>
                ))}
            </div>

            {/* Performance indicator */}
            <div className="mt-4 p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Promedio General</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-on-surface">{stats.performance}</span>
                        <span className={`text-xs font-bold ${stats.performanceDelta >= 0 ? 'text-tertiary' : 'text-error'}`}>
                            {stats.performanceDelta >= 0 ? '↑' : '↓'} {Math.abs(stats.performanceDelta)}
                        </span>
                    </div>
                </div>
                <span className="material-symbols-outlined text-[28px] text-tertiary">trending_up</span>
            </div>
        </div>
    );
};

export default QuickStats;
