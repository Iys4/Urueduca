import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../Shared';

const GroupCard = ({ group }) => {
    const navigate = useNavigate();

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' });
    };

    const borderColor = {
        urgent: 'border-t-error',
        attention: 'border-t-primary',
        neutral: 'border-t-outline-variant',
    }[group.status];

    const handlePrimary = () => {
        if (group.smartAction.urgent) navigate(`/groups/${group.id}/evaluations`);
        else if (group.smartAction.primary) navigate(`/groups/${group.id}`);
        else navigate(`/groups/${group.id}`);
    };

    return (
        <div className={`bg-surface-container-lowest rounded-xl border border-outline-variant border-t-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow flex flex-col`}>
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-on-surface leading-tight">{group.name}</h3>
                    <span className="text-[11px] font-semibold text-outline bg-surface-container px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ml-2">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        {group.studentsCount}
                    </span>
                </div>
                <p className="text-[11px] text-outline mb-4">{group.institution}</p>
            </div>

            {/* Details */}
            <div className="px-5 space-y-3 flex-1">
                {/* Module progress */}
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-outline shrink-0">auto_stories</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-on-surface font-medium truncate">{group.currentModule}</p>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${group.moduleProgress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Next class */}
                {group.nextClass && (
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-outline shrink-0">event</span>
                        <p className="text-xs text-on-surface-variant">
                            <span className="font-semibold text-on-surface">{formatDate(group.nextClass.date)}</span>
                            {' · '}{group.nextClass.topic}
                        </p>
                    </div>
                )}

                {/* Next eval */}
                {group.nextEval && (
                    <div className={`flex items-center gap-3 p-2.5 rounded-lg ${
                        group.status === 'urgent' ? 'bg-error-container/40' : 'bg-surface-container'
                    }`}>
                        <span className={`material-symbols-outlined text-[18px] shrink-0 ${group.status === 'urgent' ? 'text-error' : 'text-outline'}`}>assignment</span>
                        <p className={`text-xs font-medium ${group.status === 'urgent' ? 'text-on-error-container' : 'text-on-surface-variant'}`}>
                            {group.nextEval.title} · {formatDate(group.nextEval.date)}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-5 pt-4 mt-auto">
                <button
                    onClick={handlePrimary}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-[0.97] ${
                        group.smartAction.urgent
                            ? 'bg-error text-on-error hover:bg-error/85'
                            : group.smartAction.primary
                                ? 'bg-primary text-on-primary hover:bg-primary-hover'
                                : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{group.smartAction.icon}</span>
                    {group.smartAction.label}
                </button>
            </div>
        </div>
    );
};

export default GroupCard;
