import React, { useState } from 'react';
import Modal from '../Shared/Modal';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

const NewGroupModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [institution, setInstitution] = useState('');
    const [coursePlanId, setCoursePlanId] = useState('');
    
    const addCourse = useAppStore(state => state.addCourse);
    const coursePlans = useAppStore(state => state.coursePlans);
    const currentUser = useAuthStore(state => state.currentUser);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !institution) return;

        const newCourse = {
            id: Date.now(),
            userId: currentUser?.id,
            name: name,
            institution: institution,
            coursePlanId: coursePlanId || null,
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
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Crear Nuevo Grupo"
            size="sm"
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
