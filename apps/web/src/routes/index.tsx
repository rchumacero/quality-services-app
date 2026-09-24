import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../features/dashboard/components/DashboardLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { RepliesPage } from '../features/replies/RepliesPage';
import { EvaluationsPage } from '../features/evaluations/EvaluationsPage';

const LoginRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
};

const PermissionRoute: React.FC<{ menuName: string; children: React.ReactElement }> = ({
  menuName,
  children,
}) => {
  const { isMenuAllowed } = useAuth();
  if (!isMenuAllowed(menuName)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginRedirect />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="users"
          element={
            <PermissionRoute menuName="Admin">
              <DashboardPage />
            </PermissionRoute>
          }
        />
        <Route
          path="brands"
          element={
            <PermissionRoute menuName="Admin">
              <DashboardPage />
            </PermissionRoute>
          }
        />
        <Route
          path="replies"
          element={
            <PermissionRoute menuName="Replies">
              <RepliesPage />
            </PermissionRoute>
          }
        />
        <Route
          path="evaluations"
          element={
            <PermissionRoute menuName="Evaluations">
              <EvaluationsPage />
            </PermissionRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
