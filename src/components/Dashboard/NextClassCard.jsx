import React from 'react';
import { useNavigate } from 'react-router-dom';

const NextClassCard = ({ lesson }) => {
    const navigate = useNavigate();

    if (!lesson) return (
        <div className="bg-surface-container rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-[40px] text-outline mb-2">event_available</span>
            <p className="text-sm text-secondary font-medium">No tenés más clases hoy. ¡Buen descanso!</p>
        </div>
    );

    return (
        <div className="relative bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-on-primary overflow-hidden shadow-md">
            {/* Decorative icon */}
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-[0.08] select-none pointer-events-none">school</span>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                        Próxima clase
                    </div>
                    <h2 className="text-xl font-bold mb-1">{lesson.courseName}</h2>
                    <p className="text-white/70 flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {lesson.start_time} – {lesson.end_time}
                        <span className="mx-1">·</span>
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        {lesson.topic}
                    </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            const course = lesson.course_id;
                            if (course) navigate(`/groups/${course}`);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                        Pasar Lista
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NextClassCard;
