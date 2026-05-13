import React, { useMemo, useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { Badge, EmptyState, Modal, Button } from '../../Shared';

const HistoryTab = ({ groupId }) => {
    const allLessons = useAppStore(state => state.lessons);
    const allEvaluations = useAppStore(state => state.evaluations);
    const allStudents = useAppStore(state => state.students);
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState(null); // 'lesson' | 'evaluation'

    const students = useMemo(() => 
        allStudents.filter(s => String(s.course_id) === String(groupId)),
    [allStudents, groupId]);

    const timelineItems = useMemo(() => {
        const lessons = allLessons
            .filter(l => String(l.course_id) === String(groupId))
            .map(l => ({ ...l, itemType: 'lesson' }));
            
        const evaluations = allEvaluations
            .filter(e => String(e.course_id) === String(groupId) && e.status === 'graded')
            .map(e => ({ ...e, itemType: 'evaluation' }));

        return [...lessons, ...evaluations]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [allLessons, allEvaluations, groupId]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const getAttendanceStats = (attendanceMap) => {
        if (!attendanceMap) return { count: 0, percent: 0, absents: [] };
        const total = students.length || Object.keys(attendanceMap).length;
        if (total === 0) return { count: 0, percent: 0, absents: [] };
        
        const absents = students.filter(s => attendanceMap[s.id] === 'ausente' || attendanceMap[s.id] === false);
        const presentCount = total - absents.length;
        
        return {
            count: presentCount,
            total: total,
            percent: Math.round((presentCount / total) * 100),
            absents
        };
    };

    if (timelineItems.length === 0) {
        return (
            <EmptyState
                icon="history"
                title="Sin registros"
                description="Todavía no has registrado ninguna clase o evaluación para este grupo."
            />
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface px-1">Historial y Actividad</h2>
            
            <div className="grid grid-cols-1 gap-4">
                {timelineItems.map(item => {
                    const isLesson = item.itemType === 'lesson';
                    const stats = isLesson ? getAttendanceStats(item.attendance) : null;
                    
                    return (
                        <div key={item.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 hover:shadow-md transition-shadow group">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                                        isLesson ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'
                                    }`}>
                                        <span className="text-[10px] font-bold uppercase opacity-70 leading-none mb-0.5">
                                            {new Date(item.date + 'T12:00:00').toLocaleDateString('es-UY', { month: 'short' }).replace('.', '')}
                                        </span>
                                        <span className="text-lg font-black leading-none">
                                            {new Date(item.date + 'T12:00:00').getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px] text-outline">
                                                {isLesson ? 'edit_note' : 'assignment_turned_in'}
                                            </span>
                                            <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                                                {isLesson ? (item.topic || 'Clase dictada') : item.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-secondary">{formatDate(item.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                    {isLesson ? (
                                        <Badge variant={stats.percent > 80 ? 'success' : stats.percent > 50 ? 'primary' : 'warning'}>
                                            {stats.percent}% Asistencia
                                        </Badge>
                                    ) : (
                                        <Badge variant="tertiary">
                                            {item.type} · {item.weight}%
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            
                            {(isLesson && item.summary) && (
                                <div className="bg-surface-container-low p-4 rounded-lg">
                                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                                        {item.summary}
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-outline-variant flex justify-between items-center">
                                <span className="text-[10px] text-outline font-bold uppercase tracking-widest">
                                    {isLesson 
                                        ? `${stats.count} de ${stats.total} alumnos presentes`
                                        : `${Object.keys(item.grades || {}).length} alumnos calificados`
                                    }
                                </span>
                                <button 
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setModalType(isLesson ? 'lesson' : 'evaluation');
                                    }}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    Ver detalles
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title={modalType === 'lesson' ? 'Detalle de Clase' : 'Resultados de Evaluación'}
                size="lg"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-secondary mb-1">{formatDate(selectedItem.date)}</p>
                            <h3 className="text-xl font-bold text-on-surface">
                                {modalType === 'lesson' ? (selectedItem.topic || 'Clase Dictada') : selectedItem.title}
                            </h3>
                        </div>

                        {modalType === 'lesson' ? (
                            <>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Bitácora / Resumen</h4>
                                    <div className="bg-surface-container p-4 rounded-xl text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                                        {selectedItem.summary || 'Sin resumen registrado.'}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-outline uppercase tracking-wider">
                                        Inasistencias ({getAttendanceStats(selectedItem.attendance).absents.length})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {getAttendanceStats(selectedItem.attendance).absents.map(s => (
                                            <div key={s.id} className="flex items-center gap-3 p-2 border border-outline-variant rounded-lg bg-error-container/5">
                                                <div className="w-6 h-6 rounded-full bg-error-container text-on-error-container flex items-center justify-center text-[10px] font-bold">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-on-surface">{s.name}</span>
                                                <Badge variant="error" className="ml-auto text-[10px]">Ausente</Badge>
                                            </div>
                                        ))}
                                        {getAttendanceStats(selectedItem.attendance).absents.length === 0 && (
                                            <p className="text-sm text-secondary italic">Asistencia perfecta.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-tertiary-container/10 p-4 rounded-xl border border-tertiary-container/20">
                                    <span className="text-sm font-medium text-on-surface">Tipo: {selectedItem.type}</span>
                                    <span className="text-sm font-bold text-tertiary">Peso Final: {selectedItem.weight}%</span>
                                </div>
                                
                                <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Calificaciones</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {students.map(s => {
                                        const grade = selectedItem.grades?.[s.id]?.score;
                                        return (
                                            <div key={s.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-xl bg-surface">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-on-surface">{s.name}</span>
                                                </div>
                                                <span className={`text-sm font-black ${grade >= 6 ? 'text-success' : 'text-error'}`}>
                                                    {grade !== undefined ? grade.toFixed(1) : '-'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HistoryTab;
