const URUGUAY_HOLIDAYS = [
    { date: '2026-01-01', title: 'Año Nuevo', type: 'feriado' },
    { date: '2026-01-06', title: 'Día de los Reyes', type: 'feriado' },
    { date: '2026-02-16', title: 'Carnaval', type: 'feriado' },
    { date: '2026-02-17', title: 'Carnaval', type: 'feriado' },
    { date: '2026-04-02', title: 'Jueves Santo', type: 'feriado' },
    { date: '2026-04-03', title: 'Viernes Santo', type: 'feriado' },
    { date: '2026-04-19', title: 'Desembarco de los 33', type: 'feriado' },
    { date: '2026-05-01', title: 'Día del Trabajador', type: 'feriado' },
    { date: '2026-05-18', title: 'Batalla de las Piedras', type: 'feriado' },
    { date: '2026-06-19', title: 'Natalicio de Artigas', type: 'feriado' },
    { date: '2026-07-18', title: 'Jura de la Constitución', type: 'feriado' },
    { date: '2026-08-25', title: 'Declaratoria de la Independencia', type: 'feriado' },
    { date: '2026-10-12', title: 'Día de la Raza', type: 'feriado' },
    { date: '2026-11-02', title: 'Día de los Difuntos', type: 'feriado' },
    { date: '2026-12-25', title: 'Navidad', type: 'feriado' },
];

export const calendarService = {
    getAggregatedEvents: (month, year, filters, data) => {
        let allEvents = [];
        const { lessons = [], evaluations = [], students = [], calendarEvents = [], courses = [] } = data || {};

        // 1. Classes (Logged lessons AND scheduled weekly classes)
        if (filters.classes) {
            // Logged lessons
            lessons.forEach(lesson => {
                const dateObj = new Date(lesson.date);
                if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                    const course = courses.find(c => String(c.id) === String(lesson.course_id));
                    allEvents.push({
                        id: `lesson-${lesson.id}`,
                        title: `${course?.name || 'Clase'}: ${lesson.topic}`,
                        date: lesson.date,
                        type: 'class',
                        source: 'lesson',
                        color: '#2563eb',
                        icon: 'school'
                    });
                }
            });

            // Weekly Scheduled Classes
            courses.forEach(course => {
                if (course.schedule && Array.isArray(course.schedule)) {
                    course.schedule.forEach(sched => {
                        const dayIndex = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].indexOf(sched.day);
                        if (dayIndex === -1) return;

                        // Find all dates for this day in the given month/year
                        const firstDayOfMonth = new Date(year, month, 1);
                        const lastDayOfMonth = new Date(year, month + 1, 0);

                        for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
                            if (d.getDay() === dayIndex) {
                                const dateStr = d.toISOString().split('T')[0];
                                // Avoid duplication if there's already a logged lesson for this course on this day
                                const alreadyLogged = lessons.some(l => String(l.course_id) === String(course.id) && l.date === dateStr);
                                
                                if (!alreadyLogged) {
                                    allEvents.push({
                                        id: `sched-${course.id}-${dateStr}-${sched.startTime}`,
                                        title: `${course.name}: Clase semanal`,
                                        date: dateStr,
                                        type: 'class',
                                        source: 'schedule',
                                        color: '#3b82f6', // slightly lighter blue
                                        icon: 'calendar_today',
                                        startTime: sched.startTime,
                                        endTime: sched.endTime
                                    });
                                }
                            }
                        }
                    });
                }
            });
        }

        // 2. Evaluations
        if (filters.evaluations) {
            evaluations.forEach(ev => {
                const dateObj = new Date(ev.date);
                if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                    const course = courses.find(c => String(c.id) === String(ev.course_id));
                    allEvents.push({
                        id: `eval-${ev.id}`,
                        title: `[${ev.type}] ${course?.name || ''}: ${ev.title}`,
                        date: ev.date,
                        type: 'evaluation',
                        source: 'evaluation',
                        color: '#d97706',
                        icon: 'assignment'
                    });
                }
            });
        }

        // 3. Birthdays
        if (filters.birthdays) {
            students.forEach(s => {
                if (!s.birthdate) return;
                const bDate = new Date(s.birthdate);
                if (bDate.getUTCMonth() === month) {
                    const eventDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(bDate.getUTCDate()).padStart(2, '0')}`;
                    allEvents.push({
                        id: `bday-${s.id}`,
                        title: `Cumpleaños de ${s.name}`,
                        date: eventDate,
                        type: 'birthday',
                        source: 'birthday',
                        color: '#db2777',
                        icon: 'cake'
                    });
                }
            });
        }

        // 4. Holidays (Feriados)
        URUGUAY_HOLIDAYS.forEach(h => {
            const dateObj = new Date(h.date);
            if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                allEvents.push({
                    id: `holiday-${h.date}`,
                    title: h.title,
                    date: h.date,
                    type: 'holiday',
                    source: 'holiday',
                    color: '#059669', // green
                    icon: 'flag'
                });
            }
        });

        // 5. Manual Events
        if (filters.manual) {
            calendarEvents.forEach(ev => {
                const dateObj = new Date(ev.date);
                if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
                    allEvents.push({
                        ...ev,
                        source: 'manual',
                        icon: ev.type === 'reunion' ? 'groups' : ev.type === 'recordatorio' ? 'notifications' : 'event'
                    });
                }
            });
        }

        // Sort by date
        return allEvents.sort((a, b) => a.date.localeCompare(b.date));
    }
};

