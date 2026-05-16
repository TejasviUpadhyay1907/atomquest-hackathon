import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardLayout from './components/DashboardLayout';
import EmployeeGoals from './pages/employee/EmployeeGoals';
import EmployeeCheckins from './pages/employee/EmployeeCheckins';
import ManagerApprovals from './pages/manager/ManagerApprovals';
import ManagerTeamCheckins from './pages/manager/ManagerTeamCheckins';
import AdminGoals from './pages/admin/AdminGoals';
import AdminSharedGoals from './pages/admin/AdminSharedGoals';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import NotificationsPage from './pages/NotificationsPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
