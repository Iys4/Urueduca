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
                bg-surface-container-lowest rounded-2xl p-5 border shadow-sm transition-all duration-300 group cursor-pointer flex flex-col
                ${isEval
                    ? 'border-warning/30 hover:border-warning/60 hover:shadow-lg hover:shadow-warning/5'
                    : 'border-outline-variant hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5'
                }
            `}
        >
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isEval ? 'bg-warning-container/40 text-warning' : tc.variant === 'primary' ? 'bg-primary-container text-primary' : 'bg-surface-container text-outline'
                }`}>
                    <span className="material-symbols-outlined text-[22px]">{tc.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={tc.variant} className="text-[9px] px-1.5 py-0 uppercase font-black">{tc.label}</Badge>
                        {cls.attachedDocuments?.length > 0 && (
                            <span className="text-[10px] text-outline font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">attach_file</span>
                                {cls.attachedDocuments.length}
                            </span>
                        )}
                    </div>
                    <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">
                        {cls.title}
                    </h4>
                </div>
                <span className="material-symbols-outlined text-[20px] text-outline/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0">
                    arrow_forward
                </span>
            </div>

            {cls.shortDescription && (
                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4 flex-1">
                    {cls.shortDescription}
                </p>
            )}

            {/* Evaluation Details */}
            {isEval && cls.evaluationData && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-2 rounded-lg bg-warning-container/20">
                    {cls.evaluationData.fecha && (
                        <div className="flex items-center gap-1 text-[11px] text-warning font-bold">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            {new Date(cls.evaluationData.fecha).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}
                        </div>
                    )}
                    {cls.evaluationData.ponderacion > 0 && (
                        <div className="text-[11px] font-black text-warning bg-warning-container/40 px-2 py-0.5 rounded-md">
                            {cls.evaluationData.ponderacion}%
                        </div>
                    )}
                    {cls.evaluationData.modalidad && (
                        <div className="text-[11px] font-bold text-on-warning-container uppercase tracking-tight">
                            {cls.evaluationData.modalidad}
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30 mt-auto">
                <div className="flex -space-x-2 overflow-hidden">
                    {(cls.attachedDocuments || []).slice(0, 3).map((doc, idx) => {
                        const ft = fileTypeIcons[doc.type] || fileTypeIcons.other;
                        return (
                            <div key={idx} className="w-6 h-6 rounded-md bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center shadow-sm" title={doc.name}>
                                <span className={`material-symbols-outlined text-[14px] ${ft.color}`}>{ft.icon}</span>
                            </div>
                        );
                    })}
                </div>
                {cls.updatedAt && (
                    <span className="text-[10px] text-outline font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">update</span>
                        {coursePlanService.relativeTime(cls.updatedAt)}
                    </span>
                )}
            </div>

            {/* Notes snippet */}
            {cls.notes && (
                <div className="mt-3 flex items-start gap-2 text-[10px] text-on-surface-variant italic bg-surface-container/50 rounded-lg p-2 border-l-2 border-warning/30">
                    <span className="line-clamp-1">"{cls.notes}"</span>
                </div>
            )}
        </div>
    );
};

export default ClassPlanCard;
