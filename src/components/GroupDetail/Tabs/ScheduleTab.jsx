import React, { useMemo, useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ScheduleTab = ({ groupId }) => {
    const group = useAppStore(state => state.courses.find(c => String(c.id) === String(groupId)));
    const updateCourse = useAppStore(state => state.updateCourse);
    const schedule = group?.schedule || [];

    const [isEditing, setIsEditing] = useState(false);
    const [tempSchedule, setTempSchedule] = useState([...schedule]);

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

        const today = new Date();
        const endOfYear = new Date(today.getFullYear(), 10, 30);
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

    const handleEditClick = () => {
        setTempSchedule([...schedule]);
        setIsEditing(true);
    };

    const handleSave = async () => {
        await updateCourse(group.id, { schedule: tempSchedule });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempSchedule([...schedule]);
        setIsEditing(false);
    };

    const handleAddSchedule = () => {
        setTempSchedule([...tempSchedule, { day: 'Lunes', startTime: '08:00', endTime: '09:30' }]);
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...tempSchedule];
        newSchedule[index][field] = value;
        setTempSchedule(newSchedule);
    };

    const handleRemoveSchedule = (index) => {
        setTempSchedule(tempSchedule.filter((_, i) => i !== index));
    };

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

            {/* Timetable view / Edit view */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                    <h3 className="font-bold text-on-surface">Horario del Curso</h3>
                    {!isEditing ? (
                        <button 
                            onClick={handleEditClick}
                            className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                            Editar
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={handleCancel}
                                className="text-sm font-medium text-secondary hover:text-on-surface px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                className="text-sm font-medium bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">save</span>
                                Guardar
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    {!isEditing ? (
                        schedule.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                                <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[24px] text-outline">schedule</span>
                                </div>
                                <h3 className="text-base font-bold text-on-surface mb-1">Sin horarios definidos</h3>
                                <p className="text-sm text-secondary max-w-sm mb-4">
                                    No has configurado los horarios para este grupo. Puedes agregarlos para estimar tus horas de clase.
                                </p>
                                <button 
                                    onClick={handleEditClick}
                                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-medium rounded-xl transition-colors text-sm"
                                >
                                    Agregar Horarios
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-outline-variant border border-outline-variant rounded-xl overflow-hidden">
                                {schedule.map((item, i) => (
                                    <div key={i} className="p-4 flex items-center justify-between hover:bg-surface-container transition-colors bg-white">
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
                        )
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-secondary">Configura los días y horas de clase.</p>
                                <button 
                                    onClick={handleAddSchedule}
                                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    Añadir bloque
                                </button>
                            </div>
                            
                            {tempSchedule.length === 0 ? (
                                <p className="text-sm text-secondary italic p-4 text-center border border-dashed border-outline-variant rounded-xl">No hay bloques de horario añadidos.</p>
                            ) : (
                                <div className="space-y-3">
                                    {tempSchedule.map((item, index) => (
                                        <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-surface-container-lowest border border-outline-variant p-3 rounded-xl">
                                            <select 
                                                className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 min-w-[120px]"
                                                value={item.day} 
                                                onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                                            >
                                                {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <div className="flex items-center gap-2 flex-1">
                                                <input 
                                                    type="time" 
                                                    className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary w-full text-center"
                                                    value={item.startTime}
                                                    onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                                />
                                                <span className="text-outline-variant">-</span>
                                                <input 
                                                    type="time" 
                                                    className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary w-full text-center"
                                                    value={item.endTime}
                                                    onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveSchedule(index)} 
                                                className="text-error hover:bg-error/10 p-2 rounded-lg flex transition-colors shrink-0"
                                                title="Eliminar bloque"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleTab;
