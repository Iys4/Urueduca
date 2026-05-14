import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Dropdown, AvatarGroup } from '../Shared';
import { coursePlanService } from '../../services/coursePlanService';

const statusConfig = {
    active:   { label: 'Activo',    variant: 'success',  borderColor: 'border-t-tertiary' },
    draft:    { label: 'Borrador',  variant: 'warning',  borderColor: 'border-t-warning' },
    archived: { label: 'Archivado', variant: 'neutral',  borderColor: 'border-t-outline-variant' },
};

const materiaColors = {
    'Biología':   'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
    'Historia':   'bg-secondary-container text-on-secondary-container border-secondary/20',
    'Matemática': 'bg-primary-container text-on-primary-container border-primary/20',
    'Física':     'bg-error-container text-on-error-container border-error/20',
    'Química':    'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
    'Literatura': 'bg-secondary-container text-on-secondary-container border-secondary/20',
    'Geografía':  'bg-primary-container text-on-primary-container border-primary/20',
};

const materiaIcons = {
    'Biología':   'biotech',
    'Historia':   'history_edu',
    'Matemática': 'calculate',
    'Física':     'science',
    'Química':    'science',
    'Literatura': 'menu_book',
    'Geografía':  'public',
};

const CourseCard = ({ course, onDuplicate, onDelete, onShare, isSharing = false }) => {
    const navigate = useNavigate();
    const status = statusConfig[course.status] || statusConfig.active;
    const colorClass = materiaColors[course.materia] || 'bg-surface-container text-on-surface-variant border-outline-variant';
    const icon = materiaIcons[course.materia] || 'auto_stories';

    const dropdownItems = [
        { icon: 'open_in_new', label: 'Abrir curso', onClick: () => navigate(`/planning/${course.id}`) },
        { icon: 'content_copy', label: 'Duplicar', onClick: () => onDuplicate(course.id) },
        { separator: true },
        { icon: 'edit', label: 'Editar', onClick: () => navigate(`/planning/${course.id}`) },
        { icon: 'delete', label: 'Eliminar', onClick: () => onDelete(course.id), danger: true },
    ];

    return (
        <div
            className={`bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group overflow-hidden`}
            onClick={() => navigate(`/planning/${course.id}`)}
        >
            {/* Header Strip */}
            <div className={`h-2 ${colorClass.split(' ')[0]}`} />

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shrink-0 shadow-inner`}>
                        <span className="material-symbols-outlined text-[24px]">{icon}</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown items={dropdownItems} />
                    </div>
                </div>

                <div className="space-y-1 mb-4">
                    <h3 className="text-lg font-bold text-on-surface leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {course.nombre}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-outline uppercase tracking-wider">{course.materia}</span>
                        <span className="text-xs text-outline opacity-50">·</span>
                        <span className="text-xs font-semibold text-outline">{course.año}</span>
                    </div>
                </div>

                {course.descripcion && (
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 leading-relaxed min-h-[40px]">
                        {course.descripcion}
                    </p>
                )}

                <div className="flex items-center gap-3 mb-6">
                    <Badge variant={status.variant} size="sm">{status.label}</Badge>
                    {course.publishedToMarketplace && (
                        <Badge variant="tertiary" icon="forum" size="sm">En Foro</Badge>
                    )}
                    {isSharing && (
                        <Badge variant="primary" icon="sync" className="animate-pulse">Compartiendo...</Badge>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-5 border-t border-outline-variant/50">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-on-surface leading-none">{course.modulesCount}</span>
                        <span className="text-[10px] text-outline uppercase font-bold tracking-tighter mt-1">Módulos</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-on-surface leading-none">{course.classesCount}</span>
                        <span className="text-[10px] text-outline uppercase font-bold tracking-tighter mt-1">Clases</span>
                    </div>
                    <div className="ml-auto flex items-center">
                         {course.collaborators.length > 0 ? (
                            <AvatarGroup users={course.collaborators} max={2} size="xs" />
                        ) : (
                            <span className="material-symbols-outlined text-outline/30 text-[20px]">person_off</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
