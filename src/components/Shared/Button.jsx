import React from 'react';

const variants = {
    primary:   "bg-primary text-on-primary hover:bg-primary-hover shadow-sm",
    secondary: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
    outline:   "border border-outline-variant text-primary hover:bg-primary-fixed",
    ghost:     "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
    danger:    "bg-error text-on-error hover:bg-error/85 shadow-sm",
    success:   "bg-tertiary text-on-tertiary hover:bg-tertiary/85 shadow-sm",
};

const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
};

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, ...props }) => {
    return (
        <button
            className={`
                inline-flex items-center justify-center font-semibold rounded-lg
                transition-all duration-150 active:scale-[0.97] focus-ring
                disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${className}
            `}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
