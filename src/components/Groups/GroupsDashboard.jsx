import React, { useEffect, useState } from 'react';
import GroupCard from './GroupCard';
import { dashboardService } from '../../services/dashboardService';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import NewGroupModal from './NewGroupModal';

const GroupsDashboard = () => {
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const currentUser = useAuthStore(state => state.currentUser);
    const courses = useAppStore(state => state.courses);

    useEffect(() => {
        if (currentUser) {
            const data = dashboardService.getGroupsViewData(currentUser.id);
            setGroups(data);
        }
    }, [currentUser, courses]);

    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              g.institution.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || g.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const urgentCount = groups.filter(g => g.status === 'urgent').length;
    const todayCount = groups.filter(g => g.status === 'attention').length;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">Mis Grupos</h1>
                    <p className="text-sm text-secondary mt-1">
                        {groups.length} grupos activos
                        {urgentCount > 0 && <span className="text-error font-semibold"> · {urgentCount} requieren atención</span>}
                        {todayCount > 0 && <span className="text-primary font-semibold"> · {todayCount} con clase hoy</span>}
                    </p>
                </div>
                
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-on-primary px-4 py-2 rounded-xl transition-colors font-medium text-sm shadow-sm whitespace-nowrap"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Crear Grupo
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto mt-4">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Buscar grupo..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Status filter pills */}
                    <div className="flex gap-1 bg-surface-container rounded-lg p-1">
                        {[
                            { value: 'all', label: 'Todos' },
                            { value: 'urgent', label: 'Urgente' },
                            { value: 'attention', label: 'Hoy' },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFilterStatus(f.value)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    filterStatus === f.value
                                        ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                                        : 'text-outline hover:text-on-surface'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>


            {filteredGroups.length === 0 ? (
                <div className="text-center py-16">
                    <span className="material-symbols-outlined text-[48px] text-outline mb-3">search_off</span>
                    <p className="text-secondary font-medium">No se encontraron grupos con ese filtro</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredGroups.map(group => (
                        <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            )}

            <NewGroupModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default GroupsDashboard;
