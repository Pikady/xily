import { createBrowserRouter, Navigate } from 'react-router-dom'
import { SimpleLayout } from '@/components/layout/SimpleLayout'
import { WorksManager } from '@/components/works/WorksManager'
import { Dashboard } from '@/pages/Dashboard'
import { Timer } from '@/pages/Timer'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SimpleLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/works',
        element: <WorksManager />
      },
      {
        path: '/timer',
        element: <Timer />
      },
      {
        path: '/analytics',
        element: <Analytics />
      },
      {
        path: '/settings',
        element: <Settings />
      }
    ]
  }
])