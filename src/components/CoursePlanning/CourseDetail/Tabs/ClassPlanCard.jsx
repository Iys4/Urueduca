import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../Shared';
import { coursePlanService } from '../../../../services/coursePlanService';

const typeConfig = {
    mandatory:  { label: 'Obligatoria', variant: 'primary', icon: 'priority_high' },
    optional:   { label: 'Opcional',    variant: 'neutral', icon: 'add_circle_outline' },
    evaluation: { label: 'Evaluación',  variant: 'warning', icon: 'assignment' },
};

const fileTypeIcons = {
    pdf:   { icon: 'picture_as_pdf', color: 'text-error' },
    doc:   { icon: 'description',    color: 'text-primary' },
    image: { icon: 'image',          color: 'text-tertiary' },
    other: { icon: 'attach_file',    color: 'text-outline' },
};

const ClassPlanCard = ({ cls, moduleId, coursePlanId, onRefresh, isGlobal = false }) => {
    const navigate = useNavigate();
    const tc = typeConfig[cls.type] || typeConfig.mandatory;
    const isEval = cls.type === 'evaluation';

    const handleClick = () => {
        if (!isGlobal && moduleId) {
            navigate(`/planning/${coursePlanId}/class/${moduleId}/${cls.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`
                rounded-xl p-4 transition-all group cursor-pointer border
                ${isEval
                    ? 'bg-warning-container/10 border-warning/20 hover:bg-warning-container/25 hover:border-warning/40'
                    : 'bg-surface-container/30 border-transparent hover:bg-surface-container/50 hover:border-outline-variant/50'
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`material-symbols-outlined text-[16px] ${isEval ? 'text-warning' : tc.variant === 'primary' ? 'text-primary' : 'text-outline'}`}>
                            {tc.icon}
                        </span>
                        <h4 className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{cls.title}</h4>
                        <Badge variant={tc.variant} className="text-[9px]">{tc.label}</Badge>
                    </div>
                    {cls.shortDescription && (
                        <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed ml-6">{cls.shortDescription}</p>
                    )}
                </div>
                {/* Navigate arrow */}
                <span className="material-symbols-outlined text-[18px] text-outline opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                    chevron_right
                </span>
            </div>

            {/* Evaluation quick stats */}
            {isEval && cls.evaluationData && (
                <div className="flex items-center gap-3 mt-2 ml-6 text-[11px]">
                    {cls.evaluationData.fecha && (
                        <span className="inline-flex items-center gap-1 text-warning font-semibold">
                            <span className="material-symbols-outlined text-[13px]">event</span>
                            {new Date(cls.evaluationData.fecha).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}
                        </span>
                    )}
                    {cls.evaluationData.ponderacion > 0 && (
                        <span className="inline-flex items-center gap-1 text-on-surface-variant font-semibold">
                            {cls.evaluationData.ponderacion}%
                        </span>
                    )}
                    {cls.evaluationData.modalidad && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning-container/30 text-warning font-semibold capitalize">
                            {cls.evaluationData.modalidad}
                        </span>
                    )}
                </div>
            )}

            {/* Footer: attachments + meta */}
            <div className="flex items-center justify-between mt-2.5 ml-6">
                <div className="flex items-center gap-2 flex-wrap">
                    {(cls.attachedDocuments || []).length > 0 ? (
                        cls.attachedDocuments.slice(0, 3).map((doc, idx) => {
                            const ft = fileTypeIcons[doc.type] || fileTypeIcons.other;
                            return (
                                <span key={idx} className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant bg-surface-container-high/60 px-2 py-0.5 rounded-full">
                                    <span className={`material-symbols-outlined text-[12px] ${ft.color}`}>{ft.icon}</span>
                                    <span className="truncate max-w-[80px]">{doc.name}</span>
                                </span>
                            );
                        })
                    ) : (
                        <span className="text-[11px] text-outline italic">Sin adjuntos</span>
                    )}
                    {(cls.attachedDocuments || []).length > 3 && (
                        <span className="text-[10px] text-outline font-semibold">+{(cls.attachedDocuments || []).length - 3}</span>
                    )}
                </div>
                {cls.updatedAt && (
                    <span className="text-[10px] text-outline flex items-center gap-1 shrink-0 ml-2">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {coursePlanService.relativeTime(cls.updatedAt)}
                    </span>
                )}
            </div>

            {/* Notes indicator */}
            {cls.notes && (
                <div className="mt-2 ml-6 flex items-start gap-1.5 text-[11px] text-on-surface-variant bg-warning-container/20 rounded-lg px-2.5 py-1.5">
                    <span className="material-symbols-outlined text-[13px] text-warning shrink-0 mt-0.5">sticky_note_2</span>
                    <span className="line-clamp-1">{cls.notes}</span>
                </div>
            )}
        </div>
    );
};

export default ClassPlanCard;
