import React from 'react';

const EmptyState = ({ icon = 'inbox', title, description, action = null }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-outline">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
            <p className="text-sm text-secondary max-w-sm">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export default EmptyState;
