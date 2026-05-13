import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { mockDb } from '../../data/mockDb';
import { Button } from '../Shared';

const EvaluationGrading = () => {
    const { id, evalId } = useParams();
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [evalu, setEvalu] = useState(null);
    const [students, setStudents] = useState([]);
    
    // local state for grading to allow auto-save
    const [gradesData, setGradesData] = useState({});

    useEffect(() => {
        const c = dashboardService.getCourseById(id);
        const e = mockDb.evaluations.find(ev => ev.id === parseInt(evalId) && ev.course_id === parseInt(id));
        const s = dashboardService.getStudentsByCourse(id);
        
        if (c && e) {
            setCourse(c);
            setEvalu(e);
            setStudents(s);
            // Initialize local state with existing grades
            setGradesData(e.grades || {});
        }
    }, [id, evalId]);

    if (!course || !evalu) return <div className="p-8 text-center text-outline">Cargando evaluación...</div>;

    const handleGradeChange = (studentId, value) => {
        setGradesData(prev => {
            const newState = {
                ...prev,
                [studentId]: { ...prev[studentId], nota: value }
            };
            autoSave(newState);
            return newState;
        });
    };

    const handleAttendanceChange = (studentId, value) => {
        setGradesData(prev => {
            const newState = {
                ...prev,
                [studentId]: { ...prev[studentId], asistencia: value }
            };
            autoSave(newState);
            return newState;
        });
    };

    const handleObsChange = (studentId, value) => {
        setGradesData(prev => {
            const newState = {
                ...prev,
                [studentId]: { ...prev[studentId], obs: value }
            };
            autoSave(newState);
            return newState;
        });
    };

    const autoSave = (newState) => {
        // Update mockDb in place
        evalu.grades = newState;
        
        // Check if all students have a grade
        const gradedCount = Object.keys(newState).filter(k => newState[k]?.nota !== undefined && newState[k]?.nota !== '').length;
        if (gradedCount === students.length && evalu.status === 'pending_grading') {
            evalu.status = 'graded';
        } else if (gradedCount < students.length && evalu.status === 'graded') {
            evalu.status = 'pending_grading';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-2">
                    <button onClick={() => navigate(`/groups/${id}`)} className="hover:text-primary transition-colors">
                        {course.name}
                    </button>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    <span>Evaluaciones</span>
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-[28px] text-primary">edit_document</span>
                            {evalu.title}
                        </h1>
                        <p className="text-sm text-on-surface-variant mt-1">
                            {evalu.type} • {new Date(evalu.date).toLocaleDateString('es-UY')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${evalu.status === 'graded' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                            {evalu.status === 'graded' ? 'Corregido' : 'Pendiente de corrección'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Grading Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase tracking-wider text-on-surface-variant">
                                <th className="p-4 font-semibold w-1/4">Alumno</th>
                                <th className="p-4 font-semibold w-24 text-center">Asistió</th>
                                <th className="p-4 font-semibold w-32">Calificación</th>
                                <th className="p-4 font-semibold">Observaciones</th>
                                <th className="p-4 font-semibold w-24 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/50">
                            {students.map(student => {
                                const sData = gradesData[student.id] || {};
                                const isGraded = sData.nota !== undefined && sData.nota !== '';
                                
                                return (
                                    <tr key={student.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-on-surface">{student.name}</p>
                                                    <p className="text-[11px] text-outline">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                                                checked={sData.asistencia !== false}
                                                onChange={(e) => handleAttendanceChange(student.id, e.target.checked)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input 
                                                type="number"
                                                min="1" max="12"
                                                className="w-20 px-3 py-1.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-1 focus:ring-primary text-center"
                                                placeholder="1-12"
                                                value={sData.nota || ''}
                                                onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input 
                                                type="text"
                                                className="w-full px-3 py-1.5 text-sm rounded-lg border border-transparent bg-transparent hover:border-outline-variant hover:bg-surface-container-lowest focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                                                placeholder="Añadir comentario..."
                                                value={sData.obs || ''}
                                                onChange={(e) => handleObsChange(student.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            {isGraded ? (
                                                <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-outline text-[20px]">pending</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => navigate(`/groups/${id}`)}>
                    Volver al grupo
                </Button>
                <Button variant="primary" onClick={() => navigate('/')}>
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Volver al Dashboard
                </Button>
            </div>
        </div>
    );
};

export default EvaluationGrading;
