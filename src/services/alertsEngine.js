import { useAppStore } from '../store/useAppStore';

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const alertsEngine = {
    generateAlerts: (userId) => {
        const state = useAppStore.getState();
        const alerts = [];
        const today = getTodayStr();
        const userCourses = state.courses.filter(c => c.user_id === userId);
        
        let alertIdCounter = 1;
        const addAlert = (type, message, severity, actionLabel, courseId, icon, extraData = {}) => {
            alerts.push({
                id: `alt-${alertIdCounter++}`,
                user_id: userId,
                type,
                message,
                severity, // 'high', 'medium', 'low'
                actionLabel,
                course_id: courseId,
                icon,
                status: 'pending',
                ...extraData
            });
        };

        userCourses.forEach(course => {
            const courseStudents = state.students.filter(s => s.course_id === course.id);
            const courseEvaluations = state.evaluations.filter(e => e.course_id === course.id);
            const courseLessons = state.lessons.filter(l => l.course_id === course.id);

            // ALERTA TIPO 1: Escritos sin corregir
            courseEvaluations.forEach(evalu => {
                if (evalu.date <= today && evalu.status !== 'graded') {
                    // Check if all students have grades
                    const gradedStudents = Object.keys(evalu.grades || {}).length;
                    if (gradedStudents < courseStudents.length) {
                        addAlert(
                            'evaluation', 
                            `${courseStudents.length - gradedStudents} escritos de "${evalu.title}" pendientes de corrección`, 
                            'high', 
                            'Corregir ahora', 
                            course.id, 
                            'edit_document',
                            { evalId: evalu.id }
                        );
                    }
                }
            });

            // ALERTA TIPO 2: Falta pasar lista
            courseLessons.forEach(lesson => {
                if (lesson.date <= today) {
                    if (!lesson.attendanceCompleted) {
                        const dateLabel = lesson.date === today ? 'hoy' : `del ${lesson.date}`;
                        addAlert(
                            'attendance',
                            `Falta pasar lista en la clase de ${dateLabel} (${course.name})`,
                            'high',
                            'Pasar lista',
                            course.id,
                            'how_to_reg',
                            { lessonId: lesson.id }
                        );
                    }
                }
            });

            // ALERTA TIPO 3: Grupo sin próxima clase planificada
            const futureLessons = courseLessons.filter(l => l.date > today);
            if (futureLessons.length === 0) {
                addAlert(
                    'planning',
                    `El grupo ${course.name} no tiene próximas clases en agenda`,
                    'medium',
                    'Agendar clase',
                    course.id,
                    'event_busy'
                );
            }

            // ALERTA TIPO 4: Evaluación próxima sin rúbrica
            courseEvaluations.forEach(evalu => {
                if (evalu.date > today) {
                    const evalDate = new Date(evalu.date);
                    const todayDate = new Date(today);
                    const diffDays = (evalDate - todayDate) / (1000 * 60 * 60 * 24);
                    
                    if (diffDays <= 7 && !evalu.rubric) {
                        addAlert(
                            'rubric',
                            `Evaluación "${evalu.title}" en ${diffDays} días sin rúbrica configurada`,
                            'medium',
                            'Configurar',
                            course.id,
                            'format_list_bulleted',
                            { evalId: evalu.id }
                        );
                    }
                }
            });

            // ALERTA TIPO 5: Planificación obligatoria pendiente
            if (course.name.includes("4to")) {
                const plan = state.courses.find(cp => cp.id === 'cp-bio-4'); // It's in courses? No, coursePlans are in courses. Wait, cp-bio-4 is a coursePlan.
                if (plan && plan.missingMandatory) {
                    addAlert(
                        'planning_mandatory',
                        `Planificación obligatoria incompleta para ${course.name}`,
                        'medium',
                        'Revisar módulos',
                        course.id,
                        'warning'
                    );
                }
            }
        });

        // Ordenar: high primero, luego medium
        return alerts.sort((a, b) => {
            if (a.severity === 'high' && b.severity !== 'high') return -1;
            if (a.severity !== 'high' && b.severity === 'high') return 1;
            return 0;
        });
    }
};
