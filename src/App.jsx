import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Dashboard/Sidebar';
import Header from './components/Dashboard/Header';
import Dashboard from './components/Dashboard/Dashboard';
import GroupsDashboard from './components/Groups/GroupsDashboard';
import GroupDetail from './components/GroupDetail/GroupDetail';
import EvaluationGrading from './components/Groups/EvaluationGrading';
import CoursePlanningDashboard from './components/CoursePlanning/CoursePlanningDashboard';
import CourseDetail from './components/CoursePlanning/CourseDetail/CourseDetail';
import StudentsDashboard from './components/Students/StudentsDashboard';
import CalendarHub from './components/Calendar/CalendarHub';
import Settings from './components/Views/Settings';
import DevPanel from './components/DevPanel/DevPanel';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { useAppStore } from './store/useAppStore';
import { useAuthStore } from './store/useAuthStore';
import { seedDatabase } from './data/seed';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const MainLayout = ({ children }) => {
  const currentUser = useAuthStore(state => state.currentUser);
  
  return (
    <>
      <Sidebar user={currentUser} />
      <Header />
      <div className="main-area lg:ml-[260px] pt-14 pb-20 lg:pb-8 min-h-screen">
        <main className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
      <DevPanel />
    </>
  );
};

function AppContent() {
  const restoreSession = useAuthStore(state => state.restoreSession);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const currentUser = useAuthStore(state => state.currentUser);
  
  const isHydrated = useAppStore(state => state.isHydrated);
  const initStore = useAppStore(state => state.init);

  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        console.log("App booting...");
        // 1. Ensure DB is seeded (creates demo user)
        await seedDatabase();
        // 2. Try to restore session
        await restoreSession();
      } catch (error) {
        console.error("Boot error:", error);
      } finally {
        if (mounted) setBooting(false);
      }
    };
    boot();
    return () => { mounted = false; };
  }, [restoreSession]);

  useEffect(() => {
    if (isAuthenticated && currentUser && !isHydrated) {
      initStore(currentUser.id);
    }
  }, [isAuthenticated, currentUser, isHydrated, initStore]);

  if (booting || (isAuthenticated && !isHydrated)) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-on-surface-variant font-medium">Cargando EducaAmigo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout><Dashboard user={currentUser} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/groups" element={
          <ProtectedRoute>
            <MainLayout><GroupsDashboard /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/groups/:id/*" element={
          <ProtectedRoute>
            <MainLayout><GroupDetail /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/groups/:id/evaluations/:evalId" element={
          <ProtectedRoute>
            <MainLayout><EvaluationGrading /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/planning" element={
          <ProtectedRoute>
            <MainLayout><CoursePlanningDashboard /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/planning/:id/*" element={
          <ProtectedRoute>
            <MainLayout><CourseDetail /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/students" element={
          <ProtectedRoute>
            <MainLayout><StudentsDashboard /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar/*" element={
          <ProtectedRoute>
            <MainLayout><CalendarHub /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout><Settings user={currentUser} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;

