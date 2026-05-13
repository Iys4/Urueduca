import React from 'react';
import { useNavigate } from 'react-router-dom';

const CoursesSummary = ({ courses }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 pt-6 pb-4">
                <h2 className="text-lg font-bold text-on-surface">Tus Grupos</h2>
                <button
                    onClick={() => navigate('/groups')}
                    className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                    Ver todos →
                </button>
            </div>

            <div className="divide-y divide-outline-variant">
                {courses.map(course => {
                    const isPending = course.nextEvent === 'Por corregir';
                    return (
                        <button
                            key={course.id}
                            onClick={() => navigate(`/groups/${course.id}`)}
                            className="w-full flex justify-between items-center px-6 py-3.5 hover:bg-surface-container-low transition-colors text-left group"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0">
                                    {course.name.substring(0, 2)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm text-on-surface truncate">{course.name}</h3>
                                    <p className="text-[11px] text-outline truncate">{course.institution}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                    isPending
                                        ? 'bg-error-container text-on-error-container'
                                        : 'bg-surface-container text-on-surface-variant'
                                }`}>
                                    {course.nextEvent}
                                </span>
                                <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">chevron_right</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CoursesSummary;
