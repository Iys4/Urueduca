import React, { useEffect, useRef, useCallback } from 'react';

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    const backdropRef = useRef(null);
    const contentRef = useRef(null);

    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    // Focus trap: auto-focus the first focusable element on open
    useEffect(() => {
        if (isOpen && contentRef.current) {
            const focusable = contentRef.current.querySelector('input, textarea, select, button:not([disabled])');
            if (focusable) setTimeout(() => focusable.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4
                       bg-on-surface/40 backdrop-blur-sm
                       animate-[fadeIn_150ms_ease-out]"
            style={{ animation: 'fadeIn 150ms ease-out' }}
        >
            <div
                ref={contentRef}
                className={`
                    w-full ${sizes[size] || sizes.md}
                    bg-surface-container-lowest rounded-2xl shadow-2xl
                    flex flex-col max-h-[90vh]
                    animate-[slideUp_200ms_ease-out]
                `}
                style={{ animation: 'slideUp 200ms ease-out' }}
                role="dialog"
                aria-modal="true"
                aria-label={title}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <h2 className="text-lg font-bold text-on-surface">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container hover:text-on-surface transition-colors focus-ring"
                        aria-label="Cerrar"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
