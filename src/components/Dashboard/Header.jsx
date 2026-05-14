import React from 'react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-14 bg-surface-container-lowest/80 backdrop-blur-lg border-b border-outline-variant flex justify-between items-center px-4 lg:px-8 z-40">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input
                    type="text"
                    placeholder="Buscar grupo, alumno, material..."
                    className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg text-sm text-on-surface placeholder:text-outline border-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <button className="w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline transition-colors focus-ring">
                    <span className="material-symbols-outlined text-[20px]">help_outline</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
