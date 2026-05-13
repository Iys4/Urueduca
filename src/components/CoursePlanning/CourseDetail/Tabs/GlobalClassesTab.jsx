import React, { useState, useMemo } from 'react';
import { Button, EmptyState, SearchInput } from '../../../Shared';
import ClassPlanCard from './ClassPlanCard';
import CreateClassModal from './CreateClassModal';
import { coursePlanService } from '../../../../services/coursePlanService';

const GlobalClassesTab = ({ coursePlanId, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    const classes = useMemo(
        () => coursePlanService.getGlobalClasses(coursePlanId, search),
        [coursePlanId, search, onRefresh]
    );

    const modules = coursePlanService.getModulesForMoveTarget(coursePlanId);

    const handleCreate = (data) => {
        coursePlanService.createGlobalClass(coursePlanId, data);
        onRefresh();
    };

    if (classes.length === 0 && !search) {
        return (
            <>
                <EmptyState
                    icon="library_books"
                    title="Sin clases opcionales globales"
                    description="Las clases globales no pertenecen a ningún módulo. Son reutilizables para todo el año y podés moverlas a cualquier módulo cuando quieras."
                    action={
                        <Button variant="primary" onClick={() => setShowCreate(true)}>
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Agregar Clase Global
                        </Button>
                    }
                />
                <CreateClassModal
                    isOpen={showCreate}
                    onClose={() => setShowCreate(false)}
                    onCreated={handleCreate}
                    defaultType="optional"
                />
            </>
        );
    }

    return (
        <div className="space-y-4">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-primary-container/20 border border-primary/10">
                <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">info</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                    Estas clases no pertenecen a ningún módulo. Son una <span className="font-semibold text-on-surface">biblioteca reutilizable</span> para todo el año. 
                    Podés moverlas a cualquier módulo desde el menú de cada clase.
                </p>
            </div>

            {/* Search + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar clase global..."
                    className="w-full sm:max-w-xs"
                />
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Agregar Clase Global
                </Button>
            </div>

            {/* Classes Grid */}
            {classes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {classes.map(cls => (
                        <ClassPlanCard
                            key={cls.id}
                            cls={cls}
                            coursePlanId={coursePlanId}
                            onRefresh={onRefresh}
                            isGlobal
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-sm text-on-surface-variant">
                    No se encontraron clases con "{search}"
                </div>
            )}

            <CreateClassModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={handleCreate}
                defaultType="optional"
            />
        </div>
    );
};

export default GlobalClassesTab;
