import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const TabsNav = ({ tabs, baseUrl }) => {
    const location = useLocation();

    return (
        <div className="border-b border-outline-variant mb-6 overflow-x-auto">
            <nav className="flex gap-1 min-w-max">
                {tabs.map((tab) => {
                    const to = tab.path === '' ? baseUrl : `${baseUrl}/${tab.path}`;
                    const isActive = tab.path === ''
                        ? location.pathname === baseUrl || location.pathname === baseUrl + '/'
                        : location.pathname.startsWith(`${baseUrl}/${tab.path}`);

                    return (
                        <NavLink
                            key={tab.path}
                            to={to}
                            className={`
                                px-4 py-2.5 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                                ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                {tab.icon && <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>}
                                {tab.label}
                                {tab.badge != null && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                                        isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                                    }`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default TabsNav;
