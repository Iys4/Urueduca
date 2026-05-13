import React, { useState } from 'react';
import { Modal, Button } from '../Shared';
import { coursePlanService } from '../../services/coursePlanService';

const años = coursePlanService.getAvailableAños();

const materiaOptions = [
    'Matemática', 'Historia', 'Física', 'Química', 'Biología',
    'Literatura', 'Geografía', 'Filosofía', 'Idioma Español',
    'Inglés', 'Educación Ciudadana', 'Informática', 'Otra'
];

const CreateCourseModal = ({ isOpen, onClose, onCreated }) => {
    const [form, setForm] = useState({ nombre: '', año: '', materia: '', descripcion: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validate = (data) => {
        const errs = {};
        if (!data.nombre || data.nombre.trim().length < 3) errs.nombre = 'Mínimo 3 caracteres';
        if (!data.año) errs.año = 'Seleccioná un año';
        if (!data.materia) errs.materia = 'Seleccioná una materia';
        if (data.descripcion && data.descripcion.length > 500) errs.descripcion = 'Máximo 500 caracteres';
        return errs;
    };

    const handleChange = (field, value) => {
        const newForm = { ...form, [field]: value };
        setForm(newForm);
        if (touched[field]) {
            setErrors(validate(newForm));
        }
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
        setTouched({ nombre: true, año: true, materia: true, descripcion: true });

        if (Object.keys(errs).length === 0) {
            const newCourse = coursePlanService.create(form);
            onCreated(newCourse);
            setForm({ nombre: '', año: '', materia: '', descripcion: '' });
            setTouched({});
            setErrors({});
            onClose();
        }
    };

    const handleClose = () => {
        setForm({ nombre: '', año: '', materia: '', descripcion: '' });
        setTouched({});
        setErrors({});
        onClose();
    };

    const fieldClass = (field) => `
        w-full px-3 py-2.5 text-sm rounded-lg border transition-all
        bg-surface-container-lowest text-on-surface
        placeholder:text-outline
        focus:outline-none focus:ring-2
        ${touched[field] && errors[field]
            ? 'border-error focus:border-error focus:ring-error/20'
            : 'border-outline-variant focus:border-primary focus:ring-primary/20'
        }
    `;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Crear Nuevo Curso"
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!isValid}
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Crear Curso
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombre */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Nombre del curso <span className="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => handleChange('nombre', e.target.value)}
                        onBlur={() => handleBlur('nombre')}
                        placeholder='Ej: "Historia 2° año"'
                        className={fieldClass('nombre')}
                        autoFocus
                    />
                    {touched.nombre && errors.nombre && (
                        <p className="text-xs text-error mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            {errors.nombre}
                        </p>
                    )}
                </div>

                {/* Año + Materia */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                            Año educativo <span className="text-error">*</span>
                        </label>
                        <select
                            value={form.año}
                            onChange={(e) => handleChange('año', e.target.value)}
                            onBlur={() => handleBlur('año')}
                            className={fieldClass('año')}
                        >
                            <option value="">Seleccionar...</option>
                            {años.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        {touched.año && errors.año && (
                            <p className="text-xs text-error mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {errors.año}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                            Materia <span className="text-error">*</span>
                        </label>
                        <select
                            value={form.materia}
                            onChange={(e) => handleChange('materia', e.target.value)}
                            onBlur={() => handleBlur('materia')}
                            className={fieldClass('materia')}
                        >
                            <option value="">Seleccionar...</option>
                            {materiaOptions.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        {touched.materia && errors.materia && (
                            <p className="text-xs text-error mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {errors.materia}
                            </p>
                        )}
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        Descripción <span className="text-outline">(opcional)</span>
                    </label>
                    <textarea
                        value={form.descripcion}
                        onChange={(e) => handleChange('descripcion', e.target.value)}
                        onBlur={() => handleBlur('descripcion')}
                        placeholder="Describí brevemente el contenido y enfoque del curso..."
                        rows={3}
                        className={fieldClass('descripcion')}
                    />
                    <div className="flex justify-between mt-1">
                        {touched.descripcion && errors.descripcion ? (
                            <p className="text-xs text-error flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {errors.descripcion}
                            </p>
                        ) : <span />}
                        <span className={`text-[11px] ${form.descripcion.length > 450 ? 'text-warning' : 'text-outline'}`}>
                            {form.descripcion.length}/500
                        </span>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default CreateCourseModal;
