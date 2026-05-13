import React, { useState } from 'react';
import { Button, Badge } from '../../../Shared';
import ShareCourseModal from '../ShareCourseModal';
import { coursePlanService } from '../../../../services/coursePlanService';

const roleConfig = {
    viewer: { label: 'Lector', variant: 'neutral' },
    editor: { label: 'Editor', variant: 'primary' },
    admin:  { label: 'Admin',  variant: 'success' },
};

const colorPalette = [
    'bg-primary text-on-primary',
    'bg-tertiary text-on-tertiary',
    'bg-error text-on-error',
    'bg-[#6750a4] text-white',
    'bg-[#006874] text-white',
];

const getColor = (name) => {
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colorPalette[hash % colorPalette.length];
};

const getInitials = (name) => {
    return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
};

const CollaboratorsTab = ({ coursePlanId, course, onRefresh }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const collaborators = course.collaborators || [];

    const handleRoleChange = (userId, newRole) => {
        coursePlanService.updateCollaboratorRole(coursePlanId, userId, newRole);
        onRefresh();
    };

    const handleRemove = (userId) => {
        coursePlanService.removeCollaborator(coursePlanId, userId);
        onRefresh();
    };

    return (
        <div className="space-y-5 max-w-2xl">
            <div className="flex items-center justify-between">
                <p className="text-sm text-on-surface-variant">
                    <span className="font-semibold text-on-surface">{collaborators.length + 1}</span> persona{collaborators.length !== 0 ? 's' : ''} con acceso
                </p>
                <Button variant="primary" size="sm" onClick={() => setShowShareModal(true)}>
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    Invitar
                </Button>
            </div>

            <div className="space-y-2">
                {/* Owner */}
                <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary-container/20 border border-primary/10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getColor(course.ownerName)}`}>
                        {getInitials(course.ownerName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface">{course.ownerName}</p>
                        <p className="text-xs text-on-surface-variant">Creador del curso</p>
                    </div>
                    <Badge variant="primary" icon="star">Propietario</Badge>
                </div>

                {/* Collaborators */}
                {collaborators.map(collab => (
                    <div key={collab.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface-container/30 hover:bg-surface-container/50 transition-colors group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getColor(collab.name)}`}>
                            {getInitials(collab.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface">{collab.name}</p>
                            <p className="text-xs text-on-surface-variant">{collab.email}</p>
                        </div>
                        <select
                            value={collab.role}
                            onChange={(e) => handleRoleChange(collab.id, e.target.value)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="viewer">Lector</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            onClick={() => handleRemove(collab.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors opacity-0 group-hover:opacity-100"
                            title="Quitar acceso"
                        >
                            <span className="material-symbols-outlined text-[18px]">person_remove</span>
                        </button>
                    </div>
                ))}
            </div>

            {collaborators.length === 0 && (
                <div className="text-center py-8">
                    <span className="material-symbols-outlined text-[32px] text-outline mb-2 block">group_add</span>
                    <p className="text-sm text-on-surface-variant">
                        Aún no compartiste este curso. Invitá a otros docentes para colaborar.
                    </p>
                </div>
            )}

            <ShareCourseModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                coursePlanId={coursePlanId}
                currentCollaborators={collaborators}
                onRefresh={onRefresh}
            />
        </div>
    );
};

export default CollaboratorsTab;
