import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LandingPage } from '../features/landing';
import { LoginPage, RegisterPage } from '../features/auth';
import { DashboardPage } from '../features/dashboard';
import { FeedPage } from '../features/feed';
import { MyIssuesPage, IssueDetailPage } from '../features/issues';
import { ReportPage } from '../features/report';
import { StaffPage } from '../features/staff';
import { AdminPage } from '../features/admin';
import { SettingsPage } from '../features/settings';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: 'feed',
        element: (
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-issues',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <MyIssuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'issues',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <MyIssuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'issues/:id',
        element: (
          <ProtectedRoute>
            <IssueDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'report',
        element: (
          <ProtectedRoute allowedRoles={['student']}>
            <ReportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: '*',
        element: <Navigate to="/feed" replace />,
      },
    ],
  },
]);

export default router;
