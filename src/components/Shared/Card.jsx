import React from 'react';

const Card = ({ children, className = '', borderStatus = 'none', ...props }) => {
    let borderClass = 'border-outline-variant';
    if (borderStatus === 'urgent') borderClass = 'border-error';
    if (borderStatus === 'attention') borderClass = 'border-primary';

    return (
        <div 
            className={`bg-surface-container-lowest rounded-xl border ${borderClass} shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
