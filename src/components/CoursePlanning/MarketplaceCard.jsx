import React from 'react';
import { Badge } from '../Shared';

const materiaColors = {
    'Biología':             'bg-tertiary-container text-on-tertiary-container',
    'Historia':             'bg-secondary-container text-on-secondary-container',
    'Matemática':           'bg-primary-container text-on-primary-container',
    'Física':               'bg-error-container text-on-error-container',
    'Química':              'bg-tertiary-container text-on-tertiary-container',
    'Literatura':           'bg-secondary-container text-on-secondary-container',
    'Geografía':            'bg-primary-container text-on-primary-container',
};

const materiaIcons = {
    'Biología':   'biotech',
    'Historia':   'history_edu',
    'Matemática': 'calculate',
    'Física':     'science',
    'Química':    'science',
    'Literatura': 'menu_book',
    'Geografía':  'public',
};

const MarketplaceCard = ({ cls, onClone, alreadyCloned }) => {
    const colorClass = materiaColors[cls.materia] || 'bg-surface-container text-on-surface-variant';
    const icon       = materiaIcons[cls.materia] || 'auto_stories';



    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
            {/* Color header strip */}
            <div className={`${colorClass} px-5 py-4 flex items-start gap-3`}>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none mb-1">{cls.materia || 'Recurso'}</p>
                    <h3 className="font-bold text-sm leading-tight line-clamp-2">{cls.nombre || cls.title || 'Clase sin título'}</h3>
                    <p className="text-[11px] opacity-80 mt-1">{cls.grado || cls.año || 'Año no especificado'}</p>
                </div>
            </div>

                {/* Body */}
            <div className="p-5 flex-1 flex flex-col gap-3">
                {cls.shortDescription && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {cls.shortDescription}
                    </p>
                )}

                {/* Context */}
                <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-start gap-2 text-xs">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">menu_book</span>
                        <span className="text-on-surface-variant"><span className="font-semibold text-on-surface">Plan Original:</span> {cls.planNombre}</span>
                    </div>
                    {cls.type && (
                        <div className="flex items-start gap-2 text-xs">
                            <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0 mt-0.5">category</span>
                            <span className="text-on-surface-variant"><span className="font-semibold text-on-surface">Tipo:</span> {cls.type === 'evaluation' ? 'Evaluación' : cls.type === 'optional' ? 'Opcional' : 'Obligatoria'}</span>
                        </div>
                    )}
                </div>

                {/* Author */}
                <div className="flex items-center gap-2 pt-1 border-t border-outline-variant">
                    <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-on-primary-container">person</span>
                    </div>
                    <span className="text-[11px] text-outline truncate">{cls.author || cls.ownerName || 'Anónimo'}</span>
                    <span className="text-[11px] text-outline ml-auto shrink-0">{cls.updatedAtRelative}</span>
                </div>

                {/* Action */}
                <button
                    onClick={() => !alreadyCloned && onClone?.(cls.id)}
                    disabled={alreadyCloned}
                    className={`w-full mt-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                        alreadyCloned
                            ? 'bg-surface-container text-outline cursor-default'
                            : 'bg-primary text-on-primary hover:bg-primary-hover active:scale-95'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {alreadyCloned ? 'check_circle' : 'file_download'}
                    </span>
                    {alreadyCloned ? 'Ya importada' : 'Importar Clase'}
                </button>
            </div>
        </div>
    );
};

export default MarketplaceCard;
