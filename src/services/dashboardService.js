import { useAppStore } from '../store/useAppStore';
import { alertsEngine } from './alertsEngine';

export const dashboardService = {
    getUserInfo: (userId = 1) => {
        const state = useAppStore.getState();
        return state.users.find(u => u.id === userId);
    },

    getTodayLessons: (userId = 1) => {
        const state = useAppStore.getState();
        const todayStr = new Date().toISOString().split('T')[0];
        const userCourses = state.courses.filter(c => c.userId === userId);
        const courseIds = userCourses.map(c => c.id);
        
        return state.lessons
            .filter(l => l.date === todayStr && courseIds.includes(l.course_id))
            .map(l => {
                const course = state.courses.find(c => c.id === l.course_id);
                return { ...l, courseName: course?.name || 'Sin asignar' };
            })
            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    },

    getNextClass: (userId = 1) => {
        const todayLessons = dashboardService.getTodayLessons(userId);
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        // Find first lesson that hasn't ended yet
        const upcoming = todayLessons.find(l => (l.end_time || '23:59') > currentTime);
        return upcoming || null;
    },

    getCoursesSummary: (userId = 1) => {
        const state = useAppStore.getState();
        const userCourses = state.courses.filter(c => c.userId === userId);
        return userCourses.map(course => {
            const evals = state.evaluations
                .filter(e => e.course_id === course.id && (e.status === 'upcoming' || e.status === 'pending_grading'))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            let nextEvent = "Sin pendientes";
            if (evals.length > 0) {
                const nextEval = evals[0];
                const today = new Date();
                const evalDate = new Date(nextEval.date);
                const diffDays = Math.ceil((evalDate - today) / (1000 * 60 * 60 * 24));
                
                if (nextEval.status === 'pending_grading') nextEvent = "Por corregir";
                else if (diffDays <= 0) nextEvent = "Entrega hoy";
                else if (diffDays === 1) nextEvent = "Entrega mañana";
                else nextEvent = `${nextEval.type} en ${diffDays} días`;
            }
            return { ...course, nextEvent };
        });
    },

    getGroupsViewData: (userId = 1) => {
        const state = useAppStore.getState();
        const userCourses = state.courses.filter(c => c.userId === userId);
        const todayStr = new Date().toISOString().split('T')[0];

        return userCourses.map(course => {
            const lessons = state.lessons
                .filter(l => l.course_id === course.id && l.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
            const nextClass = lessons.length > 0 ? lessons[0] : null;

            const evals = state.evaluations
                .filter(e => e.course_id === course.id && e.status !== 'graded')
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            const nextEval = evals.length > 0 ? evals[0] : null;

            // Calculate real progress
            let progress = 0;
            if (course.coursePlanId) {
                const plan = state.coursePlans.find(p => p.id === course.coursePlanId);
                if (plan) {
                    const totalClasses = (plan.modules || []).reduce((sum, m) => sum + (m.classes || []).length, 0);
                    if (totalClasses > 0) {
                        const completedCount = (course.completedClasses || []).length;
                        progress = Math.round((completedCount / totalClasses) * 100);
                    }
                }
            }

            let status = 'neutral';
            let statusText = 'Sin actividad hoy';
            
            if (nextClass && nextClass.date === todayStr) {
                status = 'attention';
                statusText = 'Hoy tenés clase';
            }
            
            // Pending grading takes highest priority
            const pendingGrading = state.evaluations.find(
                e => e.course_id === course.id && e.status === 'pending_grading'
            );
            if (pendingGrading) {
                status = 'urgent';
                statusText = `${pendingGrading.pendingCount} escritos por corregir`;
            } else if (nextEval) {
                const today = new Date();
                const evalDate = new Date(nextEval.date);
                const diffDays = Math.ceil((evalDate - today) / (1000 * 60 * 60 * 24));
                if (diffDays <= 1) {
                    status = 'urgent';
                    statusText = 'Evaluación inminente';
                }
            }

            let smartAction = { label: 'Entrar al grupo', icon: 'login', primary: false };
            if (pendingGrading) {
                smartAction = { label: 'Corregir', icon: 'edit_document', primary: true, urgent: true };
            } else if (status === 'attention') {
                smartAction = { label: 'Pasar Lista', icon: 'how_to_reg', primary: true };
            }

            return {
                ...course,
                moduleProgress: progress, // map back to UI field name
                nextClass,
                nextEval,
                status,
                statusText,
                smartAction
            };
        });
    },

    getStudentsByCourse: (courseId) => {
        const state = useAppStore.getState();
        const cId = String(courseId);
        return state.students
            .filter(s => String(s.course_id) === cId)
            .sort((a, b) => a.name.localeCompare(b.name));
    },

    getEvaluationsByCourse: (courseId) => {
        const state = useAppStore.getState();
        const cId = String(courseId);
        return state.evaluations
            .filter(e => String(e.course_id) === cId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getLessonsByCourse: (courseId) => {
        const state = useAppStore.getState();
        const cId = String(courseId);
        return state.lessons
            .filter(l => String(l.course_id) === cId)
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    getCourseById: (courseId) => {
        const state = useAppStore.getState();
        const cId = String(courseId);
        return state.courses.find(c => String(c.id) === cId) || null;
    },

    getPendingAlerts: (userId = 1) => {
        return alertsEngine.generateAlerts(userId);
    },

    getQuickStats: (userId) => {
        const state = useAppStore.getState();
        const userCourses = state.courses.filter(c => c.userId === userId);
        const courseIds = new Set(userCourses.map(c => c.id));

        const totalStudents = state.students.filter(s => courseIds.has(s.course_id)).length;
        const totalLessons  = state.lessons.filter(l => courseIds.has(l.course_id)).length;
        const totalEvals    = state.evaluations.filter(e => courseIds.has(e.course_id)).length;

        return { totalStudents, totalLessons, totalEvals };
    },

    getUpcomingEvents: (userId = 1) => {
        const state = useAppStore.getState();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const events = [];
        const userCourses = state.courses.filter(c => c.userId === userId);
        const courseIds = new Set(userCourses.map(c => c.id));

        // 1. Next Class (Logged or Scheduled for today/future)
        const nextClass = dashboardService.getNextClass(userId);
        if (nextClass) {
            events.push({
                type: 'class',
                title: nextClass.courseName || nextClass.title,
                subtitle: `Hoy ${nextClass.start_time} - ${nextClass.end_time}`,
                date: new Date(),
                icon: 'school',
                color: 'text-primary'
            });
        }

        // 2. Weekly Scheduled Classes (Next 7 days, excluding today if already handled)
        userCourses.forEach(course => {
            if (course.schedule && Array.isArray(course.schedule)) {
                course.schedule.forEach(sched => {
                    const dayIndex = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].indexOf(sched.day);
                    if (dayIndex === -1) return;

                    // Check next 7 days (starting from tomorrow to avoid duplication with getNextClass)
                    for (let i = 1; i <= 7; i++) {
                        const d = new Date(today);
                        d.setDate(today.getDate() + i);
                        if (d.getDay() === dayIndex) {
                            events.push({
                                type: 'class',
                                title: `${course.name}: Clase semanal`,
                                subtitle: `${sched.day} ${sched.startTime} - ${sched.endTime}`,
                                date: new Date(d),
                                icon: 'calendar_today',
                                color: 'text-primary'
                            });
                        }
                    }
                });
            }
        });

        // 3. Upcoming Birthdays (next 7 days)
        const students = state.students.filter(s => courseIds.has(s.course_id) && s.birthdate);
        students.forEach(s => {
            const bDate = new Date(s.birthdate);
            const bThisYear = new Date(today.getFullYear(), bDate.getMonth(), bDate.getDate());
            if (bThisYear >= today && bThisYear <= nextWeek) {
                events.push({
                    type: 'birthday',
                    title: `Cumpleaños de ${s.name}`,
                    subtitle: bThisYear.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }),
                    date: bThisYear,
                    icon: 'cake',
                    color: 'text-tertiary'
                });
            }
        });

        // 4. Next Exam/Evaluation (next 7 days)
        // Fix: Check status correctly (not just 'upcoming')
        const evals = state.evaluations.filter(e => courseIds.has(e.course_id) && e.status !== 'graded');
        evals.forEach(e => {
            const eDate = new Date(e.date);
            eDate.setHours(0,0,0,0);
            if (eDate >= today && eDate <= nextWeek) {
                const course = userCourses.find(c => String(c.id) === String(e.course_id));
                events.push({
                    type: 'exam',
                    title: `${e.type}: ${e.title}`,
                    subtitle: `${course?.name || 'Grupo'} · ${eDate.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}`,
                    date: eDate,
                    icon: 'assignment',
                    color: 'text-error'
                });
            }
        });

        // 5. Holidays (next 7 days)
        const currentYear = today.getFullYear();
        const holidays = [
            { date: new Date(currentYear, 0, 1), name: "Año Nuevo" },
            { date: new Date(currentYear, 4, 1), name: "Día de los Trabajadores" },
            { date: new Date(currentYear, 5, 19), name: "Natalicio de Artigas" },
            { date: new Date(currentYear, 6, 18), name: "Jura de la Constitución" },
            { date: new Date(currentYear, 7, 25), name: "Declaratoria de la Independencia" },
            { date: new Date(currentYear, 11, 25), name: "Navidad" }
        ];

        holidays.forEach(h => {
            if (h.date >= today && h.date <= nextWeek) {
                events.push({
                    type: 'holiday',
                    title: `Feriado: ${h.name}`,
                    subtitle: h.date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }),
                    date: h.date,
                    icon: 'event_busy',
                    color: 'text-secondary'
                });
            }
        });

        // Sort events by date
        return events.sort((a, b) => a.date - b.date);
    }
};
