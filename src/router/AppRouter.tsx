import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Works } from '@/pages/Works';
import { AppLayout } from '@/components/layout/AppLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    )
  },
  {
    path: '/works',
    element: (
      <AppLayout>
        <Works />
      </AppLayout>
    )
  }
]);

export default router;