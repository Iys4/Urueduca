import React, { useState, useEffect } from 'react';
import { Button } from '../../Shared';
import { dashboardService } from '../../../services/dashboardService';
import NewStudentModal from '../../Students/NewStudentModal';
import { useAppStore } from '../../../store/useAppStore';

const AttendanceTab = ({ groupId }) => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [saveState, setSaveState] = useState('idle'); // idle | dirty | saved
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Listen to global students changes to refresh local list
    const globalStudents = useAppStore(state => state.students);

    useEffect(() => {
        const data = dashboardService.getStudentsByCourse(groupId);
        setStudents(data);
        // Initialize attendance for new students only
        setAttendance(prev => {
            const next = { ...prev };
            data.forEach(s => {
                if (next[s.id] === undefined) next[s.id] = true;
            });
            return next;
        });
    }, [groupId, globalStudents]);

    const toggleAttendance = (id) => {
        setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
        setSaveState('dirty');
    };

    const markAllPresent = () => {
        setAttendance(students.reduce((acc, s) => ({ ...acc, [s.id]: true }), {}));
        setSaveState('dirty');
    };

    const handleSave = () => {
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
    };

    const presentCount = Object.values(attendance).filter(Boolean).length;
    const absentCount = Math.max(0, students.length - presentCount);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-on-surface">Lista de Asistencia</h2>
                        <Button variant="ghost" size="xs" className="h-7" onClick={() => setIsModalOpen(true)}>
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            Agregar Alumno
                        </Button>
                    </div>
                    <p className="text-sm text-secondary">
                        {new Date().toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-4">

                    {/* Quick stats */}
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

            {/* Student list */}
            {students.length > 0 ? (
                <div className="rounded-lg border border-outline-variant overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant">
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Alumno</th>
                                <th className="text-right py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors">
                                    <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold shrink-0">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-on-surface">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <button
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`
                                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all w-24 justify-center
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
                <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-3">person_off</span>
                    <p className="text-secondary font-medium mb-4">No hay alumnos registrados en este grupo</p>
                    <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Agregar Primer Alumno
                    </Button>
                </div>
            )}

            {/* Sticky save bar */}
            <div className="flex justify-end mt-5 sticky bottom-4">
                <Button
                    variant={saveState === 'saved' ? 'success' : saveState === 'dirty' ? 'primary' : 'secondary'}
                    onClick={handleSave}
                    disabled={saveState === 'idle'}
                    size="lg"
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {saveState === 'saved' ? 'check_circle' : 'save'}
                    </span>
                    {saveState === 'saved' ? 'Guardado ✓' : 'Guardar Asistencia'}
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

export default AttendanceTab;
