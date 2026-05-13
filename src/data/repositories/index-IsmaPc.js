import { BaseRepository } from './BaseRepository';
import { STORES } from '../db';

class UserRepository extends BaseRepository {
    constructor() { super(STORES.USERS); }
}

class CourseRepository extends BaseRepository {
    constructor() { super(STORES.COURSES); }
}

class ModuleRepository extends BaseRepository {
    constructor() { super(STORES.MODULES); }
    
    async getByCoursePlanId(coursePlanId, userId = null) {
        return this.getAll(userId, { coursePlanId });
    }
}

class StudentRepository extends BaseRepository {
    constructor() { super(STORES.STUDENTS); }

    async getByCourseId(courseId, userId = null) {
        return this.getAll(userId, { course_id: courseId });
    }
}

class LessonRepository extends BaseRepository {
    constructor() { super(STORES.LESSONS); }
    
    async getByCourseId(courseId, userId = null) {
        return this.getAll(userId, { course_id: courseId });
    }
}

class EvaluationRepository extends BaseRepository {
    constructor() { super(STORES.EVALUATIONS); }
    
    async getByCourseId(courseId, userId = null) {
        return this.getAll(userId, { course_id: courseId });
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
