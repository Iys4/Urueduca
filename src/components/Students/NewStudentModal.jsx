import React, { useState, useEffect } from 'react';
import { Button } from '../Shared';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const NewStudentModal = ({ isOpen, onClose, initialData = null, forceGroupId = null }) => {
    const currentUser = useAuthStore(state => state.currentUser);
    const courses = useAppStore(state => state.courses);
    const addStudent = useAppStore(state => state.addStudent);
    const updateStudent = useAppStore(state => state.updateStudent);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        birthdate: '',
        course_id: '',
        comments: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                age: initialData.age || '',
                birthdate: initialData.birthdate || '',
                course_id: initialData.course_id || '',
                comments: initialData.comments || '',
            });
        } else {
            setFormData({
                name: '',
                age: '',
                birthdate: '',
                course_id: forceGroupId || '',
                comments: '',
            });
        }
        setErrors({});
    }, [initialData, forceGroupId, isOpen]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const studentData = {
            ...formData,
            id: initialData?.id || Date.now(),
            userId: currentUser.id,
            age: null, // Legacy, not used anymore
            course_id: formData.course_id ? parseInt(formData.course_id) : null,
            avg: initialData?.avg || 0, // Default for new students
            updatedAt: new Date().toISOString()
        };

        if (initialData) {
            await updateStudent(initialData.id, studentData);
        } else {
            await addStudent(studentData);
        }
        
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                    <h2 className="text-xl font-bold text-on-surface">
                        {initialData ? 'Editar Alumno' : 'Nuevo Alumno'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
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

                    {/* Group */}
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

                    {/* Comments */}
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

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {initialData ? 'Guardar Cambios' : 'Crear Alumno'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default NewStudentModal;
