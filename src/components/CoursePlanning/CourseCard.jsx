import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Dropdown, AvatarGroup } from '../Shared';
import { coursePlanService } from '../../services/coursePlanService';

const statusConfig = {
    active:   { label: 'Activo',    variant: 'success',  borderColor: 'border-t-tertiary' },
    draft:    { label: 'Borrador',  variant: 'warning',  borderColor: 'border-t-warning' },
    archived: { label: 'Archivado', variant: 'neutral',  borderColor: 'border-t-outline-variant' },
};

const CourseCard = ({ course, onDuplicate, onDelete, onShare }) => {
    const navigate = useNavigate();
    const status = statusConfig[course.status] || statusConfig.draft;

    const dropdownItems = [
        { icon: 'open_in_new', label: 'Abrir curso', onClick: () => navigate(`/planning/${course.id}`) },
        course.publishedToMarketplace
            ? { icon: 'forum', label: 'Ya publicado en el Foro', onClick: () => {}, disabled: true }
            : { icon: 'share', label: 'Compartir al Foro', onClick: () => onShare?.(course.id) },
        { icon: 'content_copy', label: 'Duplicar', onClick: () => onDuplicate(course.id) },
        { separator: true },
        { icon: 'edit', label: 'Editar', onClick: () => navigate(`/planning/${course.id}`) },
        { icon: 'delete', label: 'Eliminar', onClick: () => onDelete(course.id), danger: true },
    ];


    return (
        <div
            className={`bg-surface-container-lowest rounded-xl border border-outline-variant border-t-4 ${status.borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer group`}
            onClick={() => navigate(`/planning/${course.id}`)}
        >
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">
                        {course.nombre}
                    </h3>
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown items={dropdownItems} />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="primary">{course.materia}</Badge>
                    <span className="text-xs text-outline font-medium">{course.año}</span>
                    <span className="text-xs text-outline">·</span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {course.publishedToMarketplace && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-tertiary bg-tertiary-container px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined text-[12px]">forum</span>
                            Foro
                        </span>
                    )}
                </div>

                {course.descripcion && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
                        {course.descripcion}
                    </p>
                )}
            </div>

            {/* Stats */}
            <div className="px-5 py-3 flex items-center gap-4 text-xs text-on-surface-variant">
                <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-outline">view_module</span>
                    <span className="font-semibold text-on-surface">{course.modulesCount}</span> módulos
                </span>
                <span className="inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-outline">class</span>
                    <span className="font-semibold text-on-surface">{course.classesCount}</span> clases
                </span>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 pt-1 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {course.collaborators.length > 0 ? (
                        <AvatarGroup users={course.collaborators} max={3} size="xs" />
                    ) : (
                        <span className="text-[11px] text-outline">Sin colaboradores</span>
                    )}
                </div>
                <span className="text-[11px] text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    {course.updatedAtRelative}
                </span>
            </div>
        </div>
    );
};

export default CourseCard;
