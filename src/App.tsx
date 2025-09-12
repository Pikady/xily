import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '@/contexts/AppContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TrayManager } from '@/components/tray'
import { NotificationCenter } from '@/components/tray'
import { useTrayStore } from '@/stores/trayStore'

// 托盘集成包装器组件
function AppWithTray() {
  const trayStore = useTrayStore()

  return (
    <TrayManager>
      <div className="min-h-screen bg-background">
        <RouterProvider router={router} />
        <Toaster />
        
        {/* 通知中心 - 显示托盘通知 */}
        <NotificationCenter
          notifications={trayStore.notifications}
          onClose={(id) => trayStore.removeNotification(id)}
          onClearAll={() => trayStore.clearNotifications()}
        />
      </div>
    </TrayManager>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppWithTray />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;