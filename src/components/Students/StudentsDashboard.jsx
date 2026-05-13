import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button, Badge, EmptyState } from '../Shared';
import NewStudentModal from './NewStudentModal';
import { calculateAge } from '../../utils/dateHelpers';

const StudentsDashboard = () => {
    const students = useAppStore(state => state.students);
    const courses = useAppStore(state => state.courses);
    const deleteStudent = useAppStore(state => state.deleteStudent);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCourse = filterCourse === 'all' || String(s.course_id) === String(filterCourse);
            return matchesSearch && matchesCourse;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [students, searchTerm, filterCourse]);

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar a este alumno?')) {
            await deleteStudent(id);
        }
    };

    const getCourseName = (courseId) => {
        if (!courseId) return 'Sin grupo';
        const course = courses.find(c => String(c.id) === String(courseId));
        return course ? course.name : 'Grupo no encontrado';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">Todos mis Alumnos</h1>
                    <p className="text-sm text-secondary mt-1">{students.length} alumnos registrados en total</p>
                </div>
                <Button variant="primary" onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}>
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Nuevo Alumno
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-all min-w-[200px]"
                    value={filterCourse}
                    onChange={e => setFilterCourse(e.target.value)}
                >
                    <option value="all">Todos los grupos</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="">Sin grupo asignado</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant">
                                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Alumno</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider">Grupo</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider hidden sm:table-cell">Edad</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider hidden md:table-cell">Promedio</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-outline uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-on-surface">{student.name}</p>
                                                    {student.comments && <p className="text-[11px] text-outline truncate max-w-[200px]">{student.comments}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={student.course_id ? 'neutral' : 'warning'}>
                                                {getCourseName(student.course_id)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary hidden sm:table-cell">
                                            {calculateAge(student.birthdate)} años
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${student.avg >= 6 ? 'bg-success' : 'bg-warning'}`}
                                                        style={{ width: `${(student.avg / 12) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-on-surface">{student.avg?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button 
                                                    onClick={() => handleEdit(student)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-primary/10 transition-all"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(student.id)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error/10 transition-all"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-20">
                        <EmptyState 
                            icon="person_search"
                            title="No se encontraron alumnos"
                            description={searchTerm || filterCourse !== 'all' ? "Probá con otros filtros de búsqueda." : "Comenzá agregando tu primer alumno."}
                        />
                    </div>
                )}
            </div>

            <NewStudentModal 
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}
                initialData={editingStudent}
            />
        </div>
    );
};

export default StudentsDashboard;
