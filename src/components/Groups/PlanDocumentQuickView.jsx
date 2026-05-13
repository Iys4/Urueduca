import React from 'react';
import { Button } from '../Shared';

const PlanDocumentQuickView = ({ plan, onClose }) => {
    if (!plan) return null;

    // Overlay click handler
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex justify-end bg-scrim/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-xl h-full bg-surface-container-lowest shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="h-40 p-6 flex flex-col justify-between relative bg-primary text-on-primary">
                    <div className="flex justify-between items-start z-10">
                        <div className="flex items-center gap-2 bg-on-primary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            Documento Curricular
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-on-primary/10 hover:bg-on-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    <div className="z-10 mt-auto">
                        <h2 className="text-2xl font-bold leading-tight">{plan.nombre}</h2>
                        <p className="text-primary-container mt-1">{plan.materia} • {plan.año}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-surface-container-lowest">
                    {/* Fake Document Preview Header */}
                    <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-error/10 flex items-center justify-center text-error">
                                <span className="material-symbols-outlined">picture_as_pdf</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-on-surface truncate max-w-[200px] sm:max-w-[300px]">
                                    {plan.curriculumDocument?.fileName || 'Documento_Programa.pdf'}
                                </p>
                                <p className="text-[11px] text-outline">
                                    {plan.curriculumDocument?.size || '4.2 MB'} • Actualizado {plan.updatedAt}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                        </Button>
                    </div>

                    {/* Metadata */}
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-on-surface mb-2">Descripción General</h3>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                {plan.descripcion}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                Objetivos y Competencias
                            </h3>
                            <ul className="space-y-3">
                                {['Comprender los principios básicos de la disciplina.', 'Fomentar el análisis crítico y la investigación.', 'Aplicar conocimientos teóricos en trabajos prácticos.'].map((obj, i) => (
                                    <li key={i} className="flex items-start gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-3">
                                        <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                                        <span className="text-sm text-on-surface-variant mt-0.5">{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-surface-container rounded-xl p-4 flex items-start gap-3 border border-outline-variant">
                            <span className="material-symbols-outlined text-secondary">info</span>
                            <div>
                                <p className="text-sm font-semibold text-on-surface">Material oficial de ANEP</p>
                                <p className="text-xs text-on-surface-variant mt-1">Este documento fue subido por el equipo docente y corresponde a la malla curricular vigente para el año en curso.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
                    <Button variant="primary" className="w-full justify-center" onClick={onClose}>
                        Cerrar documento
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PlanDocumentQuickView;
