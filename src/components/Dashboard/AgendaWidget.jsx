import React from 'react';

const AgendaWidget = ({ lessons }) => {
    if (!lessons || lessons.length === 0) return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-4">Agenda de Hoy</h2>
            <div className="text-center py-6">
                <span className="material-symbols-outlined text-[36px] text-outline mb-2">calendar_today</span>
                <p className="text-sm text-secondary">Sin clases programadas hoy</p>
            </div>
        </div>
    );

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-on-surface mb-5">Agenda de Hoy</h2>

            <div className="relative ml-3 border-l-2 border-outline-variant space-y-5">
                {lessons.map((lesson) => {
                    const isPast = lesson.end_time < currentTime;
                    const isCurrent = lesson.start_time <= currentTime && lesson.end_time >= currentTime;

                    return (
                        <div key={lesson.id} className={`relative pl-6 ${isPast ? 'opacity-40' : ''}`}>
                            {/* Dot */}
                            <div className={`
                                absolute -left-[7px] top-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest
                                ${isCurrent ? 'bg-primary ring-4 ring-primary/20' : isPast ? 'bg-outline-variant' : 'bg-primary'}
                            `} />

                            <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-0.5">
                                {lesson.start_time} – {lesson.end_time}
                                {isCurrent && <span className="ml-2 text-primary">● Ahora</span>}
                            </p>
                            <h3 className="text-sm font-bold text-on-surface leading-tight">{lesson.courseName}</h3>
                            <p className="text-xs text-secondary mt-0.5 line-clamp-1">{lesson.topic}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AgendaWidget;
