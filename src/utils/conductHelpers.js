export const calculateStudentConduct = (studentId, lessons) => {
    if (!lessons || lessons.length === 0) return null;

    const conductCounts = {
        'Excelente': 0,
        'Buena': 0,
        'Regular': 0,
        'Mala': 0
    };

    let total = 0;

    lessons.forEach(lesson => {
        if (lesson.conducts && lesson.conducts[studentId]) {
            const c = lesson.conducts[studentId];
            if (conductCounts[c] !== undefined) {
                conductCounts[c]++;
                total++;
            }
        }
    });

    if (total === 0) return null;

    // Buscamos la moda (la conducta más frecuente)
    let mostFrequent = null;
    let maxCount = -1;

    for (const [conduct, count] of Object.entries(conductCounts)) {
        if (count > maxCount) {
            maxCount = count;
            mostFrequent = conduct;
        }
    }

    return mostFrequent;
};

export const getConductColor = (conduct) => {
    switch (conduct) {
        case 'Excelente': return 'bg-success/10 text-success border-success/20';
        case 'Buena': return 'bg-primary/10 text-primary border-primary/20';
        case 'Regular': return 'bg-warning/10 text-warning border-warning/20';
        case 'Mala': return 'bg-error/10 text-error border-error/20';
        default: return 'bg-surface-container-high text-outline border-outline-variant';
    }
};
