import React, { useState, useMemo } from 'react';
import { Modal, Button } from '../Shared';
import { useAppStore } from '../../store/useAppStore';

const ImportClassModal = ({ isOpen, onClose, onImport, marketplaceClass }) => {
    const coursePlans = useAppStore(state => state.coursePlans);
    
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');

    const selectedPlan = useMemo(() => {
        return coursePlans.find(cp => String(cp.id) === String(selectedPlanId));
    }, [selectedPlanId, coursePlans]);

    const handleImport = () => {
        if (!selectedPlanId || !selectedModuleId) return;
        onImport(marketplaceClass.id, selectedPlanId, selectedModuleId);
        setSelectedPlanId('');
        setSelectedModuleId('');
    };

    const handleClose = () => {
        setSelectedPlanId('');
        setSelectedModuleId('');
        onClose();
    };

    if (!isOpen || !marketplaceClass) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Importar Clase"
            size="md"
            footer={
                <>
                    <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleImport} disabled={!selectedPlanId || !selectedModuleId}>
                        <span className="material-symbols-outlined text-[18px]">file_download</span>
                        Importar a mi planificación
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="bg-primary-container/20 border border-primary/10 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-on-surface">Vas a importar:</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                        <span className="font-bold">{marketplaceClass.title}</span> 
                        <span className="text-outline mx-2">|</span> 
                        {marketplaceClass.materia}
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                        1. Seleccionar Planificación
                    </label>
                    <select
                        value={selectedPlanId}
                        onChange={(e) => {
                            setSelectedPlanId(e.target.value);
                            setSelectedModuleId('');
                        }}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                    >
                        <option value="">Elegir planificación...</option>
                        {coursePlans.map(cp => (
                            <option key={cp.id} value={cp.id}>
                                {cp.nombre} ({cp.materia} - {cp.año})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedPlan && (
                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                            2. Seleccionar Módulo Destino
                        </label>
                        <select
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        >
                            <option value="">Elegir módulo...</option>
                            {(selectedPlan.modules || []).map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.order}. {m.title}
                                </option>
                            ))}
                        </select>
                        {(selectedPlan.modules || []).length === 0 && (
                            <p className="text-xs text-error mt-1">
                                Esta planificación no tiene módulos. Debes crear uno primero.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportClassModal;
