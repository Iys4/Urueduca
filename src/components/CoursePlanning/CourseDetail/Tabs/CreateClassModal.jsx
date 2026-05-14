import React, { useState } from 'react';
import { Modal, Button, FileUploader } from '../../../Shared';

const modalidadOptions = [
    { value: 'escrita', label: 'Escrita' },
    { value: 'oral', label: 'Oral' },
    { value: 'domiciliaria', label: 'Domiciliaria' },
    { value: 'proyecto', label: 'Proyecto' },
    { value: 'presentacion', label: 'Presentación' },
    { value: 'presencial', label: 'Presencial' },
];

const typeOptions = [
    { value: 'mandatory', label: 'Obligatoria', icon: 'priority_high' },
    { value: 'optional', label: 'Opcional', icon: 'add_circle_outline' },
    { value: 'evaluation', label: 'Evaluación', icon: 'assignment' },
];

const CreateClassModal = ({ isOpen, onClose, onCreated, defaultType = 'mandatory' }) => {
    const initialForm = {
        title: '', shortDescription: '', type: defaultType, notes: '', attachedDocuments: [],
        evaluationData: { ponderacion: 0, modalidad: 'escrita', criterios: '' },
    };
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validate = (data) => {
        const errs = {};
        if (!data.title || data.title.trim().length < 2) errs.title = 'Mínimo 2 caracteres';
        return errs;
    };

    const handleChange = (field, value) => {
        const newForm = { ...form, [field]: value };
        setForm(newForm);
        if (touched[field]) setErrors(validate(newForm));
    };

    const handleEvalChange = (field, value) => {
        setForm(prev => ({ ...prev, evaluationData: { ...prev.evaluationData, [field]: value } }));
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        setErrors(validate(form));
    };

    const isValid = Object.keys(validate(form)).length === 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate(form);
        setErrors(errs);
        setTouched({ title: true });
        if (Object.keys(errs).length === 0) {
            onCreated(form);
            setForm(initialForm);
            setTouched({});
            setErrors({});
            onClose();
        }
    };

    const handleClose = () => {
        setForm(initialForm);
        setTouched({});
        setErrors({});
        onClose();
    };

    const fieldClass = (field) => `
        w-full px-3 py-2.5 text-sm rounded-lg border transition-all
        bg-surface-container-lowest text-on-surface placeholder:text-outline
        focus:outline-none focus:ring-2
        ${touched[field] && errors[field]
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-outline-variant focus:border-primary focus:ring-primary/20'
        }
    `;

    const isEval = form.type === 'evaluation';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Agregar Clase"
            size={isEval ? 'lg' : 'md'}
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Agregar Clase
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type Toggle — 3 options */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                        Tipo de clase
                    </label>
                    <div className="flex gap-2">
                        {typeOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleChange('type', opt.value)}
                                className={`
                                    flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold
                                    border transition-all duration-150
                                    ${form.type === opt.value
                                        ? opt.value === 'evaluation'
                                            ? 'bg-warning text-on-primary border-warning shadow-sm'
                                            : 'bg-primary text-on-primary border-primary shadow-sm'
                                        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
                                    }
                                `}
                            >
                                <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Título <span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        onBlur={() => handleBlur('title')}
                        placeholder={isEval ? 'Ej: "Escrito: Funciones"' : 'Ej: "Introducción al tema"'}
                        className={fieldClass('title')}
                        autoFocus
                    />
                    {touched.title && errors.title && (
                        <p className="text-xs text-error mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Descripción <span className="text-outline">(opcional)</span>
                    </label>
                    <textarea
                        value={form.shortDescription}
                        onChange={(e) => handleChange('shortDescription', e.target.value)}
                        placeholder="Breve descripción del contenido..."
                        rows={2}
                        className={fieldClass('shortDescription')}
                    />
                </div>

                {/* ─── Evaluation-specific fields ─── */}
                {isEval && (
                    <div className="bg-warning-container/15 border border-warning/20 rounded-xl p-4 space-y-4">
                        <h3 className="text-xs font-bold text-warning uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">assignment</span>
                            Datos de Evaluación
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Ponderación (%)</label>
                                <input
                                    type="number"
                                    min="0" max="100"
                                    value={form.evaluationData.ponderacion}
                                    onChange={(e) => handleEvalChange('ponderacion', parseInt(e.target.value) || 0)}
                                    className={fieldClass('ponderacion')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Modalidad</label>
                            <div className="flex flex-wrap gap-2">
                                {modalidadOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleEvalChange('modalidad', opt.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                            form.evaluationData.modalidad === opt.value
                                                ? 'bg-warning text-on-primary border-warning'
                                                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Criterios de evaluación</label>
                            <textarea
                                value={form.evaluationData.criterios}
                                onChange={(e) => handleEvalChange('criterios', e.target.value)}
                                placeholder="Ej: Resolución correcta (50%), Procedimiento (30%), Presentación (20%)"
                                rows={2}
                                className={fieldClass('criterios')}
                            />
                        </div>
                    </div>
                )}

                {/* Files */}
                <FileUploader
                    files={form.attachedDocuments}
                    onChange={(files) => handleChange('attachedDocuments', files)}
                    label="Documentos adjuntos"
                    maxFiles={5}
                />

                {/* Notes */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Notas para el docente <span className="text-outline">(opcional)</span>
                    </label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Notas internas, recordatorios..."
                        rows={2}
                        className={fieldClass('notes')}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default CreateClassModal;
