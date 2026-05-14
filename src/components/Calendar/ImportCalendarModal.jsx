import React, { useState } from 'react';
import { Modal, Button } from '../Shared';
import { calendarService } from '../../services/calendarService';

const ImportCalendarModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [importSource, setImportSource] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleSelectSource = (source) => {
        setImportSource(source);
        setStep(2);
    };

    const handleImportMock = () => {
        setIsImporting(true);
        setTimeout(() => {
            // Mock imported events logic
            const mockEvents = [
                { title: 'Día del Estudiante (Asueto)', date: '2026-09-21', description: 'Asueto a nivel nacional' },
                { title: 'Reunión ATD (Nacional)', date: '2026-06-15', description: 'Asamblea Técnico Docente' },
            ];
            const count = calendarService.importCalendar(importSource, mockEvents);
            setIsImporting(false);
            setImportResult(count);
            setStep(3);
        }, 1500);
    };

    const resetAndClose = () => {
        setStep(1);
        setImportSource(null);
        setImportResult(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            title="Importar Calendario Externo"
            size="md"
            footer={
                step === 3 ? (
                    <Button variant="primary" onClick={resetAndClose} className="w-full justify-center">Listo</Button>
                ) : (
                    <>
                        <Button variant="ghost" onClick={resetAndClose} disabled={isImporting}>Cancelar</Button>
                        {step === 2 && (
                            <Button variant="primary" onClick={handleImportMock} disabled={isImporting}>
                                {isImporting ? 'Conectando...' : 'Conectar e Importar'}
                            </Button>
                        )}
                    </>
                )
            }
        >
            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-sm text-on-surface-variant">Seleccioná la fuente desde la que querés importar tus eventos para centralizarlos en EducaAmigo.</p>
                    
                    <div className="space-y-2">
                        <button onClick={() => handleSelectSource('google')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container hover:border-primary transition-all group text-left">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div>
                                <h4 className="text-sm font-bold text-on-surface">Google Calendar</h4>
                                <p className="text-xs text-on-surface-variant">Conectar cuenta de Google Workspace</p>
                            </div>
                        </button>

                        <button onClick={() => handleSelectSource('outlook')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container hover:border-primary transition-all group text-left">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook Calendar" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <div>
                                <h4 className="text-sm font-bold text-on-surface">Outlook / Office 365</h4>
                                <p className="text-xs text-on-surface-variant">Conectar cuenta institucional Microsoft</p>
                            </div>
                        </button>

                        <button onClick={() => handleSelectSource('ics')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container hover:border-primary transition-all group text-left">
                            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">upload_file</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-on-surface">Subir archivo .ics</h4>
                                <p className="text-xs text-on-surface-variant">iCal, Apple Calendar, Moodle</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="py-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary-container mx-auto flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-[32px] text-primary">sync</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface">Conectando con {importSource === 'ics' ? 'Archivo' : importSource === 'google' ? 'Google' : 'Outlook'}</h3>
                        <p className="text-sm text-on-surface-variant mt-2 max-w-xs mx-auto">
                            Al conectar, EducaAmigo importará tus eventos futuros para que puedas ver todo en un solo lugar.
                        </p>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="py-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-success/20 mx-auto flex items-center justify-center text-success">
                        <span className="material-symbols-outlined text-[32px]">check_circle</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface">¡Importación exitosa!</h3>
                        <p className="text-sm text-on-surface-variant mt-2">
                            Se sincronizaron <strong>{importResult} eventos</strong> correctamente con tu Calendario Académico.
                        </p>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ImportCalendarModal;
