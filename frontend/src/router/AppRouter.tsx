import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth pages
const Login = lazy(() => import('@/pages/auth/Login'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));

// Protected pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const ProjectList = lazy(() => import('@/pages/projects/ProjectList'));
const ProjectDetail = lazy(() => import('@/pages/projects/ProjectDetail'));
const EmployeeList = lazy(() => import('@/pages/employees/EmployeeList'));
const SprintList = lazy(() => import('@/pages/sprints/SprintList'));
const JiraList = lazy(() => import('@/pages/jira/JiraList'));
const JiraDetail = lazy(() => import('@/pages/jira/JiraDetail'));
const AiUsageList = lazy(() => import('@/pages/ai-usage/AiUsageList'));
const AiUsageDetail = lazy(() => import('@/pages/ai-usage/AiUsageDetail'));
const ExcelExport = lazy(() => import('@/pages/excel/ExcelExport'));

const Loader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.7s linear infinite' }} />
    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAppSelector(s => s.auth);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/sprints" element={<SprintList />} />
            <Route path="/jira" element={<JiraList />} />
            <Route path="/jira/:id" element={<JiraDetail />} />
            <Route path="/ai-usage" element={<AiUsageList />} />
            <Route path="/ai-usage/:id" element={<AiUsageDetail />} />
            <Route path="/excel" element={<ExcelExport />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
