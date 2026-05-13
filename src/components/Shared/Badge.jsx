import React from 'react';

const variants = {
    neutral:   "bg-surface-container text-on-surface-variant",
    primary:   "bg-primary-container text-on-primary-container",
    urgent:    "bg-error-container text-on-error-container",
    success:   "bg-success-container text-on-success-container",
    warning:   "bg-warning-container text-on-warning-container",
};

const Badge = ({ children, variant = 'neutral', className = '', icon = null, dot = false }) => {
    return (
        <span className={`
            inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full 
            text-[11px] font-bold uppercase tracking-wider leading-tight whitespace-nowrap
            ${variants[variant] || variants.neutral}
            ${className}
        `}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'urgent' ? 'bg-error' : variant === 'success' ? 'bg-tertiary' : 'bg-primary'}`} />}
            {icon && <span className="material-symbols-outlined text-[13px] leading-none">{icon}</span>}
            {children}
        </span>
    );
};

export default Badge;
