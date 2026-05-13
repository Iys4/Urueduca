import React, { useState, useEffect, useRef } from 'react';

const SearchInput = ({ value, onChange, placeholder = 'Buscar...', className = '', debounceMs = 300 }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const timerRef = useRef(null);

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    const handleChange = (e) => {
        const val = e.target.value;
        setLocalValue(val);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onChange(val), debounceMs);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className={`relative ${className}`}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline pointer-events-none">
                search
            </span>
            <input
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-9 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant
                           text-on-surface placeholder:text-outline
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                           transition-all"
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center
                               text-outline hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    aria-label="Limpiar búsqueda"
                >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
            )}
        </div>
    );
};

export default SearchInput;
