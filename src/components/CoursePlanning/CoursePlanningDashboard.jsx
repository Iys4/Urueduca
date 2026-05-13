import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button, EmptyState, SearchInput, FilterChips } from '../Shared';
import CourseCard from './CourseCard';
import MarketplaceCard from './MarketplaceCard';
import CreateCourseModal from './CreateCourseModal';
import { coursePlanService } from '../../services/coursePlanService';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';

const TABS = [
    { key: 'own',         label: 'Mis planificaciones', icon: 'person'        },
    { key: 'marketplace', label: 'Mercado',              icon: 'storefront'    },
];

const CoursePlanningDashboard = () => {
    const currentUser  = useAuthStore(state => state.currentUser);
    const coursePlans  = useAppStore(state => state.coursePlans); // reactive

    const [activeTab,       setActiveTab]       = useState('own');
    const [search,          setSearch]          = useState('');
    const [filterMateria,   setFilterMateria]   = useState(null);
    const [filterAño,       setFilterAño]       = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Marketplace async state
    const [mpPlans,   setMpPlans]   = useState([]);
    const [mpLoading, setMpLoading] = useState(false);
    const [mpSearch,  setMpSearch]  = useState('');

    const loadMarketplace = useCallback(async () => {
        setMpLoading(true);
        try {
            const plans = await coursePlanService.getMarketplace({ search: mpSearch });
            setMpPlans(plans);
        } finally {
            setMpLoading(false);
        }
    }, [mpSearch]);

    useEffect(() => {
        if (activeTab === 'marketplace') loadMarketplace();
    }, [activeTab, loadMarketplace]);

    // Own plans — computed from store (reactive)
    const ownPlans = useMemo(() => {
        return coursePlanService.getAll(currentUser?.id, {
            search: search,
            materia: filterMateria,
            año: filterAño,
        });
    }, [coursePlans, currentUser, search, filterMateria, filterAño]);

    const materiaFilters = useMemo(() => {
        const materias = [...new Set(coursePlans.map(c => c.materia).filter(Boolean))];
        return materias.map(m => ({ label: m, value: m }));
    }, [coursePlans]);

    const añoFilters = useMemo(() => {
        const años = [...new Set(coursePlans.map(c => c.año).filter(Boolean))].sort();
        return años.map(a => ({ label: a, value: a }));
    }, [coursePlans]);

    const handleDuplicate = useCallback((id) => {
        coursePlanService.duplicate(id);
    }, []);

    const handleDelete = useCallback((id) => {
        coursePlanService.delete(id);
    }, []);

    const handleShare = useCallback(async (id) => {
        await coursePlanService.share(id, currentUser?.name);
        // Reload marketplace if visible
        if (activeTab === 'marketplace') loadMarketplace();
    }, [currentUser, activeTab, loadMarketplace]);

    const handleClone = useCallback(async (marketplacePlanId) => {
        await coursePlanService.cloneFromMarketplace(marketplacePlanId, currentUser?.id, currentUser?.name);
        setActiveTab('own');
    }, [currentUser]);

    const hasFilters = search || filterMateria || filterAño;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">Planificaciones</h1>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                        Tus cursos reutilizables y el mercado compartido
                    </p>
                </div>
                {activeTab === 'own' && (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Nueva planificación
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-full sm:w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === tab.key
                                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                                : 'text-outline hover:text-on-surface'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                        {tab.label}
                        {tab.key === 'own' && coursePlans.length > 0 && (
                            <span className="text-[11px] bg-primary text-on-primary rounded-full px-1.5 py-0.5 leading-none font-bold">
                                {coursePlans.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── OWN PLANS TAB ── */}
            {activeTab === 'own' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Buscar por nombre o materia..."
                            className="flex-1 max-w-md"
                        />
                        {hasFilters && (
                            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterMateria(null); setFilterAño(null); }}>
                                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                                Limpiar
                            </Button>
                        )}
                    </div>

                    {(materiaFilters.length > 1 || añoFilters.length > 1) && (
                        <div className="flex flex-wrap items-center gap-3">
                            {materiaFilters.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Materia:</span>
                                    <FilterChips filters={materiaFilters} activeFilter={filterMateria} onChange={setFilterMateria} />
                                </div>
                            )}
                            {añoFilters.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Año:</span>
                                    <FilterChips filters={añoFilters} activeFilter={filterAño} onChange={setFilterAño} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grid */}
                    {ownPlans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {ownPlans.map(course => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onDuplicate={handleDuplicate}
                                    onDelete={handleDelete}
                                    onShare={handleShare}
                                />
                            ))}
                        </div>
                    ) : hasFilters ? (
                        <EmptyState
                            icon="filter_alt"
                            title="Sin resultados"
                            description="No hay planificaciones con estos filtros."
                            action={<Button variant="outline" onClick={() => { setSearch(''); setFilterMateria(null); setFilterAño(null); }}>Limpiar filtros</Button>}
                        />
                    ) : (
                        <EmptyState
                            icon="auto_stories"
                            title="Aún no tenés planificaciones"
                            description="Creá una nueva o explorá el Mercado para clonar una planificación de otro profe."
                            action={
                                <div className="flex gap-3">
                                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                        Crear planificación
                                    </Button>
                                    <Button variant="outline" onClick={() => setActiveTab('marketplace')}>
                                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                                        Ver Mercado
                                    </Button>
                                </div>
                            }
                        />
                    )}
                </div>
            )}

            {/* ── MARKETPLACE TAB ── */}
            {activeTab === 'marketplace' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-primary-container/30 border border-primary/20 rounded-xl">
                        <span className="material-symbols-outlined text-[24px] text-primary">storefront</span>
                        <p className="text-sm text-on-surface-variant">
                            Clases individuales y recursos pedagógicos compartidos por otros profesores. Clonalos y editalos libremente.
                        </p>
                    </div>

                    <SearchInput
                        value={mpSearch}
                        onChange={setMpSearch}
                        placeholder="Buscar en el mercado..."
                        className="max-w-md"
                    />

                    {mpLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton h-52 rounded-xl" />)}
                        </div>
                    ) : mpPlans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {mpPlans.map(plan => (
                                <MarketplaceCard
                                    key={plan.id}
                                    plan={plan}
                                    onClone={handleClone}
                                    alreadyCloned={coursePlans.some(cp => cp.clonedFrom === plan.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="storefront"
                            title="Mercado vacío"
                            description="Aún no hay planificaciones publicadas. ¡Sé el primero en compartir la tuya!"
                        />
                    )}
                </div>
            )}

            {/* FAB */}
            {activeTab === 'own' && coursePlans.length > 0 && (
                <div className="fixed bottom-24 lg:bottom-8 right-6 z-40">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-14 h-14 rounded-2xl bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover active:scale-95 flex items-center justify-center transition-all duration-200"
                        aria-label="Crear nueva planificación"
                    >
                        <span className="material-symbols-outlined text-[28px]">add</span>
                    </button>
                </div>
            )}

            <CreateCourseModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => {}}
                userId={currentUser?.id}
                ownerName={currentUser?.name}
            />
        </div>
    );
};

export default CoursePlanningDashboard;
