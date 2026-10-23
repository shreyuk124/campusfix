import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { LandingPage } from '../features/landing';
import { DashboardPage } from '../features/dashboard';
import { IssuesPage } from '../features/issues';
import { ReportPage } from '../features/report';
import { FeedPage } from '../features/feed';
import { AdminPage } from '../features/admin';
import { StaffPage } from '../features/staff';
import { LoginPage } from '../features/auth';
import { SettingsPage } from '../features/settings';

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
        path: 'issues',
        element: <IssuesPage />,
      },
      {
        path: 'report',
        element: <ReportPage />,
      },
      {
        path: 'feed',
        element: <FeedPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: 'staff',
        element: <StaffPage />,
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
        path: '*',
        element: <DashboardPage />,
      },
    ],
  },
]);
