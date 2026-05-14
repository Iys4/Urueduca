import React, { useState, useEffect, useMemo } from 'react';
import { Button, SearchInput, FilterChips } from '../Shared';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const NewStudentModal = ({ isOpen, onClose, initialData = null, forceGroupId = null }) => {
    const currentUser = useAuthStore(state => state.currentUser);
    const courses = useAppStore(state => state.courses);
    const globalStudents = useAppStore(state => state.students);
    const addStudent = useAppStore(state => state.addStudent);
    const updateStudent = useAppStore(state => state.updateStudent);

    const [mode, setMode] = useState('new'); // 'new' | 'existing'
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [sortBy, setSortBy] = useState('name'); // 'name' | 'age'
    
    // New Student Form
    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        course_id: '',
        comments: '',
    });
    const [errors, setErrors] = useState({});

    // Existing Student Search
    const [searchExisting, setSearchExisting] = useState('');
    const [filterAño, setFilterAño] = useState(null);

    const calculateAge = (birthdate) => {
        if (!birthdate) return null;
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (initialData) {
            setMode('new');
            setFormData({
                name: initialData.name || '',
                birthdate: initialData.birthdate || '',
                course_id: initialData.course_id || '',
                comments: initialData.comments || '',
            });
        } else {
            setFormData({
                name: '',
                birthdate: '',
                course_id: forceGroupId || '',
                comments: '',
            });
        }
        setErrors({});
        setSearchExisting('');
        setFilterAño(null);
        setSelectedStudents([]);
    }, [initialData, forceGroupId, isOpen]);

    const añoFilters = useMemo(() => {
        const años = [...new Set(courses.map(c => c.año).filter(Boolean))].sort();
        return años.map(a => ({ label: a, value: a }));
    }, [courses]);

    const filteredExisting = useMemo(() => {
        let result = globalStudents.filter(s => {
            // No mostrar los que ya están en el grupo actual
            if (forceGroupId && s.course_id === parseInt(forceGroupId)) return false;
            
            const matchName = s.name.toLowerCase().includes(searchExisting.toLowerCase());
            
            let matchAño = true;
            if (filterAño) {
                const sCourse = courses.find(c => c.id === s.course_id);
                matchAño = sCourse && sCourse.año === filterAño;
            }
            
            return matchName && matchAño;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'age') {
                const ageA = calculateAge(a.birthdate) || 0;
                const ageB = calculateAge(b.birthdate) || 0;
                return ageB - ageA; // Descending age
            }
            return 0;
        });

        return result;
    }, [globalStudents, searchExisting, filterAño, forceGroupId, courses, sortBy]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitNew = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const studentData = {
            ...formData,
            id: initialData?.id || Date.now(),
            userId: currentUser.id,
            course_id: formData.course_id ? parseInt(formData.course_id) : null,
            avg: initialData?.avg || 0,
            updatedAt: new Date().toISOString()
        };

        if (initialData) {
            await updateStudent(initialData.id, studentData);
        } else {
            await addStudent(studentData);
        }
        onClose();
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const handleAddSelected = async () => {
        if (selectedStudents.length === 0) return;
        
        for (const studentId of selectedStudents) {
            const student = globalStudents.find(s => s.id === studentId);
            if (student) {
                await updateStudent(student.id, { ...student, course_id: parseInt(forceGroupId) });
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-outline-variant flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-on-surface">
                            {initialData ? 'Editar Alumno' : 'Agregar Alumno'}
                        </h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {!initialData && forceGroupId && (
                        <div className="flex bg-surface-container p-1 rounded-xl">
                            <button
                                onClick={() => setMode('new')}
                                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${mode === 'new' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-outline hover:text-on-surface'}`}
                            >
                                Nuevo Alumno
                            </button>
                            <button
                                onClick={() => setMode('existing')}
                                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${mode === 'existing' ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-outline hover:text-on-surface'}`}
                            >
                                Alumno Existente
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-y-auto p-6">
                    {mode === 'new' ? (
                        <form id="new-student-form" onSubmit={handleSubmitNew} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Nombre Completo *</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm focus:outline-none transition-all ${
                                        errors.name ? 'border-error ring-1 ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10'
                                    }`}
                                    placeholder="Ej: Juan Pérez"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                {errors.name && <p className="text-[10px] text-error font-medium px-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    className={`w-full px-4 py-2.5 bg-surface border rounded-xl text-sm focus:outline-none transition-all ${
                                        errors.birthdate ? 'border-error ring-1 ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10'
                                    }`}
                                    value={formData.birthdate || ''}
                                    onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
                                />
                                {errors.birthdate && <p className="text-[10px] text-error font-medium px-1">{errors.birthdate}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Grupo</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                                    value={formData.course_id}
                                    disabled={!!forceGroupId}
                                    onChange={e => setFormData({ ...formData, course_id: e.target.value })}
                                >
                                    <option value="">Sin grupo</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-outline uppercase tracking-wider px-1">Comentarios</label>
                                <textarea
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                    placeholder="Notas adicionales sobre el alumno..."
                                    value={formData.comments}
                                    onChange={e => setFormData({ ...formData, comments: e.target.value })}
                                />
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <SearchInput
                                value={searchExisting}
                                onChange={setSearchExisting}
                                placeholder="Buscar por nombre..."
                            />
                            
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                {añoFilters.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Año:</span>
                                        <FilterChips filters={añoFilters} activeFilter={filterAño} onChange={setFilterAño} />
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-lg ml-auto">
                                    <button 
                                        onClick={() => setSortBy('name')}
                                        className={`px-2 py-1 text-[10px] font-bold rounded ${sortBy === 'name' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline'}`}
                                    >Nombre</button>
                                    <button 
                                        onClick={() => setSortBy('age')}
                                        className={`px-2 py-1 text-[10px] font-bold rounded ${sortBy === 'age' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline'}`}
                                    >Edad</button>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
                                {filteredExisting.length > 0 ? (
                                    filteredExisting.map(student => {
                                        const sCourse = courses.find(c => c.id === student.course_id);
                                        const age = calculateAge(student.birthdate);
                                        const isSelected = selectedStudents.includes(student.id);
                                        
                                        return (
                                            <div 
                                                key={student.id} 
                                                onClick={() => toggleStudentSelection(student.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-primary/5 border-primary ring-1 ring-primary/20' 
                                                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                                        isSelected ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container'
                                                    }`}>
                                                        {isSelected ? (
                                                            <span className="material-symbols-outlined text-[18px]">check</span>
                                                        ) : (
                                                            student.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-on-surface leading-tight">{student.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-[11px] text-outline">{sCourse ? `${sCourse.name} (${sCourse.año})` : 'Sin grupo'}</p>
                                                            {age && <span className="text-[11px] text-outline">·</span>}
                                                            {age && <p className="text-[11px] text-primary font-bold">{age} años</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                                                    isSelected ? 'bg-primary border-primary' : 'border-outline-variant bg-surface'
                                                }`}>
                                                    {isSelected && <span className="material-symbols-outlined text-[14px] text-on-primary">check</span>}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-center text-outline py-4">No se encontraron alumnos.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2 border-t border-outline-variant mt-auto bg-surface-container-lowest">
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
                        {mode === 'new' ? (
                            <Button type="submit" form="new-student-form" variant="primary" className="flex-1">
                                {initialData ? 'Guardar Cambios' : 'Crear Alumno'}
                            </Button>
                        ) : (
                            <Button 
                                variant="primary" 
                                className="flex-1" 
                                disabled={selectedStudents.length === 0}
                                onClick={handleAddSelected}
                            >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                {selectedStudents.length > 0 
                                    ? `Agregar ${selectedStudents.length} alumno${selectedStudents.length !== 1 ? 's' : ''}`
                                    : 'Seleccionar Alumnos'
                                }
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewStudentModal;
