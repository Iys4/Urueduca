import { create } from 'zustand';
import { 
    userRepository,
    courseRepository, 
    moduleRepository, 
    studentRepository, 
    lessonRepository, 
    evaluationRepository,
    calendarRepository 
} from '../data/repositories';
import { seedDatabase } from '../data/seed';

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

    init: async (userId) => {
        if (!userId) {
            set({ isHydrated: false });
            return;
        }

        // Hydrate store from DB for the specific user
        const [
            users, // We don't necessarily need all users, but keeping it for compatibility
            courses,
            modules,
            students,
            lessons,
            evaluations,
            calendarEvents
        ] = await Promise.all([
            userRepository.getAll(),
            courseRepository.getAll(userId),
            moduleRepository.getAll(userId),
            studentRepository.getAll(userId),
            lessonRepository.getAll(userId),
            evaluationRepository.getAll(userId),
            calendarRepository.getAll(userId)
        ]);

        set({
            users,
            courses,
            modules,
            students,
            lessons,
            evaluations,
            calendarEvents,
            isHydrated: true
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
            calendarEvents: []
        });
    },

    // --- Actions ---

    // Courses
    addCourse: async (course) => {
        set({ courses: [...get().courses, course] });
        await courseRepository.add(course);
    },
    updateCourse: async (id, data) => {
        set({ courses: get().courses.map(c => c.id === id ? { ...c, ...data } : c) });
        await courseRepository.update(id, data);
    },

    // Modules
    updateModule: async (id, data) => {
        set({ modules: get().modules.map(m => m.id === id ? { ...m, ...data } : m) });
        await moduleRepository.update(id, data);
    },

    // Evaluations
    updateEvaluation: async (id, data) => {
        set({ evaluations: get().evaluations.map(e => e.id === id ? { ...e, ...data } : e) });
        await evaluationRepository.update(id, data);
    },
    updateStudentGrade: async (evalId, studentId, gradeData) => {
        // Optimistic UI
        const evals = get().evaluations;
        const targetEval = evals.find(e => e.id === evalId);
        if (!targetEval) return;

        // Clone and update
        const updatedGrades = { ...targetEval.grades };
        updatedGrades[studentId] = { ...updatedGrades[studentId], ...gradeData };
        
        const updatedEval = { ...targetEval, grades: updatedGrades };
        set({ evaluations: evals.map(e => e.id === evalId ? updatedEval : e) });

        // Persist
        await evaluationRepository.update(evalId, { grades: updatedGrades });
    },

    // Lessons (Attendance)
    updateLessonAttendance: async (lessonId, studentId, present) => {
        const lessons = get().lessons;
        const targetLesson = lessons.find(l => l.id === lessonId);
        if (!targetLesson) return;

        const updatedAttendance = { ...targetLesson.attendance };
        if (present) {
            updatedAttendance[studentId] = 'presente';
        } else {
            updatedAttendance[studentId] = 'ausente';
        }

        const updatedLesson = { ...targetLesson, attendance: updatedAttendance, attendanceCompleted: true };
        set({ lessons: lessons.map(l => l.id === lessonId ? updatedLesson : l) });

        await lessonRepository.update(lessonId, { attendance: updatedAttendance, attendanceCompleted: true });
    }
}));
