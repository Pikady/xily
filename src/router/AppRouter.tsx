import { createBrowserRouter } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { AppLayout } from '@/components/layout/AppLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <Dashboard />
      </AppLayout>
    )
  }
]);

export default router;