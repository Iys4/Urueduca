import React, { useEffect, useState } from 'react';
import { Badge } from '../../Shared';
import { dashboardService } from '../../../services/dashboardService';

const RosterTab = ({ groupId }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const data = dashboardService.getStudentsByCourse(groupId);
        setStudents(data);
    }, [groupId]);

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPerformanceVariant = (avg) => {
        if (avg >= 9) return 'success';
        if (avg >= 6) return 'neutral';
        if (avg >= 4) return 'warning';
        return 'urgent';
    };

    if (students.length === 0) return (
        <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-outline mb-3">person_off</span>
            <p className="text-secondary font-medium">No hay alumnos registrados</p>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-on-surface">
                    Listado de Alumnos
                    <span className="text-sm font-normal text-secondary ml-2">({students.length})</span>
                </h2>
                <div className="relative w-full sm:w-auto">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Buscar alumno..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-56 pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="rounded-lg border border-outline-variant overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant">
                            <th className="text-left py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Nombre</th>
                            <th className="text-left py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                            <th className="text-right py-2.5 px-4 text-[11px] font-bold text-outline uppercase tracking-wider">Promedio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                        {filtered.map(student => (
                            <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors">
                                <td className="py-2.5 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[11px] font-bold shrink-0">
                                            {student.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-on-surface">{student.name}</span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-4 text-sm text-secondary hidden sm:table-cell">{student.email}</td>
                                <td className="py-2.5 px-4 text-right">
                                    <Badge variant={getPerformanceVariant(student.avg)} className="ml-auto">
                                        {student.avg.toFixed(1)}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="p-8 text-center text-secondary text-sm">
                        No se encontraron alumnos con "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default RosterTab;
