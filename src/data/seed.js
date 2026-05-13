import { mockDb } from './mockDb';
import { 
    userRepository, 
    courseRepository, 
    moduleRepository, 
    studentRepository, 
    lessonRepository, 
    evaluationRepository,
    calendarRepository
} from './repositories';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
    console.log("Starting DB seeding process...");

    // Check if we already have users
    const existingUsers = await userRepository.getAll();
    if (existingUsers.length > 0) {
        console.log("DB already seeded, skipping.");
        return;
    }

    // 1. Create Demo User
    const demoPassword = 'Bio2026Secure';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(demoPassword, salt);

    const demoUser = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        username: 'profebiologia',
        email: 'profe@academicclarity.com',
        passwordHash: passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null,
        isActive: true,
        role: 'teacher'
    };

    await userRepository.add(demoUser);
    const userId = demoUser.id;
    console.log("Demo user seeded");

    // Helper to add userId
    const addOwner = (item) => ({ ...item, userId });

    // 2. Seed Course Plans
    await courseRepository.addAll((mockDb.coursePlans || []).map(addOwner));
    console.log("Course Plans seeded");

    // 3. Seed Modules
    await moduleRepository.addAll((mockDb.modules || []).map(addOwner));
    console.log("Modules seeded");

    // 4. Seed Students
    const allStudentsMap = new Map();
    (mockDb.groups || []).forEach(group => {
        group.students.forEach(s => {
            allStudentsMap.set(s.id, { ...s, course_id: group.id, userId });
        });
    });
    const studentsArr = Array.from(allStudentsMap.values());
    if (studentsArr.length > 0) {
        await studentRepository.addAll(studentsArr);
    }
    
    // Seed teaching groups too (they are in mockDb.groups but were not seeded before? Ah, let's see if we should seed them to teaching groups repository. The existing code didn't seed teaching groups directly, wait. Let's look at the original code.)
    // Wait, the original code didn't have teaching_groups seeded. Let's keep it as is, just add userId to students.
    console.log("Students seeded");

    // 5. Seed Lessons
    const lessonsArr = (mockDb.lessons || []).map(l => ({ ...l, id: l.id || `les-${Math.random()}`, userId }));
    if (lessonsArr.length > 0) {
        await lessonRepository.addAll(lessonsArr);
    }
    console.log("Lessons seeded");

    // 6. Seed Evaluations
    if (mockDb.evaluations && mockDb.evaluations.length > 0) {
        await evaluationRepository.addAll(mockDb.evaluations.map(addOwner));
    }
    console.log("Evaluations seeded");

    // 7. Seed Calendar Events
    const events = [];
    if (mockDb.manualEvents) {
        events.push(...mockDb.manualEvents.map(e => ({ ...e, id: e.id || `ev-${Math.random()}`, userId })));
    }
    if (events.length > 0) {
        await calendarRepository.addAll(events);
    }
    console.log("Calendar events seeded");

    console.log("Seeding completed successfully!");
};
