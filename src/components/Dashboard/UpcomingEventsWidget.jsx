import React from 'react';

const UpcomingEventsWidget = ({ events }) => {
    if (!events || events.length === 0) return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-4">Próximos Eventos (7 días)</h2>
            <div className="text-center py-6">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">event_available</span>
                <p className="text-sm text-secondary">No hay eventos próximos en la próxima semana.</p>
            </div>
        </div>
    );

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-5">Próximos Eventos (7 días)</h2>

            <div className="relative ml-3 border-l-2 border-outline-variant space-y-5">
                {events.map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                        {/* Dot */}
                        <div className={`
                            absolute -left-[7px] top-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest
                            bg-surface-container-highest
                        `}>
                            <span className={`material-symbols-outlined text-[14px] absolute -left-[14px] -top-[1.5px] bg-surface-container-lowest rounded-full ${event.color}`}>
                                {event.icon}
                            </span>
                        </div>

                        <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${event.color}`}>
                            {event.type === 'class' ? 'PRÓXIMA CLASE' : event.type === 'birthday' ? 'CUMPLEAÑOS' : event.type === 'exam' ? 'PARCIAL/EVALUACIÓN' : 'FERIADO'}
                        </p>
                        <h3 className="text-sm font-bold text-on-surface leading-tight">{event.title}</h3>
                        <p className="text-xs text-secondary mt-0.5 line-clamp-1">{event.subtitle}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingEventsWidget;
