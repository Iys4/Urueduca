import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ trigger, items, align = 'right' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            {/* Trigger */}
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container hover:text-on-surface transition-colors focus-ring"
                aria-label="Más opciones"
            >
                {trigger || <span className="material-symbols-outlined text-[20px]">more_vert</span>}
            </button>

            {/* Menu */}
            {open && (
                <div
                    className={`
                        absolute top-full mt-1 z-50 min-w-[200px]
                        bg-surface-container-lowest rounded-xl border border-outline-variant
                        shadow-lg py-1.5
                        animate-[fadeIn_100ms_ease-out]
                        ${align === 'right' ? 'right-0' : 'left-0'}
                    `}
                    role="menu"
                >
                    {items.map((item, idx) => {
                        if (item.separator) {
                            return <div key={`sep-${idx}`} className="h-px bg-outline-variant my-1.5" />;
                        }
                        return (
                            <button
                                key={item.label}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    item.onClick?.();
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left
                                    ${item.danger
                                        ? 'text-error hover:bg-error-container/40'
                                        : 'text-on-surface hover:bg-surface-container'
                                    }
                                    ${item.disabled ? 'opacity-40 pointer-events-none' : ''}
                                `}
                                role="menuitem"
                                disabled={item.disabled}
                            >
                                {item.icon && (
                                    <span className={`material-symbols-outlined text-[18px] ${item.danger ? 'text-error' : 'text-outline'}`}>
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
