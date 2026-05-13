const dPlus = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};

const todayStr = new Date().toISOString().split('T')[0];

// Exported for testing/services
export const getTodayStr = () => todayStr;

export const mockDb = {
    users: [
        { id: 1, name: "María Bióloga", email: "maria@edu.uy", institution: "Liceo Departamental", birthdate: '1985-04-15' }
    ],

    // Mover datos viejos a archived
    archivedCourses: [
        { id: 101, name: "2°3 Matemática" },
        { id: 102, name: "5° H1 Historia" }
    ],
    
    courses: [
        { id: 401, name: "4to Biología", institution: "Liceo Departamental", year: 2026, user_id: 1, active: true, studentsCount: 25, currentModule: "Célula", moduleProgress: 20, performance: 7.5 },
        { id: 501, name: "5to Biología", institution: "Liceo Departamental", year: 2026, user_id: 1, active: true, studentsCount: 28, currentModule: "Genética", moduleProgress: 50, performance: 8.2 },
        { id: 601, name: "6to Biología", institution: "Liceo Javier de Viana", year: 2026, user_id: 1, active: true, studentsCount: 15, currentModule: "Sist. Nervioso", moduleProgress: 10, performance: 8.8 },
        { id: 502, name: "5to Biology (ENG)", institution: "Bilingual School", year: 2026, user_id: 1, active: true, studentsCount: 12, currentModule: "Cell Biology", moduleProgress: 80, performance: 9.1 }
    ],

    students: [
        // 4to Biología
        { id: 4001, name: "Acosta, Lucía", email: "lucia@edu.uy", course_id: 401, avg: 8.0, birthdate: '2010-02-14' },
        { id: 4002, name: "Borges, Mateo", email: "mateo@edu.uy", course_id: 401, avg: 7.5, birthdate: '2010-06-22' },
        { id: 4003, name: "Castro, Sofía", email: "sofia@edu.uy", course_id: 401, avg: 9.0, birthdate: '2010-11-05' },
        // 5to Biología
        { id: 5001, name: "Díaz, Carlos", email: "carlos@edu.uy", course_id: 501, avg: 6.5, birthdate: '2009-01-10' },
        { id: 5002, name: "Estévez, Ana", email: "ana@edu.uy", course_id: 501, avg: 8.8, birthdate: '2009-08-30' },
        // 6to Biología
        { id: 6001, name: "Fernández, Diego", email: "diego@edu.uy", course_id: 601, avg: 9.5, birthdate: '2008-04-12' },
        { id: 6002, name: "González, Valentina", email: "val@edu.uy", course_id: 601, avg: 7.2, birthdate: '2008-12-01' },
        // 5to Biology ENG
        { id: 5021, name: "Smith, John", email: "john@edu.uy", course_id: 502, avg: 8.5, birthdate: '2009-05-20' }
    ],

    coursePlans: [
        {
            id: 'cp-bio-4',
            nombre: 'Biología 4to Año',
            materia: 'Biología',
            año: '4°',
            descripcion: 'Introducción a la biología celular, metabolismo y funciones vitales.',
            owner: 1,
            collaborators: [],
            status: 'active',
            createdAt: '2026-02-01',
            updatedAt: '2026-03-01',
            missingMandatory: true, // Mock for Alert Type 5
            curriculumDocument: { file: 'biologia_4to.pdf', fileName: 'Programa 4to - Célula', uploadDate: '2026-02-01' }
        },
        {
            id: 'cp-bio-5',
            nombre: 'Biología 5to Año',
            materia: 'Biología',
            año: '5°',
            descripcion: 'Genética, herencia y evolución.',
            owner: 1,
            collaborators: [],
            status: 'active',
            createdAt: '2026-02-05',
            updatedAt: '2026-03-05',
            curriculumDocument: null
        }
    ],

    modules: [
        // Biología 4to Año
        {
            id: 'mod-4-1',
            coursePlanId: 'cp-bio-4',
            title: 'Unidad 1: La Célula',
            description: 'Estructura celular básica',
            order: 1,
            classes: [
                { id: 'cls-4-1', title: 'Introducción a la célula', type: 'mandatory', objectives: 'Conocer procariontas y eucariontas', shortDescription: 'Clase inicial sobre la teoría celular.', scheduledDate: dPlus(-2).toISOString().split('T')[0] },
                { id: 'cls-4-2', title: 'Organelos', type: 'mandatory', objectives: 'Función de organelos', shortDescription: 'Estudio detallado de mitocondrias, cloroplastos y ribosomas.', scheduledDate: todayStr },
                { id: 'cls-4-3', title: 'Membrana plasmática', type: 'optional', objectives: 'Transporte activo y pasivo', shortDescription: 'Análisis de la bicapa lipídica y mecanismos de transporte.', scheduledDate: dPlus(1).toISOString().split('T')[0] },
                { id: 'cls-4-eval', title: 'Prueba de Célula', type: 'evaluation', shortDescription: 'Evaluación formativa del Módulo 1.', scheduledDate: dPlus(-1).toISOString().split('T')[0] } // Pasado, para alerta 1
            ]
        },
        {
            id: 'mod-4-2',
            coursePlanId: 'cp-bio-4',
            title: 'Unidad 2: Metabolismo Celular',
            description: 'Procesos de obtención de energía',
            order: 2,
            classes: [
                { id: 'cls-4-4', title: 'Fotosíntesis', type: 'mandatory', objectives: 'Comprender la fase luminosa y oscura', shortDescription: 'Revisión del ciclo de Calvin.', scheduledDate: dPlus(4).toISOString().split('T')[0] },
                { id: 'cls-4-5', title: 'Respiración Celular', type: 'mandatory', objectives: 'Ciclo de Krebs y fosforilación oxidativa', shortDescription: 'Obtención de ATP a partir de glucosa.', scheduledDate: dPlus(6).toISOString().split('T')[0] },
                { id: 'cls-4-6', title: 'Fermentación', type: 'optional', objectives: 'Vías anaeróbicas', shortDescription: 'Fermentación láctica y alcohólica.', scheduledDate: dPlus(8).toISOString().split('T')[0] },
                { id: 'cls-4-eval2', title: 'Laboratorio de Fotosíntesis', type: 'evaluation', shortDescription: 'Práctica de laboratorio observando Elodea.', scheduledDate: dPlus(10).toISOString().split('T')[0], evaluationData: { modalidad: 'práctica', ponderacion: 20 } }
            ]
        },
        {
            id: 'mod-4-3',
            coursePlanId: 'cp-bio-4',
            title: 'Unidad 3: Reproducción Celular',
            description: 'División celular y su importancia',
            order: 3,
            classes: [
                { id: 'cls-4-7', title: 'Ciclo Celular', type: 'mandatory', objectives: 'Fases G1, S, G2 y M', shortDescription: 'Regulación del ciclo celular y cáncer.' },
                { id: 'cls-4-8', title: 'Mitosis', type: 'mandatory', objectives: 'Fases de la mitosis', shortDescription: 'Importancia en el crecimiento y reparación de tejidos.' },
                { id: 'cls-4-9', title: 'Meiosis', type: 'mandatory', objectives: 'Reducción cromosómica', shortDescription: 'Variabilidad genética y gametogénesis.' },
                { id: 'cls-4-eval3', title: 'Escrito de Reproducción', type: 'evaluation', shortDescription: 'Prueba escrita individual.', evaluationData: { modalidad: 'escrita', ponderacion: 30 } }
            ]
        },
        // Biología 5to Año
        {
            id: 'mod-5-1',
            coursePlanId: 'cp-bio-5',
            title: 'Unidad 1: Genética',
            description: 'Leyes de Mendel',
            order: 1,
            classes: [
                { id: 'cls-5-1', title: 'Genética Mendeliana', type: 'mandatory', objectives: 'Leyes 1 y 2', shortDescription: 'Introducción a los cruzamientos genéticos.', scheduledDate: todayStr },
                { id: 'cls-5-2', title: 'Dominancia incompleta y codominancia', type: 'mandatory', objectives: 'Excepciones a Mendel', shortDescription: 'Grupos sanguíneos y fenotipos intermedios.', scheduledDate: dPlus(2).toISOString().split('T')[0] },
                { id: 'cls-5-eval', title: 'Trabajo Genética', type: 'evaluation', shortDescription: 'Resolución de problemas genéticos en grupo.', scheduledDate: dPlus(5).toISOString().split('T')[0], evaluationData: { modalidad: 'proyecto', ponderacion: 15 } } // Futuro sin rúbrica, para alerta 4
            ]
        },
        {
            id: 'mod-5-2',
            coursePlanId: 'cp-bio-5',
            title: 'Unidad 2: Biología Molecular',
            description: 'Estructura del ADN y ARN',
            order: 2,
            classes: [
                { id: 'cls-5-3', title: 'Estructura del ADN', type: 'mandatory', objectives: 'Modelo de Watson y Crick', shortDescription: 'Bases nitrogenadas y doble hélice.' },
                { id: 'cls-5-4', title: 'Replicación', type: 'mandatory', objectives: 'Mecanismo semiconservativo', shortDescription: 'Enzimas involucradas en la replicación.' },
                { id: 'cls-5-5', title: 'Síntesis de Proteínas', type: 'mandatory', objectives: 'Transcripción y traducción', shortDescription: 'Dogma central de la biología molecular.' },
                { id: 'cls-5-6', title: 'Mutaciones', type: 'optional', objectives: 'Tipos de mutaciones y agentes mutagénicos', shortDescription: 'Impacto evolutivo de las mutaciones.' }
            ]
        },
        {
            id: 'mod-5-3',
            coursePlanId: 'cp-bio-5',
            title: 'Unidad 3: Evolución',
            description: 'Teorías evolutivas y evidencia',
            order: 3,
            classes: [
                { id: 'cls-5-7', title: 'Teorías Pre-Darwinianas', type: 'optional', objectives: 'Lamarckismo vs Catastrofismo', shortDescription: 'Contexto histórico del pensamiento evolutivo.' },
                { id: 'cls-5-8', title: 'Selección Natural', type: 'mandatory', objectives: 'Postulados de Darwin', shortDescription: 'Adaptación y eficacia biológica.' },
                { id: 'cls-5-9', title: 'Evidencias de la Evolución', type: 'mandatory', objectives: 'Registro fósil, anatomía comparada', shortDescription: 'Órganos homólogos y análogos.' },
                { id: 'cls-5-eval2', title: 'Ensayo Evolutivo', type: 'evaluation', shortDescription: 'Ensayo sobre el impacto de las teorías de Darwin.', evaluationData: { modalidad: 'proyecto', ponderacion: 25 } }
            ]
        }
    ],


    lessons: [
        // Para 4to Biología: hoy (Falta pasar lista -> Alerta 2)
        { id: 40101, course_id: 401, date: todayStr, start_time: "08:00", end_time: "09:30", topic: "Organelos", classPlanId: 'cls-4-2' },
        // Para 5to Biología: hoy
        { id: 50101, course_id: 501, date: todayStr, start_time: "10:00", end_time: "11:30", topic: "Genética Mendeliana", classPlanId: 'cls-5-1' },
        // Nota: 6to Biología no tiene lessons planificadas a futuro -> Alerta 3
    ],

    attendanceRecords: {
        // lesson_id -> student_id -> boolean
        // 40101 (de hoy) NO tiene registros = dispara Alerta 2
        '50101': { 5001: true, 5002: false } // Ya se pasó lista
    },

    evaluations: [
        // Alerta 1: Escrito sin corregir (fecha pasada, sin notas cargadas para todos)
        { 
            id: 8001, course_id: 401, classPlanId: 'cls-4-eval', title: "Prueba de Célula", 
            date: dPlus(-1).toISOString().split('T')[0], type: "Escrito", status: "pending_grading", 
            grades: { 4001: { nota: 8, asistencia: true } } // 4002 y 4003 faltan
        },
        // Alerta 4: Evaluación próxima sin rúbrica (dentro de 7 días, sin rúbrica)
        { 
            id: 8002, course_id: 501, classPlanId: 'cls-5-eval', title: "Trabajo Genética", 
            date: dPlus(5).toISOString().split('T')[0], type: "Proyecto", status: "upcoming", 
            grades: {},
            rubric: null // Sin rúbrica = dispara Alerta 4
        }
    ],

    // Mantenemos manualEvents para el calendario
    manualEvents: [
        { id: 'mev-1', title: 'Reunión Depto Biología', date: dPlus(2).toISOString().split('T')[0], startTime: '14:00', type: 'reunion', color: '#6750a4' }
    ],
    importedEvents: [],
    globalOptionalClasses: [],
    availableTeachers: [
        { id: 2, name: 'Carlos Biólogo', email: 'carlos@edu.uy' }
    ],
    
    stats: { performance: 8.0, pendingEvals: 1, totalStudents: 80, plannedSessions: 2, attendanceRate: 90 }
};
