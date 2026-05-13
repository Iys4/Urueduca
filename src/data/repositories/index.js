import { BaseRepository } from './BaseRepository';
import { STORES, getDB } from '../db';

class UserRepository extends BaseRepository {
    constructor() { super(STORES.USERS); }
}

class CourseRepository extends BaseRepository {
    constructor() { super(STORES.COURSES); }
}

class ModuleRepository extends BaseRepository {
    constructor() { super(STORES.MODULES); }
    
    async getByCoursePlanId(coursePlanId, userId = null) {
        const db = await getDB();
        const items = await db.getAllFromIndex(STORES.MODULES, 'coursePlanId', coursePlanId);
        if (userId) return items.filter(item => item.userId === userId);
        return items;
    }
}

class StudentRepository extends BaseRepository {
    constructor() { super(STORES.STUDENTS); }

    async getByCourseId(courseId, userId = null) {
        const db = await getDB();
        const items = await db.getAllFromIndex(STORES.STUDENTS, 'course_id', courseId);
        if (userId) return items.filter(item => item.userId === userId);
        return items;
    }
}

class LessonRepository extends BaseRepository {
    constructor() { super(STORES.LESSONS); }
    
    async getByCourseId(courseId, userId = null) {
        const db = await getDB();
        const items = await db.getAllFromIndex(STORES.LESSONS, 'course_id', courseId);
        if (userId) return items.filter(item => item.userId === userId);
        return items;
    }
}

class EvaluationRepository extends BaseRepository {
    constructor() { super(STORES.EVALUATIONS); }
    
    async getByCourseId(courseId, userId = null) {
        const db = await getDB();
        const items = await db.getAllFromIndex(STORES.EVALUATIONS, 'course_id', courseId);
        if (userId) return items.filter(item => item.userId === userId);
        return items;
    }
}

class CalendarRepository extends BaseRepository {
    constructor() { super(STORES.CALENDAR_EVENTS); }
}

export const userRepository = new UserRepository();
export const courseRepository = new CourseRepository();
export const moduleRepository = new ModuleRepository();
export const studentRepository = new StudentRepository();
export const lessonRepository = new LessonRepository();
export const evaluationRepository = new EvaluationRepository();
export const calendarRepository = new CalendarRepository();
