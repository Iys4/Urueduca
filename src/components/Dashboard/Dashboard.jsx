import React, { useEffect, useState } from 'react';
import AlertsWidget from './AlertsWidget';
import CoursesSummary from './CoursesSummary';
import UpcomingEventsWidget from './UpcomingEventsWidget';
import QuickStats from './QuickStats';
import { dashboardService } from '../../services/dashboardService';
import { useAppStore } from '../../store/useAppStore';

const Dashboard = ({ user }) => {
    // Subscribe to store changes to make dashboard dynamic
    const store = useAppStore();
    
    // We compute the data on each render (or use memo if needed)
    // Since these are simple lookups/filters, it's efficient enough
    const nextClass = dashboardService.getNextClass(user.id);
    const alerts = dashboardService.getPendingAlerts(user.id);
    const courses = dashboardService.getCoursesSummary(user.id);
    const upcomingEvents = dashboardService.getUpcomingEvents(user.id);
    const stats = dashboardService.getQuickStats(user.id);

    const dateString = new Date().toLocaleDateString('es-UY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <section>
                <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
                    ¡Hola, {user?.name?.split(' ')[0] || user?.username || 'Colega'}!
                </h1>
                <p className="text-secondary mt-1 capitalize text-sm">
                    {dateString}
                </p>
            </section>

            {/* Main grid */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6 min-w-0">
                    <CoursesSummary courses={courses} />
                </div>
                <div className="w-full lg:w-[320px] space-y-6 shrink-0">
                    <UpcomingEventsWidget events={upcomingEvents} />
                    <QuickStats stats={stats} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
