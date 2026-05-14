import { useAppStore } from '../store/useAppStore';
import { marketplaceRepository } from '../data/repositories';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const relativeTime = (dateStr) => {
    if (!dateStr) return 'Desconocido';
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} año(s)`;
};

const findPlanByModuleId = (moduleId) => {
    const state = useAppStore.getState();
    const mId = String(moduleId);
    return state.coursePlans.find(cp =>
        (cp.modules || []).some(m => String(m.id) === mId)
    ) || null;
};

// Build computed fields for a plan object
const enrichPlan = (cp) => {
    const modules = cp.modules || [];
    const totalClasses = modules.reduce((sum, m) => sum + (m.classes || []).length, 0);
    const mandatoryClasses = modules.reduce((sum, m) =>
        sum + (m.classes || []).filter(c => c.type === 'mandatory').length, 0
    );
    const collaborators = cp.collaborators || [];
    return {
        ...cp,
        modules,
        globalClasses: [], // kept for UI compatibility
        modulesCount: modules.length,
        classesCount: totalClasses,
        mandatoryCount: mandatoryClasses,
        collaboratorsCount: collaborators.length,
        collaborators,

        ownerName: cp.ownerName || 'Tú',
        updatedAtRelative: relativeTime(cp.updatedAt),
    };
};

export const coursePlanService = {

    /* ─── Own Plans (reads from Zustand store — sync & reactive) ─── */

    getAll: (userId, filters = {}) => {
        const state = useAppStore.getState();
        let plans = state.coursePlans; // already scoped to userId in store

        if (filters.search) {
            const q = filters.search.toLowerCase();
            plans = plans.filter(cp =>
                (cp.nombre || '').toLowerCase().includes(q) ||
                (cp.materia || '').toLowerCase().includes(q)
            );
        }
        if (filters.materia) plans = plans.filter(cp => cp.materia === filters.materia);
        if (filters.año)     plans = plans.filter(cp => cp.año === filters.año);
        if (filters.status)  plans = plans.filter(cp => cp.status === filters.status);
        if (filters.ownership === 'shared') plans = plans.filter(cp => cp.publishedToMarketplace);
        if (filters.ownership === 'own')    plans = plans.filter(cp => !cp.publishedToMarketplace);

        return plans.map(enrichPlan);
    },

    getById: (planId) => {
        const state = useAppStore.getState();
        const cp = state.coursePlans.find(c => c.id === planId);
        return cp ? enrichPlan(cp) : null;
    },

    create: async (data, userId) => {
        const newPlan = {
            id: generateId('cp'),
            nombre: data.nombre,
            materia: data.materia,
            año: data.año,
            descripcion: data.descripcion || '',
            userId,
            ownerName: data.ownerName || 'Tú',
            collaborators: [],
            modules: [],
            publishedToMarketplace: false,
            status: 'draft',
            curriculumDocument: {
                fileName: 'Compilación Programas 2do Ciclo.pdf',
                file: '/Compilacion_Programas_2do_Ciclo.pdf',
                uploadDate: new Date().toISOString(),
                size: '6.2 MB',
                version: '1.0'
            },
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        await useAppStore.getState().addCoursePlan(newPlan);
        return newPlan;
    },

    update: async (id, data) => {
        await useAppStore.getState().updateCoursePlan(id, data);
    },

    delete: async (id) => {
        await useAppStore.getState().deleteCoursePlan(id);
    },

    duplicate: async (id) => {
        const state = useAppStore.getState();
        const original = state.coursePlans.find(cp => cp.id === id);
        if (!original) return null;
        const newPlan = {
            ...original,
            id: generateId('cp'),
            nombre: `${original.nombre} (copia)`,
            publishedToMarketplace: false,
            status: 'draft',
            collaborators: [],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            modules: (original.modules || []).map(m => ({
                ...m,
                id: generateId('mod'),
                classes: (m.classes || []).map(c => ({ ...c, id: generateId('cls') })),
            })),
        };
        await useAppStore.getState().addCoursePlan(newPlan);
        return newPlan;
    },

    /* ─── Marketplace ─── */

    shareClass: async (coursePlanId, moduleId, classId, ownerName) => {
        const state = useAppStore.getState();
        const plan = state.coursePlans.find(cp => cp.id === coursePlanId);
        if (!plan) return null;
        const mod = (plan.modules || []).find(m => m.id === moduleId);
        if (!mod) return null;
        const cls = (mod.classes || []).find(c => c.id === classId);
        if (!cls) return null;

        const marketplaceClass = {
            ...cls,
            id: `mp-cls-${classId}`,
            originalClassId: classId,
            originalPlanId: plan.id,
            materia: plan.materia,
            año: plan.año,
            planNombre: plan.nombre,
            ownerName: ownerName || plan.ownerName || 'Anónimo',
            publishedAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        await marketplaceRepository.publish(marketplaceClass);
        // Marcamos la clase como publicada en el estado si hiciera falta
        const updatedModules = (plan.modules || []).map(m => 
            m.id === moduleId ? { ...m, classes: (m.classes || []).map(c => 
                c.id === classId ? { ...c, publishedToMarketplace: true } : c
            )} : m
        );
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
        return marketplaceClass;
    },

    getMarketplace: async (filters = {}) => {
        let items = await marketplaceRepository.getAll();
        
        // Extract available filters BEFORE filtering
        const availableMaterias = [...new Set(items.map(p => p.materia).filter(Boolean))].sort();
        const availableAños = [...new Set(items.map(p => p.año).filter(Boolean))].sort();

        if (filters.search) {
            const q = filters.search.toLowerCase();
            items = items.filter(p =>
                (p.title || '').toLowerCase().includes(q) ||
                (p.materia || '').toLowerCase().includes(q) ||
                (p.planNombre || '').toLowerCase().includes(q)
            );
        }
        if (filters.materia) items = items.filter(p => p.materia === filters.materia);
        if (filters.año)     items = items.filter(p => p.año === filters.año);

        const enrichedItems = items.map(p => ({
            ...p,
            updatedAtRelative: relativeTime(p.publishedAt || p.updatedAt),
        }));

        return {
            items: enrichedItems,
            availableMaterias,
            availableAños
        };
    },

    importClassFromMarketplace: async (marketplaceClassId, targetPlanId, targetModuleId) => {
        const sourceClass = await marketplaceRepository.getById(marketplaceClassId);
        if (!sourceClass) return null;
        
        const state = useAppStore.getState();
        const targetPlan = state.coursePlans.find(cp => cp.id === targetPlanId);
        if (!targetPlan) return null;

        const clonedClass = {
            ...sourceClass,
            id: generateId('cls'),
            originalClassId: undefined,
            originalPlanId: undefined,
            materia: undefined,
            año: undefined,
            type: sourceClass.type || 'mandatory',
            planNombre: undefined,
            ownerName: undefined,
            publishedAt: undefined,
            updatedAtRelative: undefined,
            clonedFrom: marketplaceClassId,
            clonedFromAuthor: sourceClass.ownerName,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        
        const updatedModules = (targetPlan.modules || []).map(m =>
            m.id === targetModuleId ? { ...m, classes: [...(m.classes || []), clonedClass] } : m
        );

        await useAppStore.getState().updateCoursePlan(targetPlan.id, { modules: updatedModules });
        return clonedClass;
    },

    /* ─── Modules (embedded in plan) ─── */

    getModules: (coursePlanId) => {
        const state = useAppStore.getState();
        const cpId = String(coursePlanId);
        const plan = state.coursePlans.find(cp => String(cp.id) === cpId);
        if (!plan) return [];
        return (plan.modules || [])
            .sort((a, b) => a.order - b.order)
            .map(mod => {
                const mandatory  = (mod.classes || []).filter(c => c.type === 'mandatory');
                const optional   = (mod.classes || []).filter(c => c.type === 'optional');
                const evaluation = (mod.classes || []).filter(c => c.type === 'evaluation');
                return {
                    ...mod,
                    mandatoryClasses: mandatory,
                    optionalClasses:  optional,
                    evaluationClasses: evaluation,
                    totalClasses: (mod.classes || []).length,
                };
            });
    },

    createModule: async (coursePlanId, data) => {
        const state = useAppStore.getState();
        const plan = state.coursePlans.find(cp => cp.id === coursePlanId);
        if (!plan) return null;
        const newModule = {
            id: generateId('mod'),
            title: data.title,
            description: data.description || '',
            order: (plan.modules || []).length + 1,
            classes: [],
        };
        const updatedModules = [...(plan.modules || []), newModule];
        await useAppStore.getState().updateCoursePlan(coursePlanId, { modules: updatedModules });
        return newModule;
    },

    updateModule: async (moduleId, data) => {
        const plan = findPlanByModuleId(moduleId);
        if (!plan) return null;
        const updatedModules = (plan.modules || []).map(m =>
            m.id === moduleId ? { ...m, ...data } : m
        );
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
    },

    deleteModule: async (moduleId) => {
        const plan = findPlanByModuleId(moduleId);
        if (!plan) return false;
        const updatedModules = (plan.modules || []).filter(m => m.id !== moduleId);
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
        return true;
    },

    /* ─── Classes (embedded in modules) ─── */

    createClass: async (moduleId, data) => {
        const plan = findPlanByModuleId(moduleId);
        if (!plan) return null;
        const newClass = {
            id: generateId('cls'),
            title: data.title,
            shortDescription: data.shortDescription || '',
            type: data.type || 'mandatory',
            attachedDocuments: data.attachedDocuments || [],
            notes: data.notes || '',
            objectives: data.objectives || '',
            tags: [],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            ...(data.type === 'evaluation' ? { evaluationData: data.evaluationData || {} } : {}),
        };
        const updatedModules = (plan.modules || []).map(m =>
            m.id === moduleId ? { ...m, classes: [...(m.classes || []), newClass] } : m
        );
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
        return newClass;
    },

    getClassById: (coursePlanId, moduleId, classId) => {
        const state = useAppStore.getState();
        const cpId = String(coursePlanId);
        const mId = String(moduleId);
        const cId = String(classId);

        const plan = state.coursePlans.find(cp => String(cp.id) === cpId);
        if (!plan) return null;
        const mod = (plan.modules || []).find(m => String(m.id) === mId);
        if (!mod) return null;
        const cls = (mod.classes || []).find(c => String(c.id) === cId);
        if (!cls) return null;
        return {
            ...cls,
            moduleId: mod.id,
            moduleTitle: mod.title,
            moduleOrder: mod.order,
            coursePlanId: plan.id,
            courseName: plan.nombre,
            courseMateria: plan.materia,
            courseAño: plan.año,
            ownerName: plan.ownerName || 'Tú',
            collaborators: plan.collaborators || [],
        };
    },

    updateClass: async (moduleId, classId, data) => {
        const plan = findPlanByModuleId(moduleId);
        if (!plan) return null;
        const updatedModules = (plan.modules || []).map(m =>
            m.id === moduleId
                ? { ...m, classes: (m.classes || []).map(c =>
                    c.id === classId ? { ...c, ...data, updatedAt: new Date().toISOString().split('T')[0] } : c
                )}
                : m
        );
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
    },

    deleteClass: async (moduleId, classId) => {
        const plan = findPlanByModuleId(moduleId);
        if (!plan) return false;
        const updatedModules = (plan.modules || []).map(m =>
            m.id === moduleId
                ? { ...m, classes: (m.classes || []).filter(c => c.id !== classId) }
                : m
        );
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
        return true;
    },

    moveClass: async (sourceModuleId, classId, targetModuleId) => {
        const plan = findPlanByModuleId(sourceModuleId);
        if (!plan) return false;
        let classToMove = null;
        const step1 = (plan.modules || []).map(m => {
            if (m.id === sourceModuleId) {
                classToMove = (m.classes || []).find(c => c.id === classId);
                return { ...m, classes: (m.classes || []).filter(c => c.id !== classId) };
            }
            return m;
        });
        if (!classToMove) return false;
        const updatedModules = step1.map(m =>
            m.id === targetModuleId
                ? { ...m, classes: [...(m.classes || []), classToMove] }
                : m
        );
        await useAppStore.getState().updateCoursePlan(plan.id, { modules: updatedModules });
        return true;
    },

    /* ─── Global Optional Classes (stub — kept for UI compatibility) ─── */

    getGlobalClasses: () => [],
    createGlobalClass: async () => null,
    deleteGlobalClass: async () => false,
    moveGlobalClassToModule: async () => false,

    /* ─── Collaboration ─── */

    addCollaborator: async (coursePlanId, email, role = 'viewer') => {
        const state = useAppStore.getState();
        const cpId = String(coursePlanId);
        const plan = state.coursePlans.find(cp => String(cp.id) === cpId);
        if (!plan) return null;
        const already = (plan.collaborators || []).some(c => c.email === email);
        if (already) return null;
        const collab = { id: generateId('collab'), email, name: email, role };
        const updatedCollabs = [...(plan.collaborators || []), collab];
        await useAppStore.getState().updateCoursePlan(coursePlanId, { collaborators: updatedCollabs });
        return collab;
    },

    removeCollaborator: async (coursePlanId, collabId) => {
        const state = useAppStore.getState();
        const cpId = String(coursePlanId);
        const plan = state.coursePlans.find(cp => String(cp.id) === cpId);
        if (!plan) return false;
        const updated = (plan.collaborators || []).filter(c => c.id !== collabId);
        await useAppStore.getState().updateCoursePlan(coursePlanId, { collaborators: updated });
        return true;
    },

    searchTeachers: (query) => {
        if (!query || query.length < 2) return [];
        // Stub — in a real app this would query a user directory
        return [{ id: 'mock-t1', name: 'Ana García', email: 'ana@edu.uy' }]
            .filter(t => t.name.toLowerCase().includes(query.toLowerCase()) || t.email.includes(query));
    },

    /* ─── Helpers ─── */

    getAvailableMaterias: () => {
        const state = useAppStore.getState();
        return [...new Set(state.coursePlans.map(cp => cp.materia).filter(Boolean))].sort();
    },

    getAvailableAños: () => ['1°', '2°', '3°', '4°', '5°', '6°'],

    getModulesForMoveTarget: (coursePlanId, excludeModuleId = null) => {
        const state = useAppStore.getState();
        const cpId = String(coursePlanId);
        const plan = state.coursePlans.find(cp => String(cp.id) === cpId);
        if (!plan) return [];
        return (plan.modules || [])
            .filter(m => m.id !== excludeModuleId)
            .sort((a, b) => a.order - b.order)
            .map(m => ({ id: m.id, title: m.title, order: m.order }));
    },

    relativeTime,
};
