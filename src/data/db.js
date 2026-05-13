import { openDB } from 'idb';

const DB_NAME = 'academic_clarity_db';
const DB_VERSION = 2;

export const STORES = {
    USERS: 'users',
    STUDENTS: 'students',
    COURSES: 'courses',
    MODULES: 'modules',
    LESSONS: 'lessons', // lesson_templates & actual lessons combined or separated? We will use unified classes per the current structure.
    TEACHING_GROUPS: 'teaching_groups',
    EVALUATIONS: 'evaluations',
    ALERTS: 'alerts',
    CALENDAR_EVENTS: 'calendar_events',
};

let dbPromise = null;

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                if (oldVersion < 1) {
                    // Create stores
                    if (!db.objectStoreNames.contains(STORES.USERS)) db.createObjectStore(STORES.USERS, { keyPath: 'id' });
                    if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
                        const studentStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
                        studentStore.createIndex('course_id', 'course_id', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.COURSES)) db.createObjectStore(STORES.COURSES, { keyPath: 'id' });
                    if (!db.objectStoreNames.contains(STORES.MODULES)) {
                        const moduleStore = db.createObjectStore(STORES.MODULES, { keyPath: 'id' });
                        moduleStore.createIndex('coursePlanId', 'coursePlanId', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.LESSONS)) {
                        const lessonStore = db.createObjectStore(STORES.LESSONS, { keyPath: 'id' });
                        lessonStore.createIndex('course_id', 'course_id', { unique: false });
                        lessonStore.createIndex('date', 'date', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.TEACHING_GROUPS)) db.createObjectStore(STORES.TEACHING_GROUPS, { keyPath: 'id' });
                    if (!db.objectStoreNames.contains(STORES.EVALUATIONS)) {
                        const evalStore = db.createObjectStore(STORES.EVALUATIONS, { keyPath: 'id' });
                        evalStore.createIndex('course_id', 'course_id', { unique: false });
                    }
                    if (!db.objectStoreNames.contains(STORES.ALERTS)) db.createObjectStore(STORES.ALERTS, { keyPath: 'id' });
                    if (!db.objectStoreNames.contains(STORES.CALENDAR_EVENTS)) {
                        const eventsStore = db.createObjectStore(STORES.CALENDAR_EVENTS, { keyPath: 'id' });
                        eventsStore.createIndex('type', 'type', { unique: false });
                    }
                }
                if (oldVersion < 2) {
                    // Add indexes for authentication and user isolation
                    const usersStore = transaction.objectStore(STORES.USERS);
                    if (!usersStore.indexNames.contains('email')) usersStore.createIndex('email', 'email', { unique: true });
                    if (!usersStore.indexNames.contains('username')) usersStore.createIndex('username', 'username', { unique: true });

                    // Add userId index to other stores for filtering
                    const storesToUpdate = [
                        STORES.STUDENTS, STORES.COURSES, STORES.MODULES, 
                        STORES.LESSONS, STORES.TEACHING_GROUPS, STORES.EVALUATIONS, 
                        STORES.ALERTS, STORES.CALENDAR_EVENTS
                    ];
                    
                    storesToUpdate.forEach(storeName => {
                        const store = transaction.objectStore(storeName);
                        if (!store.indexNames.contains('userId')) {
                            store.createIndex('userId', 'userId', { unique: false });
                        }
                    });
                }
            },
        });
    }
    return dbPromise;
};

// Utils for global reset
export const resetDatabase = async () => {
    if (dbPromise) {
        const db = await dbPromise;
        db.close();
        dbPromise = null;
    }
    // Cannot delete if active connections, we just delete and reopen.
    await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(DB_NAME);
        req.onsuccess = resolve;
        req.onerror = reject;
        req.onblocked = () => {
            console.warn("DB Deletion blocked. Close other tabs.");
            resolve();
        };
    });
    // Re-init
    return getDB();
};
