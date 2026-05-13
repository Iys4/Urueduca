import React from 'react';
import { Badge } from '../../../Shared';
import { coursePlanService } from '../../../../services/coursePlanService';

const ProgramTab = ({ course }) => {
    const modules = coursePlanService.getModules(course.id);

    return (
        <div className="space-y-6">
            {/* Description */}
            {course.descripcion && (
                <div className="bg-surface-container/40 rounded-xl p-5">
                    <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Descripción del Curso</h3>
                    <p className="text-sm text-on-surface leading-relaxed">{course.descripcion}</p>
                </div>
            )}

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-primary-container/30 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[28px] text-primary mb-1">view_module</span>
                    <p className="text-2xl font-bold text-on-surface">{course.modulesCount}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">Módulos</p>
                </div>
                <div className="bg-tertiary-container/30 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[28px] text-tertiary mb-1">class</span>
                    <p className="text-2xl font-bold text-on-surface">{course.classesCount}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">Clases totales</p>
                </div>
                <div className="bg-warning-container/30 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[28px] text-warning mb-1">priority_high</span>
                    <p className="text-2xl font-bold text-on-surface">{course.mandatoryCount}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">Obligatorias</p>
                </div>
                <div className="bg-surface-container rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[28px] text-outline mb-1">group</span>
                    <p className="text-2xl font-bold text-on-surface">{course.collaboratorsCount}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium">Colaboradores</p>
                </div>
            </div>

            {/* Module Timeline */}
            <div>
                <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">Estructura del Programa</h3>
                {modules.length > 0 ? (
                    <div className="relative pl-8">
                        {/* Timeline line */}
                        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-outline-variant rounded-full" />

                        <div className="space-y-4">
                            {modules.map((mod, idx) => (
                                <div key={mod.id} className="relative">
                                    {/* Timeline dot */}
                                    <div className={`absolute -left-5 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center
                                        ${mod.totalClasses > 0 && mod.progressPercent === 100
                                            ? 'border-tertiary bg-tertiary'
                                            : mod.totalClasses > 0
                                                ? 'border-primary bg-primary-container'
                                                : 'border-outline-variant bg-surface-container'
                                        }`}
                                    >
                                        {mod.progressPercent === 100 && mod.totalClasses > 0 && (
                                            <span className="material-symbols-outlined text-[10px] text-on-tertiary">check</span>
                                        )}
                                    </div>

                                    <div className="bg-surface-container/40 rounded-xl p-4 hover:bg-surface-container/60 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[11px] font-bold text-primary bg-primary-container/50 px-2 py-0.5 rounded-full">
                                                        Módulo {mod.order}
                                                    </span>
                                                    {mod.hasIncomplete && (
                                                        <Badge variant="warning" icon="warning" className="text-[10px]">Incompleto</Badge>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-bold text-on-surface">{mod.title}</h4>
                                                {mod.description && (
                                                    <p className="text-xs text-on-surface-variant mt-0.5">{mod.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-bold text-on-surface">{mod.totalClasses}</p>
                                                <p className="text-[10px] text-outline">clases</p>
                                            </div>
                                        </div>
                                        {mod.totalClasses > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-[11px] mb-1">
                                                    <span className="text-on-surface-variant">{mod.completedClasses}/{mod.totalClasses} completas</span>
                                                    <span className="font-bold text-primary">{mod.progressPercent}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            mod.progressPercent === 100 ? 'bg-tertiary' : 'bg-primary'
                                                        }`}
                                                        style={{ width: `${mod.progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined text-[32px] text-outline mb-2 block">view_module</span>
                        No hay módulos creados aún. Andá a la pestaña "Módulos" para empezar.
                    </div>
                )}
            </div>

            {/* ANEP Document Link */}
            {course.curriculumDocument && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary-container/20 border border-primary/20">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px] text-primary">verified</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface">{course.curriculumDocument.fileName}</p>
                        <p className="text-xs text-on-surface-variant">
                            Versión {course.curriculumDocument.version} · {course.curriculumDocument.size}
                        </p>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-primary">open_in_new</span>
                </div>
            )}
        </div>
    );
};

export default ProgramTab;
