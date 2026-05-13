import React from 'react';

const colorPalette = [
    'bg-primary text-on-primary',
    'bg-tertiary text-on-tertiary',
    'bg-error text-on-error',
    'bg-warning text-on-primary',
    'bg-secondary text-on-secondary',
    'bg-[#6750a4] text-white',
    'bg-[#006874] text-white',
    'bg-[#7d5260] text-white',
];

const getColorForName = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colorPalette[hash % colorPalette.length];
};

const getInitials = (name) => {
    return name
        .split(' ')
        .map(p => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const AvatarGroup = ({ users = [], max = 3, size = 'sm' }) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[9px]',
        sm: 'w-8 h-8 text-[11px]',
        md: 'w-10 h-10 text-xs',
    };
    const sizeClass = sizeClasses[size] || sizeClasses.sm;

    const visible = users.slice(0, max);
    const overflow = users.length - max;

    if (users.length === 0) return null;

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((user) => (
                <div
                    key={user.id || user.name}
                    className={`
                        ${sizeClass} rounded-full flex items-center justify-center
                        font-bold ring-2 ring-surface-container-lowest
                        ${getColorForName(user.name)}
                    `}
                    title={user.name}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        getInitials(user.name)
                    )}
                </div>
            ))}
            {overflow > 0 && (
                <div
                    className={`
                        ${sizeClass} rounded-full flex items-center justify-center
                        font-bold ring-2 ring-surface-container-lowest
                        bg-surface-container-high text-on-surface-variant
                    `}
                >
                    +{overflow}
                </div>
            )}
        </div>
    );
};

export default AvatarGroup;
