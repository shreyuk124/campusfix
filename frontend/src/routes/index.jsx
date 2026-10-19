import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { FeedPage } from '../features/feed';
import { IssuesPage } from '../features/issues';
import { ReportPage } from '../features/report';
import { StaffPage } from '../features/staff';
import { AdminPage } from '../features/admin';
import { LoginPage } from '../features/auth';

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
        path: 'issues',
        element: <IssuesPage />,
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
    ],
  },
]);