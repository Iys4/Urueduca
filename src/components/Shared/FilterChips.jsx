import React from 'react';

const FilterChips = ({ filters, activeFilter, onChange }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
                const isActive = activeFilter === filter.value;
                return (
                    <button
                        key={filter.value}
                        onClick={() => onChange(isActive ? null : filter.value)}
                        className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                            transition-all duration-150 active:scale-[0.96] focus-ring border
                            ${isActive
                                ? 'bg-primary text-on-primary border-primary shadow-sm'
                                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container hover:text-on-surface'
                            }
                        `}
                    >
                        {filter.icon && (
                            <span className={`material-symbols-outlined text-[14px] ${isActive ? 'text-on-primary' : 'text-outline'}`}>
                                {filter.icon}
                            </span>
                        )}
                        {filter.label}
                        {filter.count != null && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                                isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container text-outline'
                            }`}>
                                {filter.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterChips;
