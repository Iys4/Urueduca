import React, { useState } from 'react';
import { Modal, Button } from '../Shared';
import { useAppStore } from '../../store/useAppStore';

const EVENT_TYPES = [
    { value: 'reunion', label: 'Reunión', icon: 'groups', color: '#6750a4' },
    { value: 'recordatorio', label: 'Recordatorio', icon: 'notifications', color: '#d97706' },
    { value: 'coordinacion', label: 'Coordinación', icon: 'forum', color: '#0891b2' },
    { value: 'personal', label: 'Personal', icon: 'person', color: '#059669' },
];

const CreateEventModal = ({ isOpen, onClose, defaultDate }) => {
    const addCalendarEvent = useAppStore(state => state.addCalendarEvent);
    const [form, setForm] = useState({
        title: '',
        date: defaultDate ? defaultDate.toISOString().split('T')[0] : '',
        startTime: '',
        endTime: '',
        description: '',
        type: 'reunion',
        color: '#6750a4'
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!form.title || !form.date) return;
        
        await addCalendarEvent({
            ...form,
            id: Date.now()
        });
        
        setForm({ title: '', date: '', startTime: '', endTime: '', description: '', type: 'reunion', color: '#6750a4' });
        onClose();
    };


    const handleTypeSelect = (typeVal) => {
        const t = EVENT_TYPES.find(x => x.value === typeVal);
        setForm(prev => ({ ...prev, type: typeVal, color: t.color }));
    };

    const fieldClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agregar Evento Manual"
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!form.title || !form.date}>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Guardar Evento
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type selector */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Tipo de evento</label>
                    <div className="grid grid-cols-2 gap-2">
                        {EVENT_TYPES.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => handleTypeSelect(t.value)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                                    form.type === t.value 
                                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]" style={{ color: t.color }}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Título <span className="text-error">*</span></label>
                    <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} className={fieldClass} placeholder="Ej: Reunión de área" autoFocus />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Fecha <span className="text-error">*</span></label>
                        <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} className={fieldClass} />
                    </div>
                    <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Inicio (opcional)</label>
                        <input type="time" value={form.startTime} onChange={e => handleChange('startTime', e.target.value)} className={fieldClass} />
                    </div>
                    <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Fin (opcional)</label>
                        <input type="time" value={form.endTime} onChange={e => handleChange('endTime', e.target.value)} className={fieldClass} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Descripción <span className="text-outline">(opcional)</span></label>
                    <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} className={fieldClass} placeholder="Detalles del evento..." />
                </div>
            </form>
        </Modal>
    );
};

export default CreateEventModal;
