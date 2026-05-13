import React, { useEffect, useState } from 'react';
import NextClassCard from './NextClassCard';
import AlertsWidget from './AlertsWidget';
import CoursesSummary from './CoursesSummary';
import AgendaWidget from './AgendaWidget';
import QuickStats from './QuickStats';
import { dashboardService } from '../../services/dashboardService';

const Dashboard = ({ user }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const nextClass = dashboardService.getNextClass(user.id);
        const alerts = dashboardService.getPendingAlerts(user.id);
        const courses = dashboardService.getCoursesSummary(user.id);
        const todayLessons = dashboardService.getTodayLessons(user.id);
        const stats = dashboardService.getQuickStats();
        setData({ nextClass, alerts, courses, todayLessons, stats });
    }, [user.id]);

    if (!data) return (
        <div className="space-y-6">
            <div className="skeleton h-8 w-64" />
            <div className="skeleton h-40 w-full" />
            <div className="skeleton h-60 w-full" />
        </div>
    );

    const { nextClass, alerts, courses, todayLessons, stats } = data;
    const dateString = new Date().toLocaleDateString('es-UY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <section>
                <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight">
                    ¡Hola, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-secondary mt-1 capitalize text-sm">
                    {dateString}
                </p>
            </section>

            {/* Urgent alerts first */}
            <AlertsWidget alerts={alerts} />

            {/* Main grid */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6 min-w-0">
                    <NextClassCard lesson={nextClass} />
                    <CoursesSummary courses={courses} />
                </div>
                <div className="w-full lg:w-[320px] space-y-6 shrink-0">
                    <AgendaWidget lessons={todayLessons} />
                    <QuickStats stats={stats} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
