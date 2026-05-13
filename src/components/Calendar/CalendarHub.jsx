import React, { useState, useMemo } from 'react';
import MonthView from './MonthView';
import CreateEventModal from './CreateEventModal';
import ImportCalendarModal from './ImportCalendarModal';
import EventQuickView from './EventQuickView';
import { calendarService } from '../../services/calendarService';
import { Button } from '../Shared';

const FILTER_TYPES = [
    { id: 'classes', label: 'Clases', color: 'bg-primary' },
    { id: 'evaluations', label: 'Evaluaciones', color: 'bg-warning' },
    { id: 'birthdays', label: 'Cumpleaños', color: 'bg-pink-500' },
    { id: 'manual', label: 'Eventos Manuales', color: 'bg-purple-600' },
    { id: 'imported', label: 'Importados', color: 'bg-slate-500' },
];

const CalendarHub = () => {
    // Current date state
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // UI states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Filters state
    const [filters, setFilters] = useState({
        classes: true,
        evaluations: true,
        birthdays: true,
        manual: true,
        imported: true
    });

    // Toggle filter
    const toggleFilter = (filterId) => {
        setFilters(prev => ({ ...prev, [filterId]: !prev[filterId] }));
    };

    // Navigation
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToday = () => setCurrentDate(new Date());

    // Fetch events
    const events = useMemo(() => {
        return calendarService.getAggregatedEvents(
            currentDate.getMonth(),
            currentDate.getFullYear(),
            filters
        );
    }, [currentDate, filters, showCreateModal, showImportModal]); // Re-fetch when modals close

    const monthName = currentDate.toLocaleString('es-UY', { month: 'long', year: 'numeric' });

    return (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <header className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-4 lg:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[28px] text-primary">calendar_month</span>
                        Calendario Académico
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Centralizá tus clases, evaluaciones, cumpleaños y recordatorios en un solo lugar.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => setShowImportModal(true)}>
                        <span className="material-symbols-outlined text-[18px]">publish</span>
                        Importar
                    </Button>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Crear Evento
                    </Button>
                </div>
            </header>

            {/* Calendar Controls & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                {/* Nav */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={goToday}>Hoy</Button>
                    <div className="flex items-center gap-1">
                        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <h2 className="text-lg font-bold w-48 text-center capitalize">{monthName}</h2>
                        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 w-full lg:w-auto hide-scrollbar">
                    {FILTER_TYPES.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => toggleFilter(filter.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border ${
                                filters[filter.id] 
                                    ? 'bg-surface-container-high border-outline-variant text-on-surface shadow-sm' 
                                    : 'bg-transparent border-transparent text-outline hover:bg-surface-container'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${filter.color} ${filters[filter.id] ? 'opacity-100' : 'opacity-40'}`}></span>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 min-h-[600px] bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <MonthView 
                    currentDate={currentDate} 
                    events={events} 
                    onEventClick={setSelectedEvent} 
                />
            </div>

            {/* Modals & Panels */}
            <CreateEventModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)} 
                defaultDate={currentDate}
            />
            
            <ImportCalendarModal 
                isOpen={showImportModal} 
                onClose={() => setShowImportModal(false)} 
            />

            <EventQuickView 
                event={selectedEvent} 
                onClose={() => setSelectedEvent(null)} 
            />
        </div>
    );
};

export default CalendarHub;
