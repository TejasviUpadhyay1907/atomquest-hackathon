import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const EmployeeGoals = lazy(() => import('./pages/employee/EmployeeGoals'));
const EmployeeCheckins = lazy(() => import('./pages/employee/EmployeeCheckins'));
const ManagerApprovals = lazy(() => import('./pages/manager/ManagerApprovals'));
const ManagerTeamCheckins = lazy(() => import('./pages/manager/ManagerTeamCheckins'));
const AdminGoals = lazy(() => import('./pages/admin/AdminGoals'));
const AdminSharedGoals = lazy(() => import('./pages/admin/AdminSharedGoals'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

// Loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
      <Spin size="large" />
      <div style={{ marginTop: '16px', color: '#666' }}>Loading AtomQuest...</div>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  // Performance monitoring
  useEffect(() => {
    console.log('AtomQuest Goal Tracker - React App Initialized');
    console.log('Environment:', import.meta.env.MODE);
    console.log('API URL:', import.meta.env.VITE_API_URL);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  {/* Default redirect based on role */}
                  <Route
                    path="/"
                    element={
                      user?.role === 'Admin' ? (
                        <Navigate to="/admin/goals" replace />
                      ) : user?.role === 'Manager' ? (
                        <Navigate to="/manager/approvals" replace />
                      ) : (
                        <Navigate to="/employee/goals" replace />
                      )
                    }
                  />

                  {/* Employee Routes */}
                  <Route path="/employee/goals" element={<EmployeeGoals />} />
                  <Route path="/employee/checkins" element={<EmployeeCheckins />} />

                  {/* Manager Routes */}
                  <Route
                    path="/manager/approvals"
                    element={
                      <ProtectedRoute requiredRole="Manager">
                        <ManagerApprovals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/manager/team-checkins"
                    element={
                      <ProtectedRoute requiredRole="Manager">
                        <ManagerTeamCheckins />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/goals"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <AdminGoals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shared-goals"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <AdminSharedGoals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={
                      <ProtectedRoute requiredRole="Admin">
                        <AdminAuditLogs />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shared Routes */}
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/notifications" element={<NotificationsPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all 404 for non-dashboard routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
