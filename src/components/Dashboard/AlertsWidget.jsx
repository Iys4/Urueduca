import React from 'react';
import { useNavigate } from 'react-router-dom';

const AlertsWidget = ({ alerts }) => {
    const navigate = useNavigate();

    if (!alerts || alerts.length === 0) return null;

    const handleAction = (alert) => {
        if (alert.type === 'evaluation' && alert.evalId) navigate(`/groups/${alert.course_id}/evaluations/${alert.evalId}`);
        else if (alert.type === 'attendance') navigate(`/groups/${alert.course_id}`);
        else if (alert.type === 'rubric' && alert.evalId) navigate(`/planning/${alert.course_id}/evaluations/${alert.evalId}`); // Mock route for rubric
        else navigate(`/planning/${alert.course_id}`);
    };

    return (
        <div className="space-y-2">
            {alerts.map(alert => {
                const isHigh = alert.severity === 'high';
                return (
                    <div
                        key={alert.id}
                        className={`
                            rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border
                            ${isHigh
                                ? 'bg-error-container/60 border-error/20 text-on-error-container'
                                : 'bg-warning-container/40 border-warning/10 text-on-warning-container'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className={`material-symbols-outlined text-[20px] shrink-0 ${isHigh ? 'text-error' : 'text-warning'}`}>
                                {alert.icon || 'warning'}
                            </span>
                            <p className="font-semibold text-sm">{alert.message}</p>
                        </div>
                        <button
                            onClick={() => handleAction(alert)}
                            className={`
                                whitespace-nowrap px-4 py-1.5 font-bold rounded-lg text-sm transition-colors shrink-0
                                ${isHigh
                                    ? 'bg-error text-on-error hover:bg-error/85'
                                    : 'bg-warning text-white hover:bg-warning/85'
                                }
                            `}
                        >
                            {alert.actionLabel}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default AlertsWidget;
