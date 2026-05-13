import React from 'react';

const statConfig = [
    {
        key: 'totalStudents',
        label: 'Estudiantes',
        sublabel: 'en total',
        icon: 'group',
        colorClass: 'text-primary',
        bgClass: 'bg-primary-container',
        textClass: 'text-on-primary-container',
    },
    {
        key: 'totalLessons',
        label: 'Clases',
        sublabel: 'planificadas',
        icon: 'event_note',
        colorClass: 'text-tertiary',
        bgClass: 'bg-tertiary-container',
        textClass: 'text-on-tertiary-container',
    },
    {
        key: 'totalEvals',
        label: 'Pruebas',
        sublabel: 'creadas',
        icon: 'assignment',
        colorClass: 'text-secondary',
        bgClass: 'bg-secondary-container',
        textClass: 'text-on-secondary-container',
    },
];

const QuickStats = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-4">Resumen</h2>

            <div className="flex flex-col gap-3">
                {statConfig.map(item => (
                    <div
                        key={item.key}
                        className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low"
                    >
                        {/* Icon badge */}
                        <div className={`w-10 h-10 rounded-lg ${item.bgClass} flex items-center justify-center shrink-0`}>
                            <span className={`material-symbols-outlined text-[22px] ${item.textClass}`}>
                                {item.icon}
                            </span>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-outline font-semibold uppercase tracking-wider leading-none">
                                {item.label}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                                {item.sublabel}
                            </p>
                        </div>

                        {/* Number */}
                        <p className={`text-2xl font-bold ${item.colorClass} tabular-nums`}>
                            {stats[item.key] ?? '—'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickStats;
