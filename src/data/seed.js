import { 
    userRepository, 
    courseRepository, 
    moduleRepository, 
    studentRepository, 
    lessonRepository, 
    evaluationRepository,
    calendarRepository,
    marketplaceRepository,
} from './repositories';
import bcrypt from 'bcryptjs';
import { getDB, STORES } from './db';
import { mockDb } from './mockDb';

// ─── Marketplace example plans ───────────────────────────────────────────────
const MARKETPLACE_PLANS = [
    {
        id: 'mp-bio-4-celula',
        nombre: 'Biología 4to — Célula y Metabolismo',
        materia: 'Biología',
        año: '4°',
        descripcion: 'Planificación completa de la unidad de célula y metabolismo para 4to año. Incluye teoría, prácticas de laboratorio y evaluaciones.',
        ownerName: 'Sistema UruEduca',
        ownerId: 'system',
        publishedAt: '2026-01-15',
        updatedAt: '2026-01-15',
        status: 'active',
        modules: [
            {
                id: 'mp-mod-1',
                title: 'Unidad 1: La Célula',
                description: 'Estructura y función celular',
                order: 1,
                classes: [
                    { id: 'mp-cls-1', title: 'Teoría celular', type: 'mandatory', objectives: 'Conocer procariontas y eucariontas', shortDescription: 'Historia e introducción a la teoría celular.' },
                    { id: 'mp-cls-2', title: 'Organelos celulares', type: 'mandatory', objectives: 'Identificar organelos y sus funciones', shortDescription: 'Estudio de mitocondrias, cloroplastos, núcleo y ribosomas.' },
                    { id: 'mp-cls-3', title: 'Práctica de microscopía', type: 'optional', objectives: 'Observar células al microscopio', shortDescription: 'Laboratorio: observación de células vegetales y animales.' },
                    { id: 'mp-cls-4', title: 'Prueba de Célula', type: 'evaluation', shortDescription: 'Evaluación escrita del módulo.', evaluationData: { modalidad: 'escrita', ponderacion: 30 } },
                ],
            },
            {
                id: 'mp-mod-2',
                title: 'Unidad 2: Metabolismo Celular',
                description: 'Fotosíntesis y respiración celular',
                order: 2,
                classes: [
                    { id: 'mp-cls-5', title: 'Fotosíntesis', type: 'mandatory', objectives: 'Comprender la fase luminosa y oscura', shortDescription: 'Ciclo de Calvin y reacciones de la luz.' },
                    { id: 'mp-cls-6', title: 'Respiración celular', type: 'mandatory', objectives: 'Glucólisis y ciclo de Krebs', shortDescription: 'Obtención de ATP a partir de glucosa.' },
                    { id: 'mp-cls-7', title: 'Laboratorio de Fotosíntesis', type: 'evaluation', shortDescription: 'Práctica observando Elodea.', evaluationData: { modalidad: 'práctica', ponderacion: 20 } },
                ],
            },
        ],
    },
    {
        id: 'mp-hist-rev-ind',
        nombre: 'Historia 3ro — Revolución Industrial',
        materia: 'Historia',
        año: '3°',
        descripcion: 'Unidad sobre la Revolución Industrial: causas, desarrollo y consecuencias sociales. Enfocada en el análisis de fuentes primarias.',
        ownerName: 'Sistema UruEduca',
        ownerId: 'system',
        publishedAt: '2026-01-20',
        updatedAt: '2026-01-20',
        status: 'active',
        modules: [
            {
                id: 'mp-mod-3',
                title: 'Unidad 1: Contexto y Causas',
                description: 'Europa pre-industrial',
                order: 1,
                classes: [
                    { id: 'mp-cls-8', title: 'Europa antes de la industria', type: 'mandatory', objectives: 'Describir la economía agraria del siglo XVIII', shortDescription: 'Análisis del modo de producción pre-industrial.' },
                    { id: 'mp-cls-9', title: 'Causas de la Revolución Industrial', type: 'mandatory', objectives: 'Identificar factores tecnológicos, económicos y sociales', shortDescription: 'El papel de Inglaterra: carbón, vapor y textiles.' },
                ],
            },
            {
                id: 'mp-mod-4',
                title: 'Unidad 2: Consecuencias Sociales',
                description: 'Transformaciones de la sociedad',
                order: 2,
                classes: [
                    { id: 'mp-cls-10', title: 'Surgimiento del proletariado', type: 'mandatory', objectives: 'Describir las condiciones laborales de la época', shortDescription: 'Trabajo infantil, jornadas laborales y condiciones de vida.' },
                    { id: 'mp-cls-11', title: 'Movimiento obrero', type: 'mandatory', objectives: 'Comprender el origen del sindicalismo', shortDescription: 'Los primeros sindicatos y sus demandas.' },
                    { id: 'mp-cls-12', title: 'Trabajo con fuentes primarias', type: 'evaluation', shortDescription: 'Análisis de documentos de la época en grupo.', evaluationData: { modalidad: 'proyecto', ponderacion: 25 } },
                ],
            },
        ],
    },
    {
        id: 'mp-mat-funciones',
        nombre: 'Matemática 5to — Funciones y Límites',
        materia: 'Matemática',
        año: '5°',
        descripcion: 'Introducción al concepto de función, tipos de funciones y límites. Base para el pre-cálculo.',
        ownerName: 'Sistema UruEduca',
        ownerId: 'system',
        publishedAt: '2026-02-01',
        updatedAt: '2026-02-01',
        status: 'active',
        modules: [
            {
                id: 'mp-mod-5',
                title: 'Unidad 1: Funciones',
                description: 'Concepto y tipos de funciones',
                order: 1,
                classes: [
                    { id: 'mp-cls-13', title: 'Definición de función', type: 'mandatory', objectives: 'Entender dominio, codominio e imagen', shortDescription: 'Representación algebraica y gráfica.' },
                    { id: 'mp-cls-14', title: 'Funciones lineales y cuadráticas', type: 'mandatory', objectives: 'Graficar y analizar funciones', shortDescription: 'Parábolas, vértice e intersecciones.' },
                    { id: 'mp-cls-15', title: 'Funciones exponenciales y logarítmicas', type: 'optional', objectives: 'Reconocer comportamiento asintótico', shortDescription: 'Aplicaciones al crecimiento y decaimiento.' },
                ],
            },
            {
                id: 'mp-mod-6',
                title: 'Unidad 2: Límites',
                description: 'Introducción al concepto de límite',
                order: 2,
                classes: [
                    { id: 'mp-cls-16', title: 'Intuición del límite', type: 'mandatory', objectives: 'Comprender qué es un límite gráficamente', shortDescription: 'Aproximaciones numéricas y geométricas.' },
                    { id: 'mp-cls-17', title: 'Cálculo de límites algebraicos', type: 'mandatory', objectives: 'Resolver límites indeterminados', shortDescription: 'Factorización, conjugada y L\'Hôpital básico.' },
                    { id: 'mp-cls-18', title: 'Prueba escrita — Funciones y Límites', type: 'evaluation', shortDescription: 'Evaluación integradora del bloque.', evaluationData: { modalidad: 'escrita', ponderacion: 35 } },
                ],
            },
        ],
    },
];

// ─── Main seed ────────────────────────────────────────────────────────────────
export const seedDatabase = async () => {
    console.log('Starting DB seeding process...');

    // Check if we already have users
    const existingUsers = await userRepository.getAll();
    if (existingUsers.length > 0 && existingUsers[0].name) {
        console.log('DB already seeded with user data, skipping user seed.');
    } else {
        if (existingUsers.length > 0) {
            console.log('DB seeded with incomplete data, clearing for fresh seed...');
            const db = await getDB();
            const stores = Object.values(STORES);
            for (const store of stores) {
                await db.clear(store);
            }
        }

        // 1. Create Demo User
        const demoPassword = 'Bio2026Secure';
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(demoPassword, salt);

        const demoUser = {
            id: 'usr-demo-teacher',
            username: 'profebiologia',
            name: 'Juan Pérez',
            email: 'profe@academicclarity.com',
            passwordHash,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLoginAt: null,
            isActive: true,
            role: 'teacher',
        };
        await userRepository.add(demoUser);
        const userId = demoUser.id;
        console.log('Demo user seeded');

        const addOwner = (item) => ({ ...item, userId });

        // 2. Seed Courses
        const coursesToSeed = (mockDb.courses || []).map(c => ({ ...c, userId, name: c.name || c.nombre }));
        await courseRepository.addAll(coursesToSeed);
        console.log('Courses seeded');

        // 3. Seed Modules
        await moduleRepository.addAll((mockDb.modules || []).map(addOwner));
        console.log('Modules seeded');

        // 4. Seed Students
        const allStudentsMap = new Map();
        (mockDb.groups || []).forEach(group => {
            group.students.forEach(s => {
                allStudentsMap.set(s.id, { ...s, course_id: group.id, userId });
            });
        });
        const studentsArr = Array.from(allStudentsMap.values());
        if (studentsArr.length > 0) await studentRepository.addAll(studentsArr);
        console.log('Students seeded');

        // 5. Seed Lessons
        const lessonsArr = (mockDb.lessons || []).map(l => ({ ...l, id: l.id || `les-${Math.random()}`, userId }));
        if (lessonsArr.length > 0) await lessonRepository.addAll(lessonsArr);
        console.log('Lessons seeded');

        // 6. Seed Evaluations
        if (mockDb.evaluations?.length > 0) {
            await evaluationRepository.addAll(mockDb.evaluations.map(addOwner));
        }
        console.log('Evaluations seeded');

        // 7. Seed Calendar Events
        const events = (mockDb.manualEvents || []).map(e => ({ ...e, id: e.id || `ev-${Math.random()}`, userId }));
        if (events.length > 0) await calendarRepository.addAll(events);
        console.log('Calendar events seeded');

        // NOTE: Course plans are NOT seeded for users — they start with an empty list.
        // Users can browse the Marketplace and clone plans from there.
        console.log('User course plans: starting empty (use Marketplace to get plans)');
    }

    // 8. Seed Marketplace (shared, global — only once, regardless of user)
    const marketplaceCount = await marketplaceRepository.count();
    if (marketplaceCount === 0) {
        await marketplaceRepository.addAll(MARKETPLACE_PLANS);
        console.log('Marketplace seeded with example plans');
    } else {
        console.log('Marketplace already seeded, skipping');
    }

    console.log('Seeding completed successfully!');
};
