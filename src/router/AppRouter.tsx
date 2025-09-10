import { createBrowserRouter } from 'react-router-dom';
import { TestPage } from '@/pages/TestPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TestPage />
  }
]);

export default router;