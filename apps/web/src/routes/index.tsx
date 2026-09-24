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
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
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
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<DashboardPage />} />
        <Route path="brands" element={<DashboardPage />} />
        <Route path="replies" element={<RepliesPage />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
