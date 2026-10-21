import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LandingPage } from '../features/landing';
import { DashboardPage } from '../features/dashboard';
import { FeedPage } from '../features/feed';
import { MyIssuesPage, IssueDetailPage } from '../features/issues';
import { ReportPage } from '../features/report';
import { StaffPage } from '../features/staff';
import { AdminPage } from '../features/admin';
import { SettingsPage } from '../features/settings';
import { LoginPage, RegisterPage } from '../features/auth';
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
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'my-issues',
        element: <MyIssuesPage />,
      },
      {
        path: 'issues',
        element: <Navigate to="/feed" replace />,
      },
      {
        path: 'issues/:id',
        element: <IssueDetailPage />,
      },
      {
        path: 'report',
        element: <ReportPage />,
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
        path: 'staff',
        element: (
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: <SettingsPage />,
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
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
