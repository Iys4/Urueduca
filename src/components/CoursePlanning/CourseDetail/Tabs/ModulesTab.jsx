import React, { useState, useMemo } from 'react';
import { Button, Badge, Accordion, Dropdown, Modal, EmptyState } from '../../../Shared';
import ClassPlanCard from './ClassPlanCard';
import CreateClassModal from './CreateClassModal';
import { coursePlanService } from '../../../../services/coursePlanService';

const ModulesTab = ({ coursePlanId, onRefresh }) => {
    const [showCreateModule, setShowCreateModule] = useState(false);
    const [createClassFor, setCreateClassFor] = useState(null);
    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

    const modules = useMemo(() => coursePlanService.getModules(coursePlanId), [coursePlanId, onRefresh]);

    const handleCreateModule = () => {
        if (!moduleForm.title.trim()) return;
        coursePlanService.createModule(coursePlanId, moduleForm);
        setModuleForm({ title: '', description: '' });
        setShowCreateModule(false);
        onRefresh();
    };

    const handleCreateClass = (moduleId, data) => {
        coursePlanService.createClass(moduleId, data);
        onRefresh();
    };

    const handleDeleteModule = (moduleId) => {
        coursePlanService.deleteModule(moduleId);
        onRefresh();
    };

    if (modules.length === 0) {
        return (
            <>
                <EmptyState
                    icon="view_module"
                    title="Sin módulos"
                    description="Empezá creando el primer módulo temático de tu curso."
                    action={
                        <Button variant="primary" onClick={() => setShowCreateModule(true)}>
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Crear Módulo
                        </Button>
                    }
                />
                <CreateModuleModal
                    isOpen={showCreateModule}
                    onClose={() => { setShowCreateModule(false); setModuleForm({ title: '', description: '' }); }}
                    form={moduleForm}
                    setForm={setModuleForm}
                    onSubmit={handleCreateModule}
                />
            </>
        );
    }

    return (
        <div className="space-y-8">
            {/* Top Actions */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">{modules.length}</span> módulo{modules.length !== 1 ? 's' : ''}
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowCreateModule(true)}>
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Agregar Módulo
                </Button>
            </div>

            {/* Module Accordions */}
            {modules.map((mod, idx) => (
                <Accordion
                    key={mod.id}
                    defaultOpen={idx === 0}
                    title={
                        <span className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-primary bg-primary-container/50 px-2 py-0.5 rounded-full shrink-0">
                                {mod.order}
                            </span>
                            {mod.title}
                        </span>
                    }
                    subtitle={`${mod.totalClasses} clase${mod.totalClasses !== 1 ? 's' : ''}`}
                    badges={
                        <>
                            {mod.evaluationClasses.length > 0 && (
                                <Badge variant="warning" icon="assignment" className="text-[9px]">{mod.evaluationClasses.length} eval.</Badge>
                            )}

                            {mod.totalClasses === 0 && (
                                <Badge variant="neutral" className="text-[9px]">Vacío</Badge>
                            )}
                        </>
                    }
                    actions={
                        <Dropdown
                            items={[
                                { icon: 'edit', label: 'Editar módulo', onClick: () => {} },
                                { icon: 'content_copy', label: 'Duplicar', onClick: () => {} },
                                { separator: true },
                                { icon: 'delete', label: 'Eliminar módulo', danger: true, onClick: () => handleDeleteModule(mod.id) },
                            ]}
                        />
                    }
                >


                    {/* ─── Mandatory Classes ─── */}
                    <ClassSection
                        title="Clases Obligatorias"
                        icon="priority_high"
                        iconColor="text-primary"
                        classes={mod.mandatoryClasses}
                        moduleId={mod.id}
                        coursePlanId={coursePlanId}
                        onRefresh={onRefresh}
                    />

                    {/* ─── Optional Classes ─── */}
                    <ClassSection
                        title="Clases Opcionales"
                        icon="add_circle_outline"
                        iconColor="text-outline"
                        classes={mod.optionalClasses}
                        moduleId={mod.id}
                        coursePlanId={coursePlanId}
                        onRefresh={onRefresh}
                    />

                    {/* ─── Evaluations ─── */}
                    <ClassSection
                        title="Evaluaciones"
                        icon="assignment"
                        iconColor="text-warning"
                        classes={mod.evaluationClasses}
                        moduleId={mod.id}
                        coursePlanId={coursePlanId}
                        onRefresh={onRefresh}
                    />

                    {/* Empty module */}
                    {mod.totalClasses === 0 && (
                        <div className="text-center py-6 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[28px] text-outline mb-2 block">note_add</span>
                            Este módulo está vacío. Agregá la primera clase.
                        </div>
                    )}

                    {/* Add class button */}
                    <div className="mt-3 pt-3 border-t border-outline-variant/50">
                        <Button variant="ghost" size="sm" onClick={() => setCreateClassFor(mod.id)}>
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            Agregar Clase
                        </Button>
                    </div>
                </Accordion>
            ))}

            {/* Create Module Modal */}
            <CreateModuleModal
                isOpen={showCreateModule}
                onClose={() => { setShowCreateModule(false); setModuleForm({ title: '', description: '' }); }}
                form={moduleForm}
                setForm={setModuleForm}
                onSubmit={handleCreateModule}
            />

            {/* Create Class Modal */}
            <CreateClassModal
                isOpen={!!createClassFor}
                onClose={() => setCreateClassFor(null)}
                onCreated={(data) => {
                    handleCreateClass(createClassFor, data);
                    setCreateClassFor(null);
                }}
            />
        </div>
    );
};

/* ─── Collapsible Class Section ─── */
const ClassSection = ({ title, icon, iconColor, classes, moduleId, coursePlanId, onRefresh }) => {
    const [collapsed, setCollapsed] = useState(false);

    if (classes.length === 0) return null;

    return (
        <div className="mb-4">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full text-left flex items-center gap-1.5 mb-2 group"
            >
                <span className={`material-symbols-outlined text-[14px] text-outline transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}>
                    expand_more
                </span>
                <span className={`material-symbols-outlined text-[14px] ${iconColor}`}>{icon}</span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {title}
                </span>
                <span className="text-[11px] text-outline font-semibold bg-surface-container px-1.5 py-0.5 rounded-full leading-none">
                    {classes.length}
                </span>
            </button>
            {!collapsed && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {classes.map(cls => (
                        <ClassPlanCard
                            key={cls.id}
                            cls={cls}
                            moduleId={moduleId}
                            coursePlanId={coursePlanId}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Inline Create Module Modal ─── */
const CreateModuleModal = ({ isOpen, onClose, form, setForm, onSubmit }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Crear Nuevo Módulo"
        size="sm"
        footer={
            <>
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button variant="primary" onClick={onSubmit} disabled={!form.title.trim()}>
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Crear Módulo
                </Button>
            </>
        }
    >
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Título del módulo <span className="text-error">*</span>
                </label>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder='Ej: "Civilizaciones Precolombinas"'
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    autoFocus
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Descripción <span className="text-outline">(opcional)</span>
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descripción del bloque temático..."
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
        </div>
    </Modal>
);

export default ModulesTab;
