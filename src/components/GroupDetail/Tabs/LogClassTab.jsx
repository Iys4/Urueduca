import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../Shared';
import { dashboardService } from '../../../services/dashboardService';
import NewStudentModal from '../../Students/NewStudentModal';
import { useAppStore } from '../../../store/useAppStore';

const LogClassTab = ({ groupId }) => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [summary, setSummary] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [isHalfCompleted, setIsHalfCompleted] = useState(false);
    const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [conducts, setConducts] = useState({});
    
    const allLessons = useAppStore(state => state.lessons);
    const globalStudents = useAppStore(state => state.students);
    const coursePlans = useAppStore(state => state.coursePlans);
    const group = useAppStore(state => state.courses.find(c => String(c.id) === String(groupId)));
    const addLesson = useAppStore(state => state.addLesson);
    const markClassCompleted = useAppStore(state => state.markClassCompleted);
    const markClassHalfCompleted = useAppStore(state => state.markClassHalfCompleted);

    const plan = useMemo(() => {
        if (!group?.coursePlanId) return null;
        return coursePlans.find(p => p.id === group.coursePlanId);
    }, [group?.coursePlanId, coursePlans]);

    const availableClasses = useMemo(() => {
        if (!plan) return [];
        // Flatten modules and their classes, filtering out evaluations
        const flattened = [];
        (plan.modules || []).forEach(mod => {
            (mod.classes || []).forEach(cls => {
                if (cls.type !== 'evaluation') {
                    flattened.push({ ...cls, moduleTitle: mod.title });
                }
            });
        });
        return flattened;
    }, [plan]);

    const existingClass = useMemo(() => {
        return allLessons.find(l => String(l.course_id) === String(groupId) && l.date === selectedDate);
    }, [allLessons, groupId, selectedDate]);

    useEffect(() => {
        const data = dashboardService.getStudentsByCourse(groupId);
        setStudents(data);
        // Initialize attendance and conducts
        setAttendance(prev => {
            const next = { ...prev };
            data.forEach(s => {
                if (next[s.id] === undefined) next[s.id] = true;
            });
            return next;
        });
        setConducts(prev => {
            const next = { ...prev };
            data.forEach(s => {
                if (next[s.id] === undefined) next[s.id] = ''; // '' means no conduct registered
            });
            return next;
        });
    }, [groupId, globalStudents]);

    const handleClassSelect = (classId) => {
        setSelectedClassId(classId);
        const cls = availableClasses.find(c => c.id === classId);
        if (cls) {
            setSummary(prev => {
                if (prev.trim()) return prev; // Don't overwrite if user typed something
                return `${cls.title}\n${cls.shortDescription || ''}`;
            });
        }
    };

    const toggleAttendance = (id) => {
        setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
        setSaveState('idle');
    };

    const markAllPresent = () => {
        setAttendance(students.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}));
        setSaveState('idle');
    };

    const handleSave = async () => {
        if (!summary.trim()) {
            alert('Por favor escribí un resumen de la clase.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (selectedDate > today) {
            alert('No se pueden registrar clases en fechas futuras. Las clases solo pueden loguearse luego de efectuadas.');
            return;
        }

        if (existingClass) {
            const confirmMsg = `Ya registraste una clase el ${selectedDate} (${existingClass.topic}). ¿Querés registrar otra clase adicional para este mismo día?`;
            if (!window.confirm(confirmMsg)) return;
        }

        setSaveState('saving');
        
        const nowStr = new Date().toTimeString().substring(0, 5); // "HH:MM"
        const endStr = new Date(Date.now() + 90 * 60 * 1000).toTimeString().substring(0, 5); // +90 mins

        const newLesson = {
            id: Date.now(),
            course_id: String(groupId),
            date: selectedDate,
            start_time: nowStr,
            end_time: endStr,
            topic: summary.split('\n')[0].substring(0, 50),
            summary: summary,
            attendance: attendance,
            conducts: conducts,
            attendanceCompleted: true,
            createdAt: new Date().toISOString()
        };

        await addLesson(newLesson);

        // Link with planning if a class was selected
        if (selectedClassId) {
            if (isHalfCompleted) {
                await markClassHalfCompleted(group.id, selectedClassId);
            } else {
                await markClassCompleted(group.id, selectedClassId);
            }
        }
        
        setSaveState('saved');
        setSummary('');
        setSelectedClassId('');
        setIsHalfCompleted(false);
        setTimeout(() => setSaveState('idle'), 2000);
    };


    const presentCount = Object.values(attendance).filter(Boolean).length;
    const absentCount = Math.max(0, students.length - presentCount);

    return (
        <div className="space-y-6">
            {/* Header & Date Selector & Class Selector */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary text-on-primary w-10 h-10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined">event</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-on-surface">Fecha de la Clase</h3>
                            <p className="text-[11px] text-secondary uppercase font-bold tracking-wider">Bitácora y Asistencia</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        {existingClass && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-container/30 text-on-warning-container rounded-lg border border-warning-container/50">
                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                <span className="text-xs font-bold">Ya hay una clase este día</span>
                            </div>
                        )}
                        <input
                            type="date"
                            className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-sm font-medium focus:outline-none focus:border-primary transition-all"
                            value={selectedDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={e => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {plan && (
                    <div className="pt-4 border-t border-outline-variant/50">
                        <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block px-1">Vincular con Planificación</label>
                        <select
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all mb-3"
                            value={selectedClassId}
                            onChange={e => handleClassSelect(e.target.value)}
                        >
                            <option value="">-- No vincular o clase libre --</option>
                            {availableClasses.map(cls => {
                                const isCompleted = group.completedClasses?.includes(cls.id);
                                const isHalf = group.halfCompletedClasses?.includes(cls.id);
                                return (
                                    <option key={cls.id} value={cls.id} disabled={isCompleted}>
                                        {isCompleted ? '✓ ' : isHalf ? '½ ' : ''}
                                        {cls.moduleTitle}: {cls.title}
                                    </option>
                                );
                            })}
                        </select>
                        {selectedClassId && (
                            <label className="flex items-center gap-2 px-1 mb-2">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                                    checked={isHalfCompleted}
                                    onChange={e => setIsHalfCompleted(e.target.checked)}
                                />
                                <span className="text-sm font-medium text-on-surface">Completada a medias (requiere otra clase)</span>
                            </label>
                        )}
                        <p className="text-[10px] text-secondary mt-1.5 px-1 italic">
                            * Al seleccionar una clase del plan, se marcará automáticamente como dictada en tu planificación.
                        </p>
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant">
                <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block px-1">Resumen de la Clase / Bitácora</label>
                <textarea
                    rows="4"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                    placeholder="¿Qué temas se trataron hoy? Tareas asignadas, novedades..."
                    value={summary}
                    onChange={e => { setSummary(e.target.value); setSaveState('idle'); }}
                />
            </div>

            {/* Attendance Section */}
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-on-surface">Asistencia</h2>
                            <Button variant="ghost" size="xs" className="h-7" onClick={() => setIsModalOpen(true)}>
                                <span className="material-symbols-outlined text-[16px]">person_add</span>
                                Agregar Alumno
                            </Button>
                        </div>
                        <p className="text-sm text-secondary">
                            Marcá los alumnos presentes para esta fecha
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-3 text-center">
                            <div>
                                <p className="text-lg font-bold text-tertiary leading-none">{presentCount}</p>
                                <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Presentes</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-error leading-none">{absentCount}</p>
                                <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Ausentes</p>
                            </div>
                        </div>
                        <button
                            onClick={markAllPresent}
                            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                            Marcar todos
                        </button>
                    </div>
                </div>

                {students.length > 0 ? (
                    <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant">
                                    <th className="text-left py-3 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Alumno</th>
                                    <th className="text-center py-3 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Conducta</th>
                                    <th className="text-right py-3 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-on-surface">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <select
                                                className="px-2 py-1 text-xs border border-outline-variant rounded-md bg-surface text-on-surface focus:border-primary transition-all"
                                                value={conducts[student.id] || ''}
                                                onChange={(e) => {
                                                    setConducts(prev => ({ ...prev, [student.id]: e.target.value }));
                                                    setSaveState('idle');
                                                }}
                                            >
                                                <option value="">--</option>
                                                <option value="Excelente">Excelente</option>
                                                <option value="Buena">Buena</option>
                                                <option value="Regular">Regular</option>
                                                <option value="Mala">Mala</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => toggleAttendance(student.id)}
                                                className={`
                                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all w-28 justify-center
                                                    ${attendance[student.id]
                                                        ? 'bg-success-container text-on-success-container hover:bg-success-container/70'
                                                        : 'bg-error-container text-on-error-container hover:bg-error-container/70'
                                                    }
                                                `}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {attendance[student.id] ? 'check_circle' : 'cancel'}
                                                </span>
                                                {attendance[student.id] ? 'Presente' : 'Ausente'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-surface-container-low border border-dashed border-outline-variant rounded-xl">
                        <p className="text-secondary font-medium mb-4">No hay alumnos en este grupo</p>
                        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>Agregar Alumno</Button>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    variant={saveState === 'saved' ? 'success' : 'primary'}
                    onClick={handleSave}
                    disabled={saveState === 'saving' || saveState === 'saved'}
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {saveState === 'saved' ? 'check_circle' : 'save'}
                    </span>
                    {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? '¡Clase Registrada!' : 'Finalizar y Guardar Clase'}
                </Button>
            </div>

            <NewStudentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                forceGroupId={groupId}
            />
        </div>
    );
};

export default LogClassTab;
