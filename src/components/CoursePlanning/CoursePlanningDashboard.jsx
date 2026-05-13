import React, { useState, useMemo, useCallback } from 'react';
import { Button, EmptyState, SearchInput, FilterChips } from '../Shared';
import CourseCard from './CourseCard';
import CreateCourseModal from './CreateCourseModal';
import { coursePlanService } from '../../services/coursePlanService';

const CoursePlanningDashboard = () => {
    const [search, setSearch] = useState('');
    const [filterMateria, setFilterMateria] = useState(null);
    const [filterAño, setFilterAño] = useState(null);
    const [filterOwnership, setFilterOwnership] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

    const courses = useMemo(() => {
        return coursePlanService.getAll(1, {
            search,
            materia: filterMateria,
            año: filterAño,
            ownership: filterOwnership,
        });
    }, [search, filterMateria, filterAño, filterOwnership, refreshKey]);

    const allCourses = useMemo(() => coursePlanService.getAll(1), [refreshKey]);

    const materiaFilters = useMemo(() => {
        const materias = [...new Set(allCourses.map(c => c.materia))];
        return materias.map(m => ({
            label: m,
            value: m,
            count: allCourses.filter(c => c.materia === m).length,
        }));
    }, [allCourses]);

    const añoFilters = useMemo(() => {
        const años = [...new Set(allCourses.map(c => c.año))].sort();
        return años.map(a => ({ label: a, value: a }));
    }, [allCourses]);

    const ownershipFilters = [
        { label: 'Propios', value: 'own', icon: 'person' },
        { label: 'Compartidos', value: 'shared', icon: 'group' },
    ];

    const handleDuplicate = (id) => {
        coursePlanService.duplicate(id);
        refresh();
    };

    const handleDelete = (id) => {
        coursePlanService.delete(id);
        refresh();
    };

    const hasActiveFilters = search || filterMateria || filterAño || filterOwnership;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">Mis Cursos</h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        Planificaciones pedagógicas reutilizables
                    </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container">
                        <span className="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
                        <span className="font-bold text-on-surface">{allCourses.length}</span>
                        <span className="text-on-surface-variant">cursos</span>
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar por nombre o materia..."
                        className="flex-1 max-w-md"
                    />
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setFilterMateria(null);
                                setFilterAño(null);
                                setFilterOwnership(null);
                            }}
                        >
                            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {materiaFilters.length > 1 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Materia:</span>
                            <FilterChips
                                filters={materiaFilters}
                                activeFilter={filterMateria}
                                onChange={setFilterMateria}
                            />
                        </div>
                    )}

                    {añoFilters.length > 1 && (
                        <>
                            <div className="w-px h-5 bg-outline-variant hidden sm:block" />
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Año:</span>
                                <FilterChips
                                    filters={añoFilters}
                                    activeFilter={filterAño}
                                    onChange={setFilterAño}
                                />
                            </div>
                        </>
                    )}

                    <div className="w-px h-5 bg-outline-variant hidden sm:block" />
                    <FilterChips
                        filters={ownershipFilters}
                        activeFilter={filterOwnership}
                        onChange={setFilterOwnership}
                    />
                </div>
            </div>

            {/* Course Grid */}
            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : hasActiveFilters ? (
                <EmptyState
                    icon="filter_alt"
                    title="Sin resultados"
                    description="No se encontraron cursos con estos filtros. Probá ajustando la búsqueda."
                    action={
                        <Button variant="outline" onClick={() => { setSearch(''); setFilterMateria(null); setFilterAño(null); setFilterOwnership(null); }}>
                            Limpiar filtros
                        </Button>
                    }
                />
            ) : (
                <EmptyState
                    icon="auto_stories"
                    title="Creá tu primer curso"
                    description="Las planificaciones de curso son reutilizables y se pueden aplicar a múltiples grupos."
                    action={
                        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Crear Curso
                        </Button>
                    }
                />
            )}

            {/* Floating Action Button */}
            {allCourses.length > 0 && (
                <div className="fixed bottom-24 lg:bottom-8 right-6 z-40">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-14 h-14 rounded-2xl bg-primary text-on-primary shadow-lg hover:shadow-xl
                                   hover:bg-primary-hover active:scale-95
                                   flex items-center justify-center transition-all duration-200
                                   focus-ring"
                        aria-label="Crear nuevo curso"
                    >
                        <span className="material-symbols-outlined text-[28px]">add</span>
                    </button>
                </div>
            )}

            {/* Create Modal */}
            <CreateCourseModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => refresh()}
            />
        </div>
    );
};

export default CoursePlanningDashboard;
