import { useAppStore } from '../store/useAppStore';

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const alertsEngine = {
    generateAlerts: (userId) => {
        const state = useAppStore.getState();
        const alerts = [];
        const today = getTodayStr();
        const userCourses = state.courses.filter(c => c.userId === userId);
        
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

            // ALERTA TIPO 1: Escritos sin corregir (solo de los últimos 7 días)
            courseEvaluations.forEach(evalu => {
                const evalDate = new Date(evalu.date);
                const todayDate = new Date(today);
                const diffDaysPast = (todayDate - evalDate) / (1000 * 60 * 60 * 24);

                if (evalu.date <= today && evalu.status !== 'graded' && diffDaysPast <= 7) {
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


        });

        // Ordenar: high primero, luego medium
        return alerts.sort((a, b) => {
            if (a.severity === 'high' && b.severity !== 'high') return -1;
            if (a.severity !== 'high' && b.severity === 'high') return 1;
            return 0;
        });
    }
};
