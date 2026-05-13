import React, { useState, useRef, useEffect } from 'react';

const Accordion = ({ title, subtitle, badges, actions, defaultOpen = false, children, className = '' }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const contentRef = useRef(null);
    const [height, setHeight] = useState(defaultOpen ? 'auto' : '0px');

    useEffect(() => {
        if (isOpen) {
            setHeight(`${contentRef.current?.scrollHeight || 0}px`);
            // After transition, set to auto so content can grow
            const timer = setTimeout(() => setHeight('auto'), 300);
            return () => clearTimeout(timer);
        } else {
            // First set the explicit height, then collapse
            if (contentRef.current) {
                setHeight(`${contentRef.current.scrollHeight}px`);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => setHeight('0px'));
                });
            }
        }
    }, [isOpen]);

    return (
        <div className={`border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest ${className}`}>
            {/* Header */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-container/50 transition-colors cursor-pointer"
            >
                <span className={`material-symbols-outlined text-[20px] text-outline transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-on-surface">{title}</h3>
                        {badges}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
                    )}
                </div>
                {/* Actions (stop propagation so accordion doesn't toggle) */}
                {actions && (
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {actions}
                    </div>
                )}
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                style={{ maxHeight: height }}
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            >
                <div className="px-5 pb-5 pt-1 border-t border-outline-variant/50">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;
