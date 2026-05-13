import { mockDb } from '../data/mockDb';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

export const calendarService = {
    getAggregatedEvents: (month, year, filters) => {
        let allEvents = [];

        // 1. Classes & Evaluations (from modules)
        if (filters.classes || filters.evaluations) {
            mockDb.coursePlans.forEach(cp => {
                const modules = mockDb.modules.filter(m => m.coursePlanId === cp.id);
                modules.forEach(mod => {
                    mod.classes.forEach(cls => {
                        if (cls.type === 'evaluation' && filters.evaluations && cls.evaluationData?.fecha) {
                            const dateObj = new Date(cls.evaluationData.fecha);
                            if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                                allEvents.push({
                                    id: cls.id,
                                    title: cls.title,
                                    date: cls.evaluationData.fecha,
                                    startTime: null,
                                    endTime: null,
                                    type: 'evaluation',
                                    source: 'evaluation',
                                    linked_entity: { coursePlanId: cp.id, moduleId: mod.id, classId: cls.id, courseName: cp.nombre },
                                    color: '#d97706', // warning color
                                    icon: 'assignment'
                                });
                            }
                        } else if (cls.type !== 'evaluation' && filters.classes && cls.scheduledDate) {
                            const dateObj = new Date(cls.scheduledDate);
                            if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                                allEvents.push({
                                    id: cls.id,
                                    title: cls.title,
                                    date: cls.scheduledDate,
                                    startTime: null,
                                    endTime: null,
                                    type: 'class',
                                    source: 'classplan',
                                    linked_entity: { coursePlanId: cp.id, moduleId: mod.id, classId: cls.id, courseName: cp.nombre },
                                    color: '#2563eb', // primary color
                                    icon: 'priority_high'
                                });
                            }
                        }
                    });
                });
            });
        }

        // 2. Birthdays (Students & Users)
        if (filters.birthdays) {
            const addBirthday = (person, typeLabel) => {
                if (!person.birthdate) return;
                const bDate = new Date(person.birthdate);
                if (bDate.getMonth() === month) {
                    // Create an event for the current year
                    const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(bDate.getDate() + 1).padStart(2, '0')}`;
                    allEvents.push({
                        id: `bday-${person.id}`,
                        title: `Cumpleaños de ${person.name}`,
                        date: eventDate,
                        startTime: null,
                        endTime: null,
                        type: 'birthday',
                        source: 'birthday',
                        linked_entity: { personId: person.id, type: typeLabel },
                        color: '#db2777', // pink color
                        icon: 'cake'
                    });
                }
            };
            
            mockDb.students.forEach(s => addBirthday(s, 'student'));
            mockDb.users.forEach(u => addBirthday(u, 'teacher'));
        }

        // 3. Manual Events
        if (filters.manual) {
            mockDb.manualEvents.forEach(ev => {
                const dateObj = new Date(ev.date);
                if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                    allEvents.push({
                        id: ev.id,
                        title: ev.title,
                        date: ev.date,
                        startTime: ev.startTime,
                        endTime: ev.endTime,
                        type: ev.type,
                        description: ev.description,
                        source: 'manual',
                        linked_entity: null,
                        color: ev.color || '#6750a4',
                        icon: ev.type === 'reunion' ? 'groups' : ev.type === 'recordatorio' ? 'notifications' : 'event'
                    });
                }
            });
        }

        // 4. Imported Events (Mocked structure)
        if (filters.imported) {
            mockDb.importedEvents.forEach(ev => {
                const dateObj = new Date(ev.date);
                if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                    allEvents.push({
                        ...ev,
                        source: 'imported',
                        icon: 'event_available'
                    });
                }
            });
        }

        // Sort by date and time
        return allEvents.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
            return a.startTime ? -1 : 1;
        });
    },

    createManualEvent: (data) => {
        const newEvent = {
            id: generateId('mev'),
            title: data.title,
            date: data.date,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            description: data.description || '',
            type: data.type || 'personal',
            color: data.color || '#6750a4',
            recurring: data.recurring || null,
            createdAt: new Date().toISOString().split('T')[0],
        };
        mockDb.manualEvents.push(newEvent);
        return newEvent;
    },

    importCalendar: (source, events) => {
        const newEvents = events.map(ev => ({
            id: generateId('imp'),
            title: ev.title,
            date: ev.date,
            startTime: ev.startTime || null,
            endTime: ev.endTime || null,
            description: ev.description || '',
            type: 'external',
            color: '#475569', // slate gray
            calendarSource: source, // 'google', 'outlook', 'ics'
        }));
        mockDb.importedEvents = [...mockDb.importedEvents, ...newEvents];
        return newEvents.length;
    }
};
