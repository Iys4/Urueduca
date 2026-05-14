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
const MARKETPLACE_CLASSES = [
    {
        id: 'mp-cls-1',
        title: 'Teoría celular',
        type: 'mandatory',
        shortDescription: 'Historia e introducción a la teoría celular. Diferencias entre procariontas y eucariontas.',
        materia: 'Biología',
        año: '4°',
        planNombre: 'Biología 4to — Célula y Metabolismo',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-01-15',
        updatedAt: '2026-01-15'
    },
    {
        id: 'mp-cls-2',
        title: 'Organelos celulares',
        type: 'mandatory',
        shortDescription: 'Estudio de mitocondrias, cloroplastos, núcleo y ribosomas.',
        materia: 'Biología',
        año: '4°',
        planNombre: 'Biología 4to — Célula y Metabolismo',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-01-15',
        updatedAt: '2026-01-15'
    },
    {
        id: 'mp-cls-3',
        title: 'Práctica de microscopía',
        type: 'optional',
        shortDescription: 'Laboratorio: observación de células vegetales y animales.',
        materia: 'Biología',
        año: '4°',
        planNombre: 'Biología 4to — Célula y Metabolismo',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-01-15',
        updatedAt: '2026-01-15'
    },
    {
        id: 'mp-cls-4',
        title: 'Fotosíntesis',
        type: 'mandatory',
        shortDescription: 'Ciclo de Calvin y reacciones de la luz.',
        materia: 'Biología',
        año: '4°',
        planNombre: 'Biología 4to — Célula y Metabolismo',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-01-16',
        updatedAt: '2026-01-16'
    },
    {
        id: 'mp-cls-8',
        title: 'Europa antes de la industria',
        type: 'mandatory',
        shortDescription: 'Análisis del modo de producción pre-industrial. Describir la economía agraria del siglo XVIII.',
        materia: 'Historia',
        año: '3°',
        planNombre: 'Historia 3ro — Revolución Industrial',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-01-20',
        updatedAt: '2026-01-20'
    },
    {
        id: 'mp-cls-9',
        title: 'Causas de la Revolución Industrial',
        type: 'mandatory',
        shortDescription: 'El papel de Inglaterra: carbón, vapor y textiles.',
        materia: 'Historia',
        año: '3°',
        planNombre: 'Historia 3ro — Revolución Industrial',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-01-20',
        updatedAt: '2026-01-20'
    },
    {
        id: 'mp-cls-13',
        title: 'Definición de función',
        type: 'mandatory',
        shortDescription: 'Representación algebraica y gráfica. Entender dominio, codominio e imagen.',
        materia: 'Matemática',
        año: '5°',
        planNombre: 'Matemática 5to — Funciones y Límites',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-02-01',
        updatedAt: '2026-02-01'
    },
    {
        id: 'mp-cls-16',
        title: 'Intuición del límite',
        type: 'mandatory',
        shortDescription: 'Aproximaciones numéricas y geométricas para comprender qué es un límite.',
        materia: 'Matemática',
        año: '5°',
        planNombre: 'Matemática 5to — Funciones y Límites',
        ownerName: 'Sistema UruEduca',
        publishedAt: '2026-02-01',
        updatedAt: '2026-02-01'
    }
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

        console.log('User course plans: starting empty (use Marketplace to get plans)');
    }

    // 8. Seed Marketplace (shared, global — only once, regardless of user)
    // ALWAYS clear marketplace and re-seed to ensure correct structure
    const db = await getDB();
    await db.clear(STORES.MARKETPLACE);
    await marketplaceRepository.addAll(MARKETPLACE_CLASSES);
    console.log('Marketplace forcefully seeded with individual classes');

    console.log('Seeding completed successfully!');
};
