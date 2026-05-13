import { mockDb } from '../data/mockDb';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

const relativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} año(s)`;
};

export const coursePlanService = {
    /* ─── Course Plans ─── */

    getAll: (userId = 1, filters = {}) => {
        let plans = mockDb.coursePlans.filter(cp => cp.owner === userId);

        if (filters.search) {
            const q = filters.search.toLowerCase();
            plans = plans.filter(cp =>
                cp.nombre.toLowerCase().includes(q) ||
                cp.materia.toLowerCase().includes(q)
            );
        }

        if (filters.materia) {
            plans = plans.filter(cp => cp.materia === filters.materia);
        }

        if (filters.año) {
            plans = plans.filter(cp => cp.año === filters.año);
        }

        if (filters.ownership === 'shared') {
            plans = plans.filter(cp => cp.collaborators.length > 0);
        } else if (filters.ownership === 'own') {
            plans = plans.filter(cp => cp.collaborators.length === 0);
        }

        if (filters.status) {
            plans = plans.filter(cp => cp.status === filters.status);
        }

        return plans.map(cp => {
            const modules = mockDb.modules.filter(m => m.coursePlanId === cp.id);
            const totalClasses = modules.reduce((sum, m) => sum + m.classes.length, 0);
            const globalClasses = mockDb.globalOptionalClasses.filter(gc => gc.coursePlanId === cp.id);

            return {
                ...cp,
                modulesCount: modules.length,
                classesCount: totalClasses + globalClasses.length,
                collaboratorsCount: cp.collaborators.length,
                updatedAtRelative: relativeTime(cp.updatedAt),
            };
        });
    },

    getById: (coursePlanId) => {
        const cp = mockDb.coursePlans.find(c => c.id === coursePlanId);
        if (!cp) return null;

        const modules = mockDb.modules
            .filter(m => m.coursePlanId === coursePlanId)
            .sort((a, b) => a.order - b.order);
        const globalClasses = mockDb.globalOptionalClasses.filter(gc => gc.coursePlanId === coursePlanId);
        const totalClasses = modules.reduce((sum, m) => sum + m.classes.length, 0) + globalClasses.length;

        const mandatoryClasses = modules.reduce((sum, m) =>
            sum + m.classes.filter(c => c.type === 'mandatory').length, 0);
        const completedClasses = modules.reduce((sum, m) =>
            sum + m.classes.filter(c => c.shortDescription && c.shortDescription.length > 0).length, 0);
        const completionPercent = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0;

        const ownerUser = mockDb.users.find(u => u.id === cp.owner);

        return {
            ...cp,
            modules,
            globalClasses,
            modulesCount: modules.length,
            classesCount: totalClasses,
            mandatoryCount: mandatoryClasses,
            collaboratorsCount: cp.collaborators.length,
            completionPercent,
            ownerName: ownerUser?.name || 'Desconocido',
            updatedAtRelative: relativeTime(cp.updatedAt),
        };
    },

    create: (data) => {
        const newPlan = {
            id: generateId('cp'),
            nombre: data.nombre,
            materia: data.materia,
            año: data.año,
            descripcion: data.descripcion || '',
            owner: 1,
            collaborators: [],
            status: 'draft',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            curriculumDocument: null,
        };
        mockDb.coursePlans.push(newPlan);
        return newPlan;
    },

    update: (id, data) => {
        const idx = mockDb.coursePlans.findIndex(cp => cp.id === id);
        if (idx === -1) return null;
        mockDb.coursePlans[idx] = {
            ...mockDb.coursePlans[idx],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0],
        };
        return mockDb.coursePlans[idx];
    },

    duplicate: (id) => {
        const original = mockDb.coursePlans.find(cp => cp.id === id);
        if (!original) return null;

        const newId = generateId('cp');
        const newPlan = {
            ...original,
            id: newId,
            nombre: `${original.nombre} (copia)`,
            collaborators: [],
            status: 'draft',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
        };
        mockDb.coursePlans.push(newPlan);

        // Duplicate modules and classes
        const originalModules = mockDb.modules.filter(m => m.coursePlanId === id);
        originalModules.forEach(mod => {
            const newMod = {
                ...mod,
                id: generateId('mod'),
                coursePlanId: newId,
                classes: mod.classes.map(cls => ({
                    ...cls,
                    id: generateId('cls'),
                })),
            };
            mockDb.modules.push(newMod);
        });

        // Duplicate global classes
        const originalGlobal = mockDb.globalOptionalClasses.filter(gc => gc.coursePlanId === id);
        originalGlobal.forEach(gc => {
            mockDb.globalOptionalClasses.push({
                ...gc,
                id: generateId('goc'),
                coursePlanId: newId,
            });
        });

        return newPlan;
    },

    delete: (id) => {
        const idx = mockDb.coursePlans.findIndex(cp => cp.id === id);
        if (idx === -1) return false;
        mockDb.coursePlans.splice(idx, 1);
        // Clean up modules
        mockDb.modules = mockDb.modules.filter(m => m.coursePlanId !== id);
        mockDb.globalOptionalClasses = mockDb.globalOptionalClasses.filter(gc => gc.coursePlanId !== id);
        return true;
    },

    /* ─── Modules ─── */

    getModules: (coursePlanId) => {
        return mockDb.modules
            .filter(m => m.coursePlanId === coursePlanId)
            .sort((a, b) => a.order - b.order)
            .map(mod => {
                const mandatoryClasses = mod.classes.filter(c => c.type === 'mandatory');
                const optionalClasses = mod.classes.filter(c => c.type === 'optional');
                const evaluationClasses = mod.classes.filter(c => c.type === 'evaluation');
                const completedClasses = mod.classes.filter(c => c.shortDescription && c.shortDescription.length > 0);
                const hasIncomplete = mod.classes.some(c => !c.shortDescription || c.shortDescription.length === 0);

                return {
                    ...mod,
                    mandatoryClasses,
                    optionalClasses,
                    evaluationClasses,
                    totalClasses: mod.classes.length,
                    completedClasses: completedClasses.length,
                    progressPercent: mod.classes.length > 0
                        ? Math.round((completedClasses.length / mod.classes.length) * 100)
                        : 0,
                    hasIncomplete,
                };
            });
    },

    createModule: (coursePlanId, data) => {
        const existing = mockDb.modules.filter(m => m.coursePlanId === coursePlanId);
        const newModule = {
            id: generateId('mod'),
            coursePlanId,
            title: data.title,
            description: data.description || '',
            order: existing.length + 1,
            classes: [],
        };
        mockDb.modules.push(newModule);

        // Touch course updatedAt
        const cpIdx = mockDb.coursePlans.findIndex(cp => cp.id === coursePlanId);
        if (cpIdx !== -1) mockDb.coursePlans[cpIdx].updatedAt = new Date().toISOString().split('T')[0];

        return newModule;
    },

    updateModule: (moduleId, data) => {
        const idx = mockDb.modules.findIndex(m => m.id === moduleId);
        if (idx === -1) return null;
        mockDb.modules[idx] = { ...mockDb.modules[idx], ...data };
        return mockDb.modules[idx];
    },

    deleteModule: (moduleId) => {
        const idx = mockDb.modules.findIndex(m => m.id === moduleId);
        if (idx === -1) return false;
        mockDb.modules.splice(idx, 1);
        return true;
    },

    /* ─── Classes ─── */

    createClass: (moduleId, data) => {
        const modIdx = mockDb.modules.findIndex(m => m.id === moduleId);
        if (modIdx === -1) return null;
        const newClass = {
            id: generateId('cls'),
            title: data.title,
            shortDescription: data.shortDescription || '',
            type: data.type || 'mandatory',
            attachedDocuments: data.attachedDocuments || [],
            notes: data.notes || '',
            objectives: data.objectives || '',
            tags: data.tags || [],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            ...(data.type === 'evaluation' ? {
                evaluationData: {
                    fecha: data.evaluationData?.fecha || '',
                    ponderacion: data.evaluationData?.ponderacion || 0,
                    modalidad: data.evaluationData?.modalidad || 'escrita',
                    criterios: data.evaluationData?.criterios || '',
                }
            } : {}),
        };
        mockDb.modules[modIdx].classes.push(newClass);
        return newClass;
    },

    getClassById: (coursePlanId, moduleId, classId) => {
        const mod = mockDb.modules.find(m => m.id === moduleId && m.coursePlanId === coursePlanId);
        if (!mod) return null;
        const cls = mod.classes.find(c => c.id === classId);
        if (!cls) return null;
        const cp = mockDb.coursePlans.find(c => c.id === coursePlanId);
        const ownerUser = mockDb.users.find(u => u.id === cp?.owner);
        return {
            ...cls,
            moduleId: mod.id,
            moduleTitle: mod.title,
            moduleOrder: mod.order,
            coursePlanId: cp?.id,
            courseName: cp?.nombre || '',
            courseMateria: cp?.materia || '',
            courseAño: cp?.año || '',
            ownerName: ownerUser?.name || 'Desconocido',
            collaborators: cp?.collaborators || [],
        };
    },

    updateClass: (moduleId, classId, data) => {
        const modIdx = mockDb.modules.findIndex(m => m.id === moduleId);
        if (modIdx === -1) return null;
        const clsIdx = mockDb.modules[modIdx].classes.findIndex(c => c.id === classId);
        if (clsIdx === -1) return null;
        mockDb.modules[modIdx].classes[clsIdx] = {
            ...mockDb.modules[modIdx].classes[clsIdx],
            ...data,
            updatedAt: new Date().toISOString().split('T')[0],
        };
        return mockDb.modules[modIdx].classes[clsIdx];
    },

    deleteClass: (moduleId, classId) => {
        const modIdx = mockDb.modules.findIndex(m => m.id === moduleId);
        if (modIdx === -1) return false;
        mockDb.modules[modIdx].classes = mockDb.modules[modIdx].classes.filter(c => c.id !== classId);
        return true;
    },

    moveClass: (sourceModuleId, classId, targetModuleId) => {
        const srcIdx = mockDb.modules.findIndex(m => m.id === sourceModuleId);
        const tgtIdx = mockDb.modules.findIndex(m => m.id === targetModuleId);
        if (srcIdx === -1 || tgtIdx === -1) return false;

        const clsIdx = mockDb.modules[srcIdx].classes.findIndex(c => c.id === classId);
        if (clsIdx === -1) return false;

        const [cls] = mockDb.modules[srcIdx].classes.splice(clsIdx, 1);
        mockDb.modules[tgtIdx].classes.push(cls);
        return true;
    },

    /* ─── Global Optional Classes ─── */

    getGlobalClasses: (coursePlanId, search = '') => {
        let classes = mockDb.globalOptionalClasses.filter(gc => gc.coursePlanId === coursePlanId);
        if (search) {
            const q = search.toLowerCase();
            classes = classes.filter(gc =>
                gc.title.toLowerCase().includes(q) ||
                gc.shortDescription.toLowerCase().includes(q)
            );
        }
        return classes;
    },

    createGlobalClass: (coursePlanId, data) => {
        const newClass = {
            id: generateId('goc'),
            coursePlanId,
            title: data.title,
            shortDescription: data.shortDescription || '',
            type: 'optional',
            attachedDocuments: data.attachedDocuments || [],
            notes: data.notes || '',
            updatedAt: new Date().toISOString().split('T')[0],
        };
        mockDb.globalOptionalClasses.push(newClass);
        return newClass;
    },

    deleteGlobalClass: (classId) => {
        const idx = mockDb.globalOptionalClasses.findIndex(gc => gc.id === classId);
        if (idx === -1) return false;
        mockDb.globalOptionalClasses.splice(idx, 1);
        return true;
    },

    moveGlobalClassToModule: (globalClassId, targetModuleId) => {
        const gcIdx = mockDb.globalOptionalClasses.findIndex(gc => gc.id === globalClassId);
        if (gcIdx === -1) return false;
        const tgtIdx = mockDb.modules.findIndex(m => m.id === targetModuleId);
        if (tgtIdx === -1) return false;

        const gc = mockDb.globalOptionalClasses[gcIdx];
        const newClass = {
            id: generateId('cls'),
            title: gc.title,
            shortDescription: gc.shortDescription,
            type: 'optional',
            attachedDocuments: [...gc.attachedDocuments],
            notes: gc.notes,
            updatedAt: new Date().toISOString().split('T')[0],
        };
        mockDb.modules[tgtIdx].classes.push(newClass);
        mockDb.globalOptionalClasses.splice(gcIdx, 1);
        return true;
    },

    /* ─── Collaboration ─── */

    addCollaborator: (coursePlanId, email, role = 'viewer') => {
        const cpIdx = mockDb.coursePlans.findIndex(cp => cp.id === coursePlanId);
        if (cpIdx === -1) return null;

        const teacher = mockDb.availableTeachers.find(t => t.email === email);
        if (!teacher) return null;

        // Check if already collaborator
        if (mockDb.coursePlans[cpIdx].collaborators.some(c => c.id === teacher.id)) return null;

        const collab = { id: teacher.id, name: teacher.name, email: teacher.email, role, avatar: null };
        mockDb.coursePlans[cpIdx].collaborators.push(collab);
        return collab;
    },

    removeCollaborator: (coursePlanId, userId) => {
        const cpIdx = mockDb.coursePlans.findIndex(cp => cp.id === coursePlanId);
        if (cpIdx === -1) return false;
        mockDb.coursePlans[cpIdx].collaborators = mockDb.coursePlans[cpIdx].collaborators.filter(c => c.id !== userId);
        return true;
    },

    updateCollaboratorRole: (coursePlanId, userId, role) => {
        const cpIdx = mockDb.coursePlans.findIndex(cp => cp.id === coursePlanId);
        if (cpIdx === -1) return false;
        const collabIdx = mockDb.coursePlans[cpIdx].collaborators.findIndex(c => c.id === userId);
        if (collabIdx === -1) return false;
        mockDb.coursePlans[cpIdx].collaborators[collabIdx].role = role;
        return true;
    },

    searchTeachers: (query) => {
        if (!query || query.length < 2) return [];
        const q = query.toLowerCase();
        return mockDb.availableTeachers.filter(t =>
            t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
        );
    },

    /* ─── Helpers ─── */

    getAvailableMaterias: () => {
        const materias = [...new Set(mockDb.coursePlans.map(cp => cp.materia))];
        return materias.sort();
    },

    getAvailableAños: () => {
        return ['1°', '2°', '3°', '4°', '5°', '6°'];
    },

    getModulesForMoveTarget: (coursePlanId, excludeModuleId = null) => {
        return mockDb.modules
            .filter(m => m.coursePlanId === coursePlanId && m.id !== excludeModuleId)
            .sort((a, b) => a.order - b.order)
            .map(m => ({ id: m.id, title: m.title, order: m.order }));
    },

    relativeTime,
};
