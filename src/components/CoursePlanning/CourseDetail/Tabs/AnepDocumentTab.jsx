import React, { useState } from 'react';
import { Button, Badge, FileUploader } from '../../../Shared';

const AnepDocumentTab = ({ course, onRefresh }) => {
    const doc = course.curriculumDocument || {
        fileName: 'Compilación Programas 2do Ciclo.pdf',
        file: '/Compilacion_Programas_2do_Ciclo.pdf',
        uploadDate: new Date('2026-05-14T00:00:00Z').toISOString(),
        size: '6.2 MB',
        version: '1.0 (Por defecto)'
    };
    const [showUpload, setShowUpload] = useState(false);

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header Banner */}
            <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-primary-container/40 to-primary-container/10 border border-primary/15">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[32px] text-primary">verified</span>
                </div>
                <div>
                    <h3 className="text-base font-bold text-on-surface">Documento Curricular ANEP</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                        Programa oficial de la Administración Nacional de Educación Pública
                    </p>
                </div>
            </div>

            {/* ─── Document Loaded ─── */}
            <div className="space-y-4">
                {/* Document Card */}
                <div className="bg-surface-container/30 rounded-xl p-5 border border-outline-variant">
                    <div className="flex items-start gap-4">
                        {/* PDF Icon */}
                        <div className="w-16 h-20 rounded-lg bg-error/10 flex flex-col items-center justify-center shrink-0 border border-error/20">
                            <span className="material-symbols-outlined text-[28px] text-error">picture_as_pdf</span>
                            <span className="text-[9px] font-bold text-error mt-0.5">PDF</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-on-surface mb-1">{doc.fileName}</h4>
                            <p className="text-xs text-on-surface-variant mb-3 truncate">{doc.file}</p>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[14px] text-outline">calendar_today</span>
                                    Subido: {new Date(doc.uploadDate).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[14px] text-outline">storage</span>
                                    {doc.size}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Version Badge */}
                    <div className="mt-4 pt-4 border-t border-outline-variant/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="primary" icon="history">
                                Versión: {doc.version}
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            <a href={doc.file} download className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all bg-surface-container hover:bg-surface-container-high text-on-surface">
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Descargar
                            </a>
                            <a href={doc.file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all bg-surface-container hover:bg-surface-container-high text-on-surface">
                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                Ver
                            </a>
                        </div>
                    </div>
                </div>

                    {/* Update Version */}
                    <div className="bg-surface-container/20 rounded-xl p-4 border border-dashed border-outline-variant">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-on-surface">¿Nueva versión disponible?</p>
                                <p className="text-xs text-on-surface-variant">Subí una nueva versión del documento ANEP</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
                                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                                Actualizar
                            </Button>
                        </div>

                        {showUpload && (
                            <div className="mt-4 pt-4 border-t border-outline-variant/50">
                                <FileUploader
                                    files={[]}
                                    onChange={() => {}}
                                    label="Nuevo documento"
                                    maxFiles={1}
                                    accept=".pdf"
                                />
                            </div>
                        )}
                    </div>
                </div>
        </div>
    );
};

export default AnepDocumentTab;
