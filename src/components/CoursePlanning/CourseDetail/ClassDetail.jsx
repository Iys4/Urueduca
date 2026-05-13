import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, FileUploader, Dropdown } from '../../Shared';
import { coursePlanService } from '../../../services/coursePlanService';

const typeConfig = {
    mandatory:  { label: 'Obligatoria', variant: 'primary',  icon: 'priority_high', color: 'text-primary', bg: 'bg-primary-container/30' },
    optional:   { label: 'Opcional',    variant: 'neutral',  icon: 'add_circle_outline', color: 'text-outline', bg: 'bg-surface-container' },
    evaluation: { label: 'Evaluación',  variant: 'warning',  icon: 'assignment',  color: 'text-warning', bg: 'bg-warning-container/30' },
};

const modalidadOptions = [
    { value: 'escrita', label: 'Escrita' },
    { value: 'oral', label: 'Oral' },
    { value: 'domiciliaria', label: 'Domiciliaria' },
    { value: 'proyecto', label: 'Proyecto' },
    { value: 'presentacion', label: 'Presentación' },
    { value: 'presencial', label: 'Presencial' },
];

const fileTypeIcons = {
    pdf:   { icon: 'picture_as_pdf', color: 'text-error' },
    doc:   { icon: 'description',    color: 'text-primary' },
    image: { icon: 'image',          color: 'text-tertiary' },
    other: { icon: 'attach_file',    color: 'text-outline' },
};

const fieldClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

const ClassDetail = () => {
    const { id: coursePlanId, moduleId, classId } = useParams();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const cls = useMemo(() => coursePlanService.getClassById(coursePlanId, moduleId, classId), [coursePlanId, moduleId, classId, refreshKey]);

    const [form, setForm] = useState(null);

    const startEditing = () => {
        setForm({
            title: cls.title,
            shortDescription: cls.shortDescription || '',
            type: cls.type,
            objectives: cls.objectives || '',
            notes: cls.notes || '',
            tags: (cls.tags || []).join(', '),
            attachedDocuments: cls.attachedDocuments || [],
            evaluationData: cls.evaluationData || { fecha: '', ponderacion: 0, modalidad: 'escrita', criterios: '' },
        });
        setEditing(true);
    };

    const handleSave = () => {
        const tagsList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
        coursePlanService.updateClass(moduleId, classId, {
            title: form.title,
            shortDescription: form.shortDescription,
            type: form.type,
            objectives: form.objectives,
            notes: form.notes,
            tags: tagsList,
            attachedDocuments: form.attachedDocuments,
            ...(form.type === 'evaluation' ? { evaluationData: form.evaluationData } : {}),
        });
        setEditing(false);
        setRefreshKey(k => k + 1);
    };

    const handleCancel = () => {
        setForm(null);
        setEditing(false);
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleEvalChange = (field, value) => {
        setForm(prev => ({ ...prev, evaluationData: { ...prev.evaluationData, [field]: value } }));
    };

    if (!cls) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-8 w-48" />
                <div className="skeleton h-32 w-full rounded-xl" />
                <div className="skeleton h-64 w-full rounded-xl" />
            </div>
        );
    }

    const tc = typeConfig[cls.type] || typeConfig.mandatory;
    const modules = coursePlanService.getModulesForMoveTarget(coursePlanId, moduleId);

    const formatEvalDate = (dateStr) => {
        if (!dateStr) return 'Sin definir';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Fecha inválida';
        return d.toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-sm text-on-surface-variant flex-wrap">
                <button onClick={() => navigate('/planning')} className="hover:text-primary transition-colors font-medium">Mis Cursos</button>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <button onClick={() => navigate(`/planning/${coursePlanId}/modules`)} className="hover:text-primary transition-colors font-medium">{cls.courseName}</button>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-on-surface font-semibold">Módulo {cls.moduleOrder}: {cls.moduleTitle}</span>
            </div>

            {/* Header */}
            <header className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <input type="text" value={form.title} onChange={e => handleChange('title', e.target.value)} className={`${fieldClass} text-xl font-bold mb-2`} autoFocus />
                        ) : (
                            <h1 className="text-xl font-bold text-on-surface mb-2">{cls.title}</h1>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={tc.variant} icon={tc.icon}>{tc.label}</Badge>
                            <span className="text-xs text-on-surface-variant">
                                en <span className="font-semibold">{cls.courseName}</span> · {cls.courseMateria} · {cls.courseAño}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-outline">
                            <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">person</span>
                                {cls.ownerName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                Editado {coursePlanService.relativeTime(cls.updatedAt)}
                            </span>
                            {cls.createdAt && (
                                <span className="inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                    Creado {cls.createdAt}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Visible Actions */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {editing ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleCancel}>Cancelar</Button>
                                <Button variant="primary" size="sm" onClick={handleSave}>
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                    Guardar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="primary" size="sm" onClick={startEditing}>
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                    Editar clase
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                    coursePlanService.createClass(moduleId, { ...cls, title: `${cls.title} (copia)` });
                                    setRefreshKey(k => k + 1);
                                }}>
                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                    Duplicar
                                </Button>
                                {modules.length > 0 && (
                                    <Dropdown
                                        trigger={<span className="flex items-center gap-1 text-sm font-semibold"><span className="material-symbols-outlined text-[16px]">drive_file_move</span>Mover</span>}
                                        items={modules.map(m => ({
                                            icon: 'folder',
                                            label: `Módulo ${m.order}: ${m.title}`,
                                            onClick: () => {
                                                coursePlanService.moveClass(moduleId, classId, m.id);
                                                navigate(`/planning/${coursePlanId}/modules`);
                                            }
                                        }))}
                                    />
                                )}
                                <Button variant="ghost" size="sm" className="text-error hover:bg-error-container/40" onClick={() => {
                                    coursePlanService.deleteClass(moduleId, classId);
                                    navigate(`/planning/${coursePlanId}/modules`);
                                }}>
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                    Eliminar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-5">
                    {/* General Info */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                        <h2 className="text-xs font-bold text-outline uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            Información General
                        </h2>

                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Descripción</label>
                                    <textarea value={form.shortDescription} onChange={e => handleChange('shortDescription', e.target.value)} rows={3} className={fieldClass} placeholder="Descripción detallada de la clase..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Objetivos</label>
                                    <textarea value={form.objectives} onChange={e => handleChange('objectives', e.target.value)} rows={3} className={fieldClass} placeholder="Objetivos de aprendizaje..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Tipo de clase</label>
                                    <div className="flex gap-2">
                                        {Object.entries(typeConfig).map(([key, cfg]) => (
                                            <button key={key} type="button" onClick={() => handleChange('type', key)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${form.type === key ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}>
                                                <span className="material-symbols-outlined text-[16px]">{cfg.icon}</span>
                                                {cfg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cls.shortDescription ? (
                                    <div>
                                        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Descripción</h3>
                                        <p className="text-sm text-on-surface leading-relaxed">{cls.shortDescription}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-outline italic">Sin descripción</p>
                                )}
                                {cls.objectives && (
                                    <div>
                                        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Objetivos</h3>
                                        <p className="text-sm text-on-surface leading-relaxed">{cls.objectives}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Evaluation Data (only for evaluation type) */}
                    {(cls.type === 'evaluation' || (editing && form?.type === 'evaluation')) && (
                        <section className="bg-warning-container/15 border border-warning/20 rounded-xl shadow-sm p-6">
                            <h2 className="text-xs font-bold text-warning uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px]">assignment</span>
                                Datos de Evaluación
                            </h2>
                            {editing ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Fecha</label>
                                        <input type="date" value={form.evaluationData?.fecha || ''} onChange={e => handleEvalChange('fecha', e.target.value)} className={fieldClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Ponderación (%)</label>
                                        <input type="number" min="0" max="100" value={form.evaluationData?.ponderacion || 0} onChange={e => handleEvalChange('ponderacion', parseInt(e.target.value) || 0)} className={fieldClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Modalidad</label>
                                        <select value={form.evaluationData?.modalidad || 'escrita'} onChange={e => handleEvalChange('modalidad', e.target.value)} className={fieldClass}>
                                            {modalidadOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Criterios de evaluación</label>
                                        <textarea value={form.evaluationData?.criterios || ''} onChange={e => handleEvalChange('criterios', e.target.value)} rows={2} className={fieldClass} placeholder="Criterios de evaluación..." />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">Fecha</p>
                                        <p className="text-sm font-semibold text-on-surface">{formatEvalDate(cls.evaluationData?.fecha)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">Ponderación</p>
                                        <p className="text-sm font-bold text-warning">{cls.evaluationData?.ponderacion || 0}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">Modalidad</p>
                                        <p className="text-sm font-semibold text-on-surface capitalize">{cls.evaluationData?.modalidad || '-'}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-4">
                                        <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">Criterios</p>
                                        <p className="text-sm text-on-surface">{cls.evaluationData?.criterios || 'Sin definir'}</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Resources */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                        <h2 className="text-xs font-bold text-outline uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">folder</span>
                            Recursos Adjuntos
                        </h2>
                        {editing ? (
                            <FileUploader files={form.attachedDocuments} onChange={files => handleChange('attachedDocuments', files)} label="" maxFiles={10} />
                        ) : cls.attachedDocuments.length > 0 ? (
                            <div className="space-y-2">
                                {cls.attachedDocuments.map((doc, idx) => {
                                    const ft = fileTypeIcons[doc.type] || fileTypeIcons.other;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container/30 hover:bg-surface-container/50 transition-colors">
                                            <div className={`w-10 h-10 rounded-lg ${tc.bg} flex items-center justify-center`}>
                                                <span className={`material-symbols-outlined text-[22px] ${ft.color}`}>{ft.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-on-surface truncate">{doc.name}</p>
                                                <p className="text-[11px] text-outline">{doc.size}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <span className="material-symbols-outlined text-[16px]">download</span>
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-outline italic text-center py-6">Sin recursos adjuntos</p>
                        )}
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-5">
                    {/* Notes */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-5">
                        <h2 className="text-xs font-bold text-outline uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">sticky_note_2</span>
                            Notas Docentes
                        </h2>
                        {editing ? (
                            <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={4} className={fieldClass} placeholder="Notas internas..." />
                        ) : cls.notes ? (
                            <div className="bg-warning-container/15 rounded-lg p-3">
                                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{cls.notes}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-outline italic">Sin notas</p>
                        )}
                    </section>

                    {/* Tags */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-5">
                        <h2 className="text-xs font-bold text-outline uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">label</span>
                            Etiquetas
                        </h2>
                        {editing ? (
                            <input type="text" value={form.tags} onChange={e => handleChange('tags', e.target.value)} className={fieldClass} placeholder="Separar con comas: arte, taller, evaluación" />
                        ) : (cls.tags && cls.tags.length > 0) ? (
                            <div className="flex flex-wrap gap-1.5">
                                {cls.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary-container/40 text-on-primary-container">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-outline italic">Sin etiquetas</p>
                        )}
                    </section>

                    {/* Metadata */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-5">
                        <h2 className="text-xs font-bold text-outline uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            Metadatos
                        </h2>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Creación</span>
                                <span className="font-semibold text-on-surface">{cls.createdAt || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Última edición</span>
                                <span className="font-semibold text-on-surface">{cls.updatedAt}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Módulo</span>
                                <span className="font-semibold text-on-surface">{cls.moduleTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Tipo</span>
                                <Badge variant={tc.variant} className="text-[9px]">{tc.label}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-on-surface-variant">Adjuntos</span>
                                <span className="font-semibold text-on-surface">{cls.attachedDocuments.length}</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ClassDetail;
