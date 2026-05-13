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
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
    },

    getNextClass: (userId = 1) => {
        const todayLessons = dashboardService.getTodayLessons(userId);
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        // Find first lesson that hasn't ended yet
        const upcoming = todayLessons.find(l => l.end_time > currentTime);
        if (upcoming) return upcoming;
        // If all ended, return null
        return todayLessons.length > 0 ? todayLessons[0] : null;
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
    }
};
