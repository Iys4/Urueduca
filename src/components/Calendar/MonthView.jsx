import React from 'react';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Helper to get days in a month grid format (including padding days from prev/next months)
const getDaysInMonthGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const grid = [];
    
    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
        grid.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
        grid.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month padding (to fill 6 rows of 7 days = 42 cells)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
        grid.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return grid;
};

const MonthView = ({ currentDate, events, onEventClick }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const gridDays = getDaysInMonthGrid(year, month);
    
    const todayStr = new Date().toISOString().split('T')[0];

    // Group events by date string (YYYY-MM-DD)
    const eventsByDate = events.reduce((acc, ev) => {
        if (!acc[ev.date]) acc[ev.date] = [];
        acc[ev.date].push(ev);
        return acc;
    }, {});

    return (
        <div className="flex-1 flex flex-col bg-surface-container-lowest">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-lowest">
                {DAYS_OF_WEEK.map((day, idx) => (
                    <div key={day} className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider ${idx === 0 || idx === 6 ? 'text-outline' : 'text-on-surface-variant'}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {gridDays.map((cell, idx) => {
                    const dateStr = cell.date.toISOString().split('T')[0];
                    const dayEvents = eventsByDate[dateStr] || [];
                    const isToday = dateStr === todayStr;
                    const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

                    return (
                        <div 
                            key={idx} 
                            className={`
                                min-h-[100px] border-b border-r border-outline-variant/40 p-1 flex flex-col transition-colors
                                ${!cell.isCurrentMonth ? 'bg-surface-container-lowest/50 opacity-50' : isWeekend ? 'bg-surface-container-lowest/20' : 'bg-surface-container-lowest hover:bg-surface-container/10'}
                            `}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-start mb-1 px-1">
                                <span className={`
                                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold
                                    ${isToday ? 'bg-primary text-on-primary shadow-sm' : cell.isCurrentMonth ? 'text-on-surface' : 'text-outline'}
                                `}>
                                    {cell.date.getDate()}
                                </span>
                                {dayEvents.length > 0 && (
                                    <span className="text-[9px] text-outline mt-1 font-medium">{dayEvents.length} ev</span>
                                )}
                            </div>

                            {/* Events List */}
                            <div className="flex-1 overflow-y-auto space-y-1 px-0.5 hide-scrollbar">
                                {dayEvents.slice(0, 4).map(ev => (
                                    <button
                                        key={ev.id}
                                        onClick={() => onEventClick(ev)}
                                        className="w-full text-left px-1.5 py-1 rounded truncate text-[10px] font-semibold flex items-center gap-1 transition-transform hover:scale-[1.02]"
                                        style={{ backgroundColor: `${ev.color}15`, color: ev.color, borderLeft: `2px solid ${ev.color}` }}
                                        title={ev.title}
                                    >
                                        <span className="material-symbols-outlined text-[10px]" style={{ color: ev.color }}>{ev.icon}</span>
                                        <span className="truncate leading-tight">{ev.title}</span>
                                    </button>
                                ))}
                                {dayEvents.length > 4 && (
                                    <div className="text-[9px] text-center text-outline font-medium hover:text-on-surface cursor-pointer pt-0.5">
                                        + {dayEvents.length - 4} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
