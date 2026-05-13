import React, { useMemo, useState } from 'react';
import { Button, Badge, EmptyState } from '../../Shared';
import { useAppStore } from '../../../store/useAppStore';

const EvaluationsTab = ({ groupId }) => {
    const allEvaluations = useAppStore(state => state.evaluations);
    const allStudents = useAppStore(state => state.students);
    
    const students = useMemo(() => 
        allStudents.filter(s => String(s.course_id) === String(groupId)),
    [allStudents, groupId]);
    const addEvaluation = useAppStore(state => state.addEvaluation);
    const updateStudentGrade = useAppStore(state => state.updateStudentGrade);
    const updateEvaluation = useAppStore(state => state.updateEvaluation);
    const coursePlans = useAppStore(state => state.coursePlans);
    const group = useAppStore(state => state.courses.find(c => String(c.id) === String(groupId)));
    const markClassCompleted = useAppStore(state => state.markClassCompleted);

    const [isCreating, setIsCreating] = useState(false);
    const [selectedEval, setSelectedEval] = useState(null); // For grading mode
    const [linkedClassId, setLinkedClassId] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        type: 'Parcial',
        date: new Date().toISOString().split('T')[0],
        weight: 20,
    });

    const plan = useMemo(() => {
        if (!group?.coursePlanId) return null;
        return coursePlans.find(p => p.id === group.coursePlanId);
    }, [group?.coursePlanId, coursePlans]);

    const plannedEvaluations = useMemo(() => {
        if (!plan) return [];
        const found = [];
        (plan.modules || []).forEach(mod => {
            (mod.classes || []).forEach(cls => {
                if (cls.type === 'evaluation') {
                    found.push({ ...cls, moduleTitle: mod.title });
                }
            });
        });
        return found;
    }, [plan]);

    const evaluations = useMemo(() => {
        return allEvaluations
            .filter(e => String(e.course_id) === String(groupId))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allEvaluations, groupId]);

    const handleLinkSelect = (classId) => {
        setLinkedClassId(classId);
        const cls = plannedEvaluations.find(c => c.id === classId);
        if (cls) {
            setFormData(prev => ({
                ...prev,
                title: cls.title,
                type: 'Parcial' // Default to parcial but user can change
            }));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const newEval = {
            ...formData,
            id: Date.now(),
            course_id: String(groupId),
            status: 'pending_grading',
            grades: {},
            createdAt: new Date().toISOString()
        };
        await addEvaluation(newEval);

        if (linkedClassId) {
            await markClassCompleted(group.id, linkedClassId);
        }

        setIsCreating(false);
        setLinkedClassId('');
        setFormData({ title: '', type: 'Parcial', date: new Date().toISOString().split('T')[0], weight: 20 });
    };


    const handleGradeChange = (evalId, studentId, score) => {
        let numericScore = parseFloat(score);
        if (isNaN(numericScore)) {
            updateStudentGrade(evalId, studentId, { score: 0 });
            return;
        }
        
        // Cap at 12 and floor at 0
        if (numericScore > 12) numericScore = 12;
        if (numericScore < 0) numericScore = 0;
        
        updateStudentGrade(evalId, studentId, { score: numericScore });
    };

    const markAsGraded = async (evalId) => {
        await updateEvaluation(evalId, { status: 'graded' });
        setSelectedEval(null);
    };

    if (isCreating) {
        return (
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-on-surface">Nueva Evaluación</h2>
                    <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                    {plan && plannedEvaluations.length > 0 && (
                        <div className="bg-tertiary-container/10 p-4 rounded-xl border border-tertiary-container/20 mb-4">
                            <label className="text-xs font-bold text-outline uppercase tracking-wider mb-2 block px-1">Vincular con Planificación</label>
                            <select
                                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-tertiary transition-all"
                                value={linkedClassId}
                                onChange={e => handleLinkSelect(e.target.value)}
                            >
                                <option value="">-- No vincular o evaluación extra --</option>
                                {plannedEvaluations.map(cls => (
                                    <option key={cls.id} value={cls.id} disabled={group.completedClasses?.includes(cls.id)}>
                                        {group.completedClasses?.includes(cls.id) ? '✓ ' : ''}
                                        {cls.moduleTitle}: {cls.title}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[10px] text-tertiary mt-1.5 px-1 italic">
                                * Se marcará automáticamente como realizada en tu planificación.
                            </p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Título de la Evaluación</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            placeholder="Ej: Segundo Parcial de Biología"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Tipo</label>
                            <select
                                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Parcial</option>
                                <option>Examen</option>
                                <option>Tarea Oral</option>
                                <option>Escrito</option>
                                <option>Proyecto</option>
                                <option>Participación</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Peso en la Nota Final (%)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                                min="1" max="100"
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Fecha</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <Button type="submit" variant="primary" className="w-full mt-4">Crear y Comenzar a Calificar</Button>
                </form>

            </div>
        );
    }

    if (selectedEval) {
        const ev = evaluations.find(e => e.id === selectedEval);
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEval(null)}>
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Volver al listado
                    </Button>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-on-surface">{ev.title}</h2>
                        <p className="text-sm text-secondary">{ev.type} · Peso: {ev.weight}%</p>
                    </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant">
                                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Alumno</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider text-right">Calificación (1-12)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {students.map(s => (
                                <tr key={s.id} className="hover:bg-surface-container-low/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-on-surface">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <input
                                            type="number"
                                            min="0" max="12" step="0.5"
                                            className="w-20 px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-right text-sm font-bold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={ev.grades?.[s.id]?.score || ''}
                                            onChange={e => handleGradeChange(ev.id, s.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="success" size="lg" onClick={() => markAsGraded(ev.id)}>
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Finalizar Calificación
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-on-surface px-1">Evaluaciones y Parciales</h2>
                <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Nueva Evaluación
                </Button>
            </div>

            {evaluations.length === 0 ? (
                <EmptyState
                    icon="assignment"
                    title="No hay evaluaciones"
                    description="Registra parciales, tareas orales o escritos para llevar el control de notas de este grupo."
                />
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {evaluations.map(ev => (
                        <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-outline-variant bg-surface-container-lowest hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    ev.status === 'graded' ? 'bg-success-container text-on-success-container' : 'bg-warning-container text-on-warning-container'
                                }`}>
                                    <span className="material-symbols-outlined text-[24px]">
                                        {ev.type === 'Examen' ? 'history_edu' : ev.type === 'Tarea Oral' ? 'record_voice_over' : 'assignment'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{ev.title}</h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <span className="text-xs text-secondary">{ev.type} · Peso: <span className="font-bold">{ev.weight}%</span></span>
                                        <Badge variant={ev.status === 'graded' ? 'success' : 'warning'}>
                                            {ev.status === 'graded' ? 'Calificado' : 'Pendiente'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                <Button variant="outline" size="sm" onClick={() => setSelectedEval(ev.id)}>
                                    <span className="material-symbols-outlined text-[18px]">edit_document</span>
                                    {ev.status === 'graded' ? 'Editar Notas' : 'Cargar Notas'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EvaluationsTab;
