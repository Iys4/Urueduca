import { create } from 'zustand';
import { 
    userRepository,
    courseRepository, 
    moduleRepository, 
    studentRepository, 
    lessonRepository, 
    evaluationRepository,
    calendarRepository,
    coursePlanRepository,
} from '../data/repositories';
import { useAuthStore } from './useAuthStore';

export const useAppStore = create((set, get) => ({
    isHydrated: false,
    users: [],
    stats: { performance: 8.0, pendingEvals: 1, totalStudents: 80, plannedSessions: 2, attendanceRate: 90 },
    courses: [],
    modules: [],
    students: [],
    lessons: [],
    evaluations: [],
    calendarEvents: [],
    coursePlans: [],

    init: async (userId) => {
        if (!userId) {
            set({ isHydrated: false });
            return;
        }

        const [
            users,
            courses,
            modules,
            students,
            lessons,
            evaluations,
            calendarEvents,
            coursePlans,
        ] = await Promise.all([
            userRepository.getAll(),
            courseRepository.getAll(userId),
            moduleRepository.getAll(userId),
            studentRepository.getAll(userId),
            lessonRepository.getAll(userId),
            evaluationRepository.getAll(userId),
            calendarRepository.getAll(userId),
            coursePlanRepository.getAll(userId),
        ]);

        set({
            users,
            courses,
            modules,
            students,
            lessons,
            evaluations,
            calendarEvents,
            coursePlans,
            isHydrated: true,
        });
    },

    clear: () => {
        set({
            isHydrated: false,
            courses: [],
            modules: [],
            students: [],
            lessons: [],
            evaluations: [],
            calendarEvents: [],
            coursePlans: [],
        });
    },

    // --- Courses ---
    addCourse: async (course) => {
        set({ courses: [...get().courses, course] });
        await courseRepository.add(course);
    },
    updateCourse: async (id, data) => {
        set({ courses: get().courses.map(c => c.id === id ? { ...c, ...data } : c) });
        await courseRepository.update(id, data);
    },

    // --- Modules ---
    updateModule: async (id, data) => {
        set({ modules: get().modules.map(m => m.id === id ? { ...m, ...data } : m) });
        await moduleRepository.update(id, data);
    },

    // --- Students ---
    addStudent: async (student) => {
        set({ students: [...get().students, student] });
        await studentRepository.add(student);
    },
    updateStudent: async (id, data) => {
        set({ students: get().students.map(s => s.id === id ? { ...s, ...data } : s) });
        await studentRepository.update(id, data);
    },
    deleteStudent: async (id) => {
        set({ students: get().students.filter(s => s.id !== id) });
        await studentRepository.delete(id);
    },

    // --- Evaluations ---
    addEvaluation: async (evaluation) => {
        const userId = useAuthStore.getState().currentUser?.id || null;
        const finalEval = { ...evaluation, userId: evaluation.userId || userId };
        set({ evaluations: [...get().evaluations, finalEval] });
        await evaluationRepository.add(finalEval);
    },
    updateEvaluation: async (id, data) => {
        set({ evaluations: get().evaluations.map(e => e.id === id ? { ...e, ...data } : e) });
        await evaluationRepository.update(id, data);
    },
    updateStudentGrade: async (evalId, studentId, gradeData) => {
        const evals = get().evaluations;
        const targetEval = evals.find(e => e.id === evalId);
        if (!targetEval) return;

        // 1. Update evaluation grades
        const updatedGrades = { ...targetEval.grades };
        updatedGrades[studentId] = { ...updatedGrades[studentId], ...gradeData };
        const updatedEval = { ...targetEval, grades: updatedGrades };
        
        const newEvals = evals.map(e => e.id === evalId ? updatedEval : e);
        set({ evaluations: newEvals });
        await evaluationRepository.update(evalId, { grades: updatedGrades });

        // 2. Recalculate student average
        // Filter evaluations for this student's course
        const student = get().students.find(s => s.id === studentId);
        if (!student) return;

        const studentEvals = newEvals.filter(e => 
            String(e.course_id) === String(student.course_id) && 
            e.grades?.[studentId]?.score !== undefined
        );

        if (studentEvals.length > 0) {
            let totalWeightedScore = 0;
            let totalWeight = 0;
            
            studentEvals.forEach(e => {
                const score = parseFloat(e.grades[studentId].score);
                const weight = parseFloat(e.weight) || 0;
                totalWeightedScore += (score * weight);
                totalWeight += weight;
            });

            const newAvg = totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
            
            set({ students: get().students.map(s => s.id === studentId ? { ...s, avg: newAvg } : s) });
            await studentRepository.update(studentId, { avg: newAvg });
        }
    },

    // --- Lessons (Attendance) ---
    addLesson: async (lesson) => {
        const userId = useAuthStore.getState().currentUser?.id || null;
        const finalLesson = { ...lesson, userId: lesson.userId || userId };
        set({ lessons: [...get().lessons, finalLesson] });
        await lessonRepository.add(finalLesson);
    },
    updateLessonAttendance: async (lessonId, studentId, present) => {
        const lessons = get().lessons;
        const targetLesson = lessons.find(l => l.id === lessonId);
        if (!targetLesson) return;
        const updatedAttendance = { ...targetLesson.attendance };
        updatedAttendance[studentId] = present ? 'presente' : 'ausente';
        const updatedLesson = { ...targetLesson, attendance: updatedAttendance, attendanceCompleted: true };
        set({ lessons: lessons.map(l => l.id === lessonId ? updatedLesson : l) });
        await lessonRepository.update(lessonId, { attendance: updatedAttendance, attendanceCompleted: true });
    },

    // --- Course Plans ---
    addCoursePlan: async (plan) => {
        set({ coursePlans: [...get().coursePlans, plan] });
        await coursePlanRepository.add(plan);
    },
    updateCoursePlan: async (id, data) => {
        set({ coursePlans: get().coursePlans.map(cp => cp.id === id ? { ...cp, ...data } : cp) });
        await coursePlanRepository.update(id, data);
    },
    deleteCoursePlan: async (id) => {
        set({ coursePlans: get().coursePlans.filter(cp => cp.id !== id) });
        await coursePlanRepository.delete(id);
    },

    // --- Group ↔ CoursePlan progress ---
    assignCoursePlan: async (courseId, coursePlanId) => {
        set({ courses: get().courses.map(c => c.id === courseId ? { ...c, coursePlanId, completedClasses: [], halfCompletedClasses: [] } : c) });
        await courseRepository.update(courseId, { coursePlanId, completedClasses: [], halfCompletedClasses: [] });
    },
    markClassCompleted: async (courseId, classId) => {
        const course = get().courses.find(c => c.id === courseId);
        if (!course) return;
        const completed = [...(course.completedClasses || [])];
        if (!completed.includes(classId)) completed.push(classId);
        const halfCompleted = (course.halfCompletedClasses || []).filter(id => id !== classId);
        set({ courses: get().courses.map(c => c.id === courseId ? { ...c, completedClasses: completed, halfCompletedClasses: halfCompleted } : c) });
        await courseRepository.update(courseId, { completedClasses: completed, halfCompletedClasses: halfCompleted });
    },
    markClassHalfCompleted: async (courseId, classId) => {
        const course = get().courses.find(c => c.id === courseId);
        if (!course) return;
        const halfCompleted = [...(course.halfCompletedClasses || [])];
        if (!halfCompleted.includes(classId)) halfCompleted.push(classId);
        const completed = (course.completedClasses || []).filter(id => id !== classId);
        set({ courses: get().courses.map(c => c.id === courseId ? { ...c, halfCompletedClasses: halfCompleted, completedClasses: completed } : c) });
        await courseRepository.update(courseId, { halfCompletedClasses: halfCompleted, completedClasses: completed });
    },
    unmarkClassCompleted: async (courseId, classId) => {
        const course = get().courses.find(c => c.id === courseId);
        if (!course) return;
        const completed = (course.completedClasses || []).filter(id => id !== classId);
        const halfCompleted = (course.halfCompletedClasses || []).filter(id => id !== classId);
        set({ courses: get().courses.map(c => c.id === courseId ? { ...c, completedClasses: completed, halfCompletedClasses: halfCompleted } : c) });
        await courseRepository.update(courseId, { completedClasses: completed, halfCompletedClasses: halfCompleted });
    },
    
    // --- Calendar Events ---
    addCalendarEvent: async (event) => {
        const userId = useAuthStore.getState().currentUser?.id || null;
        const finalEvent = { ...event, userId: event.userId || userId };
        set({ calendarEvents: [...get().calendarEvents, finalEvent] });
        await calendarRepository.add(finalEvent);
    },
}));

