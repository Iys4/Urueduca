import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { TabsNav, Button, Badge, AvatarGroup, Dropdown } from '../../Shared';
import { coursePlanService } from '../../../services/coursePlanService';
import ProgramTab from './Tabs/ProgramTab';
import ModulesTab from './Tabs/ModulesTab';
import GlobalClassesTab from './Tabs/GlobalClassesTab';
import AnepDocumentTab from './Tabs/AnepDocumentTab';
import CollaboratorsTab from './Tabs/CollaboratorsTab';
import ShareCourseModal from './ShareCourseModal';
import ClassDetail from './ClassDetail';

const statusConfig = {
    active:   { label: 'Activo',    variant: 'success' },
    draft:    { label: 'Borrador',  variant: 'warning' },
    archived: { label: 'Archivado', variant: 'neutral' },
};

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);

    const course = useMemo(() => coursePlanService.getById(id), [id, refreshKey]);
    const refresh = () => setRefreshKey(k => k + 1);

    if (!course) {
        return (
            <div className="space-y-4">
                <div className="skeleton h-28 w-full rounded-xl" />
                <div className="skeleton h-10 w-96" />
                <div className="skeleton h-64 w-full rounded-xl" />
            </div>
        );
    }

    const status = statusConfig[course.status] || statusConfig.draft;
    const globalClassesCount = course.globalClasses?.length || 0;

    const tabs = [
        { label: 'Programa',          path: '',                icon: 'description' },
        { label: 'Módulos',           path: 'modules',         icon: 'view_module',      badge: course.modulesCount },
        { label: 'Clases Opcionales', path: 'global-classes',  icon: 'library_books',    badge: globalClassesCount > 0 ? globalClassesCount : null },
        { label: 'Documento ANEP',    path: 'anep',            icon: 'verified',         badge: course.curriculumDocument ? null : '!' },
        { label: 'Colaboradores',     path: 'collaborators',   icon: 'group',            badge: course.collaboratorsCount > 0 ? course.collaboratorsCount : null },
    ];

    const moreOptions = [
        { icon: 'edit', label: 'Editar curso', onClick: () => {} },
        { icon: 'content_copy', label: 'Duplicar curso', onClick: () => { coursePlanService.duplicate(id); navigate('/planning'); } },
        { icon: 'download', label: 'Exportar', onClick: () => {} },
        { separator: true },
        { icon: 'archive', label: course.status === 'archived' ? 'Desarchivar' : 'Archivar', onClick: () => {
            coursePlanService.update(id, { status: course.status === 'archived' ? 'draft' : 'archived' });
            refresh();
        }},
        { icon: 'delete', label: 'Eliminar curso', danger: true, onClick: () => { coursePlanService.delete(id); navigate('/planning'); } },
    ];

    return (
        <div className="space-y-5">
            {/* Back */}
            <button
                onClick={() => navigate('/planning')}
                className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
            >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Mis Cursos
            </button>

            {/* Header */}
            <header className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-xl font-bold text-on-surface">{course.nombre}</h1>
                            <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                                {course.materia}
                            </span>
                            <span>·</span>
                            <span>{course.año}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">person</span>
                                {course.ownerName}
                            </span>
                        </div>
                        {course.collaborators.length > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                                <AvatarGroup users={course.collaborators} max={5} size="sm" />
                                <span className="text-xs text-outline">
                                    {course.collaboratorsCount} colaborador{course.collaboratorsCount !== 1 ? 'es' : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stats + Actions */}
                    <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
                                <span className="material-symbols-outlined text-[16px]">share</span>
                                Compartir
                            </Button>
                            <Dropdown items={moreOptions} />
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary leading-none">{course.modulesCount}</p>
                                <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Módulos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary leading-none">{course.classesCount}</p>
                                <p className="text-[10px] text-outline uppercase tracking-wider font-bold mt-1">Clases</p>
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            {/* Tabs + Content */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-4 lg:p-6 min-h-[460px]">
                <TabsNav tabs={tabs} baseUrl={`/planning/${id}`} />

                <Routes>
                    <Route path="" element={<ProgramTab course={course} />} />
                    <Route path="modules" element={<ModulesTab coursePlanId={id} onRefresh={refresh} />} />
                    <Route path="global-classes" element={<GlobalClassesTab coursePlanId={id} onRefresh={refresh} />} />
                    <Route path="anep" element={<AnepDocumentTab course={course} onRefresh={refresh} />} />
                    <Route path="collaborators" element={<CollaboratorsTab coursePlanId={id} course={course} onRefresh={refresh} />} />
                    <Route path="class/:moduleId/:classId" element={<ClassDetail />} />
                    <Route path="*" element={<Navigate to="" replace />} />
                </Routes>
            </div>

            {/* Share Modal */}
            <ShareCourseModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                coursePlanId={id}
                currentCollaborators={course.collaborators}
                onRefresh={refresh}
            />
        </div>
    );
};

export default CourseDetail;
