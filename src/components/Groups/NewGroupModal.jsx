import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const NewGroupModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [coursePlanId, setCoursePlanId] = useState('');
    const [schedule, setSchedule] = useState([]);
    
    const addCourse = useAppStore(state => state.addCourse);
    const coursePlans = useAppStore(state => state.coursePlans);
    const currentUser = useAuthStore(state => state.currentUser);

    const handleAddSchedule = () => {
        setSchedule([...schedule, { day: 'Lunes', startTime: '08:00', endTime: '09:30' }]);
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const handleRemoveSchedule = (index) => {
        const newSchedule = schedule.filter((_, i) => i !== index);
        setSchedule(newSchedule);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !institution) return;

        const newCourse = {
            id: Date.now(),
            userId: currentUser?.id,
            name: name,
            institution: institution,
            coursePlanId: coursePlanId || null,
            schedule: schedule,
            completedClasses: [],
            year: new Date().getFullYear(),
            active: true,
            performance: 0
        };

        await addCourse(newCourse);
        onClose();
        
        // Reset form
        setName('');
        setInstitution('');
        setCoursePlanId('');
        setSchedule([]);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Crear Nuevo Grupo"
            size="md"
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-colors rounded-xl"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-on-primary font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!name || !institution}
                    >
                        Crear Grupo
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                <div>
                    <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="groupName">
                        Nombre del Grupo
                    </label>
                    <input
                        id="groupName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. 1°A Biología"
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="institution">
                        Institución Educativa
                    </label>
                    <input
                        id="institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ej. Liceo Departamental"
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                        required
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-on-surface">Horarios Semanales</label>
                        <button type="button" onClick={handleAddSchedule} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">add</span> Añadir
                        </button>
                    </div>
                    {schedule.length === 0 ? (
                        <p className="text-xs text-secondary italic mb-2">No se han definido horarios. Opcional.</p>
                    ) : (
                        <div className="space-y-2 mb-2">
                            {schedule.map((item, index) => (
                                <div key={index} className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant p-2 rounded-lg">
                                    <select 
                                        className="bg-transparent text-sm focus:outline-none w-1/3"
                                        value={item.day} 
                                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                                    >
                                        {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input 
                                        type="time" 
                                        className="bg-transparent text-sm focus:outline-none w-1/3 text-center"
                                        value={item.startTime}
                                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                    />
                                    <span className="text-outline-variant">-</span>
                                    <input 
                                        type="time" 
                                        className="bg-transparent text-sm focus:outline-none w-1/3 text-center"
                                        value={item.endTime}
                                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveSchedule(index)} className="text-error hover:bg-error/10 p-1 rounded-full flex">
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="planSelect">
                        Planificación (opcional)
                    </label>
                    <select
                        id="planSelect"
                        value={coursePlanId}
                        onChange={(e) => setCoursePlanId(e.target.value)}
                        className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                    >
                        <option value="">Sin planificación vinculada</option>
                        {coursePlans.map(plan => (
                            <option key={plan.id} value={plan.id}>{plan.nombre} ({plan.año})</option>
                        ))}
                    </select>
                </div>
            </form>
        </Modal>
    );
};

export default NewGroupModal;
