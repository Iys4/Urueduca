import React, { useState } from 'react';

const positions = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowPositions = {
    top:    'top-full left-1/2 -translate-x-1/2 border-t-on-surface border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-on-surface border-x-transparent border-t-transparent',
    left:   'left-full top-1/2 -translate-y-1/2 border-l-on-surface border-y-transparent border-r-transparent',
    right:  'right-full top-1/2 -translate-y-1/2 border-r-on-surface border-y-transparent border-l-transparent',
};

const Tooltip = ({ children, content, position = 'top', delay = 200 }) => {
    const [show, setShow] = useState(false);
    let timer;

    const handleEnter = () => {
        timer = setTimeout(() => setShow(true), delay);
    };

    const handleLeave = () => {
        clearTimeout(timer);
        setShow(false);
    };

    return (
        <div className="relative inline-flex" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            {children}
            {show && (
                <div className={`absolute z-50 ${positions[position]} pointer-events-none`}>
                    <div className="bg-on-surface text-surface text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        {content}
                    </div>
                    <div className={`absolute w-0 h-0 border-4 ${arrowPositions[position]}`} />
                </div>
            )}
        </div>
    );
};

export default Tooltip;
