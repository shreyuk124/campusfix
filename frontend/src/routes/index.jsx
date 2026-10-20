import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { FeedPage } from '../features/feed';
import { MyIssuesPage, IssueDetailPage } from '../features/issues';
import { ReportPage } from '../features/report';
import { StaffPage } from '../features/staff';
import { AdminPage } from '../features/admin';
import { LoginPage, RegisterPage } from '../features/auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <FeedPage />,
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
        element: <MyIssuesPage />,
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
        path: 'staff',
        element: <StaffPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
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
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);