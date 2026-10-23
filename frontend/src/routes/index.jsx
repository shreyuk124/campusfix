import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { FeedPage } from '../features/feed';
import { MyIssuesPage, IssueDetailPage } from '../features/issues';
import { ReportPage } from '../features/report';
import { StaffPage } from '../features/staff';
import { AdminPage } from '../features/admin';
import { LoginPage, RegisterPage } from '../features/auth';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Navigate to="/feed" replace />
          </ProtectedRoute>
        ),
      },
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
          <ProtectedRoute>
            <MyIssuesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'issues',
        element: (
          <ProtectedRoute>
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
          <ProtectedRoute>
            <ReportPage />
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