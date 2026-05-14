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

const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled = false, loading = false, ...props }) => {
    return (
        <button
            className={`
                inline-flex items-center justify-center font-semibold rounded-lg
                transition-all duration-150 active:scale-[0.97] focus-ring
                disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${className}
                ${loading ? 'relative !text-transparent' : ''}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            {children}
        </button>
    );
};

export default Button;
