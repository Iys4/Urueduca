import React, { useMemo } from 'react';
import { useAppStore } from '../../../store/useAppStore';

const ScheduleTab = ({ groupId }) => {
    const group = useAppStore(state => state.courses.find(c => String(c.id) === String(groupId)));
    const schedule = group?.schedule || [];

    const stats = useMemo(() => {
        let totalMinutesPerWeek = 0;

        schedule.forEach(item => {
            if (item.startTime && item.endTime) {
                const [startH, startM] = item.startTime.split(':').map(Number);
                const [endH, endM] = item.endTime.split(':').map(Number);
                const startTotal = startH * 60 + startM;
                const endTotal = endH * 60 + endM;
                const diff = endTotal - startTotal;
                if (diff > 0) totalMinutesPerWeek += diff;
            }
        });

        const weeklyHours = totalMinutesPerWeek / 60;

        // Calculate weeks left until Nov 30th of the current year
        const today = new Date();
        const endOfYear = new Date(today.getFullYear(), 10, 30); // Nov 30
        let weeksLeft = 0;
        
        if (today < endOfYear) {
            const diffTime = Math.abs(endOfYear - today);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            weeksLeft = diffDays / 7;
        }

        const remainingHours = weeklyHours * weeksLeft;

        return {
            weeklyHours: weeklyHours.toFixed(1),
            remainingHours: Math.max(0, remainingHours).toFixed(0),
            weeksLeft: Math.max(0, weeksLeft).toFixed(1)
        };
    }, [schedule]);

    if (!schedule.length) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-outline">schedule</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Sin horarios definidos</h3>
                <p className="text-secondary max-w-sm">
                    No has configurado los horarios para este grupo. Puedes agregar horarios desde las opciones de configuración del grupo para poder estimar tus horas de clase.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-container p-4 rounded-xl border border-primary/20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                        <h4 className="text-sm font-bold text-on-primary-container uppercase tracking-wider">Horas Semanales</h4>
                    </div>
                    <p className="text-3xl font-black text-primary">{stats.weeklyHours} <span className="text-base font-medium">hrs</span></p>
                </div>
                <div className="bg-tertiary-container p-4 rounded-xl border border-tertiary/20 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-tertiary text-[20px]">hourglass_bottom</span>
                        <h4 className="text-sm font-bold text-on-tertiary-container uppercase tracking-wider">Restantes del Año</h4>
                    </div>
                    <p className="text-3xl font-black text-tertiary">{stats.remainingHours} <span className="text-base font-medium">hrs estimadas</span></p>
                    <p className="text-xs text-on-tertiary-container/70 mt-1">Hasta fin de cursos (Aprox. 30 Nov)</p>
                </div>
                <div className="bg-surface-container-highest p-4 rounded-xl border border-outline-variant flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-secondary text-[20px]">date_range</span>
                        <h4 className="text-sm font-bold text-secondary uppercase tracking-wider">Semanas Lectivas</h4>
                    </div>
                    <p className="text-3xl font-black text-on-surface">{stats.weeksLeft} <span className="text-base font-medium">semanas</span></p>
                </div>
            </div>

            {/* Timetable view */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
                    <h3 className="font-bold text-on-surface">Horario del Curso</h3>
                </div>
                <div className="divide-y divide-outline-variant">
                    {schedule.map((item, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                    {item.day.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface text-lg">{item.day}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-surface-container px-4 py-2 rounded-lg border border-outline-variant">
                                <span className="font-mono text-lg text-primary font-medium">{item.startTime}</span>
                                <span className="material-symbols-outlined text-outline-variant text-[16px]">arrow_forward</span>
                                <span className="font-mono text-lg text-primary font-medium">{item.endTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScheduleTab;
