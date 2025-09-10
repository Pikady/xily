import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '@/contexts/AppContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;