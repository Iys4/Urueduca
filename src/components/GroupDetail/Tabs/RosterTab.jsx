import React, { useEffect, useState } from 'react';
import { Badge, Button, Dropdown } from '../../Shared';
import { dashboardService } from '../../../services/dashboardService';
import NewStudentModal from '../../Students/NewStudentModal';
import { useAppStore } from '../../../store/useAppStore';
import { calculateStudentConduct, getConductColor } from '../../../utils/conductHelpers';

const RosterTab = ({ groupId }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const updateStudent = useAppStore(state => state.updateStudent);
    const deleteStudent = useAppStore(state => state.deleteStudent);

    const globalStudents = useAppStore(state => state.students);
    const lessons = useAppStore(state => state.lessons);

    useEffect(() => {
        const data = dashboardService.getStudentsByCourse(groupId);
        setStudents(data);
    }, [groupId, globalStudents]);

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getPerformanceVariant = (avg) => {
        if (avg >= 9) return 'success';
        if (avg >= 6) return 'neutral';
        if (avg >= 4) return 'warning';
        return 'urgent';
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-on-surface">
                        Listado de Alumnos
                        <span className="text-sm font-normal text-secondary ml-2">({students.length})</span>
                    </h2>
                    <Button variant="ghost" size="xs" onClick={() => setIsModalOpen(true)}>
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        Agregar Alumno
                    </Button>
                </div>
                <div className="relative w-full sm:w-auto">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56 pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {students.length > 0 ? (
                <div className="rounded-lg border border-outline-variant overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant">
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Nombre</th>
                                <th className="text-left py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                                <th className="text-center py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider hidden sm:table-cell">Conducta</th>
                                <th className="text-right py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Promedio</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {filtered.map(student => (
                                <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors">
                                    <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[11px] font-bold shrink-0">
                                                {student.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-on-surface">{student.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-4 text-sm text-secondary hidden sm:table-cell">{student.email || 'Sin contacto'}</td>
                                    <td className="py-2.5 px-4 text-center hidden sm:table-cell">
                                        {(() => {
                                            const conduct = calculateStudentConduct(student.id, lessons);
                                            return conduct ? (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getConductColor(conduct)}`}>
                                                    {conduct}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-outline">-</span>
                                            );
                                        })()}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <Badge variant={getPerformanceVariant(student.avg)} className="ml-auto">
                                            {student.avg?.toFixed(1) || '0.0'}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <Dropdown
                                            items={[
                                                { icon: 'edit', label: 'Editar alumno', onClick: () => {} },
                                                { icon: 'person_remove', label: 'Quitar del grupo', danger: true, onClick: () => updateStudent(student.id, { course_id: null }) },
                                                { separator: true },
                                                { icon: 'delete', label: 'Eliminar del sistema', danger: true, onClick: () => { if(confirm('¿Seguro? Se borrará de todos tus grupos.')) deleteStudent(student.id); } },
                                            ]}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <div className="p-8 text-center text-secondary text-sm">
                            No se encontraron alumnos con "{searchTerm}"
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-3">person_off</span>
                    <p className="text-secondary font-medium mb-4">No hay alumnos registrados</p>
                    <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Agregar Primer Alumno
                    </Button>
                </div>
            )}

            <NewStudentModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                forceGroupId={groupId}
            />
        </div>
    );
};

export default RosterTab;
