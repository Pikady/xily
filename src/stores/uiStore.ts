import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UIState, ViewMode } from '@/types/ui'
import { ThemeMode } from '@/types/app'
import { immer } from 'zustand/middleware/immer'

interface UIStoreState {
  // 主题
  theme: ThemeMode
  
  // 布局
  sidebarCollapsed: boolean
  headerVisible: boolean
  
  // 视图模式
  viewMode: ViewMode
  
  // 悬浮窗
  floatWindow: {
    visible: boolean
    position: { x: number; y: number }
    size: number
    opacity: number
    alwaysOnTop: boolean
  }
  
  // 通知
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
    timestamp: number
  }>
  
  // 模态框
  modals: {
    workForm: boolean
    settings: boolean
    export: boolean
    about: boolean
  }
  
  // 加载状态
  loading: {
    global: boolean
    works: boolean
    stats: boolean
  }
  
  // Actions
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setHeaderVisible: (visible: boolean) => void
  setViewMode: (mode: ViewMode) => void
  
  // 悬浮窗操作
  toggleFloatWindow: () => void
  setFloatWindowPosition: (position: { x: number; y: number }) => void
  setFloatWindowSize: (size: number) => void
  setFloatWindowOpacity: (opacity: number) => void
  setFloatWindowAlwaysOnTop: (alwaysOnTop: boolean) => void
  
  // 通知操作
  addNotification: (notification: Omit<UIStoreState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // 模态框操作
  openModal: (modal: keyof UIStoreState['modals']) => void
  closeModal: (modal: keyof UIStoreState['modals']) => void
  toggleModal: (modal: keyof UIStoreState['modals']) => void
  
  // 加载状态操作
  setLoading: (key: keyof UIStoreState['loading'], loading: boolean) => void
  resetLoading: () => void
  
  // 重置
  resetUI: () => void
}

export const useUIStore = create<UIStoreState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      theme: 'light',
      sidebarCollapsed: false,
      headerVisible: true,
      viewMode: 'grid',
      
      floatWindow: {
        visible: false,
        position: { x: 100, y: 100 },
        size: 120,
        opacity: 0.8,
        alwaysOnTop: true
      },
      
      notifications: [],
      
      modals: {
        workForm: false,
        settings: false,
        export: false,
        about: false
      },
      
      loading: {
        global: false,
        works: false,
        stats: false
      },

      // 主题操作
      setTheme: (theme: ThemeMode) => {
        set((draft) => {
          draft.theme = theme
          // 应用主题到文档根元素
          document.documentElement.setAttribute('data-theme', theme)
        })
      },

      // 布局操作
      toggleSidebar: () => {
        set((draft) => {
          draft.sidebarCollapsed = !draft.sidebarCollapsed
        })
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set((draft) => {
          draft.sidebarCollapsed = collapsed
        })
      },

      setHeaderVisible: (visible: boolean) => {
        set((draft) => {
          draft.headerVisible = visible
        })
      },

      setViewMode: (mode: ViewMode) => {
        set((draft) => {
          draft.viewMode = mode
        })
      },

      // 悬浮窗操作
      toggleFloatWindow: () => {
        set((draft) => {
          draft.floatWindow.visible = !draft.floatWindow.visible
        })
      },

      setFloatWindowPosition: (position: { x: number; y: number }) => {
        set((draft) => {
          draft.floatWindow.position = position
        })
      },

      setFloatWindowSize: (size: number) => {
        set((draft) => {
          draft.floatWindow.size = size
        })
      },

      setFloatWindowOpacity: (opacity: number) => {
        set((draft) => {
          draft.floatWindow.opacity = Math.max(0.1, Math.min(1, opacity))
        })
      },

      setFloatWindowAlwaysOnTop: (alwaysOnTop: boolean) => {
        set((draft) => {
          draft.floatWindow.alwaysOnTop = alwaysOnTop
        })
      },

      // 通知操作
      addNotification: (notification) => {
        const id = Date.now().toString()
        const timestamp = Date.now()
        
        set((draft) => {
          draft.notifications.push({
            ...notification,
            id,
            timestamp
          })
        })

        // 自动移除通知
        const duration = notification.duration || 5000
        setTimeout(() => {
          get().removeNotification(id)
        }, duration)
      },

      removeNotification: (id: string) => {
        set((draft) => {
          draft.notifications = draft.notifications.filter(n => n.id !== id)
        })
      },

      clearNotifications: () => {
        set((draft) => {
          draft.notifications = []
        })
      },

      // 模态框操作
      openModal: (modal: keyof UIStoreState['modals']) => {
        set((draft) => {
          draft.modals[modal] = true
        })
      },

      closeModal: (modal: keyof UIStoreState['modals']) => {
        set((draft) => {
          draft.modals[modal] = false
        })
      },

      toggleModal: (modal: keyof UIStoreState['modals']) => {
        set((draft) => {
          draft.modals[modal] = !draft.modals[modal]
        })
      },

      // 加载状态操作
      setLoading: (key: keyof UIStoreState['loading'], loading: boolean) => {
        set((draft) => {
          draft.loading[key] = loading
        })
      },

      resetLoading: () => {
        set((draft) => {
          draft.loading = {
            global: false,
            works: false,
            stats: false
          }
        })
      },

      // 重置
      resetUI: () => {
        set((draft) => {
          draft.theme = 'light'
          draft.sidebarCollapsed = false
          draft.headerVisible = true
          draft.viewMode = 'dashboard'
          draft.floatWindow = {
            visible: false,
            position: { x: 100, y: 100 },
            size: 120,
            opacity: 0.8,
            alwaysOnTop: true
          }
          draft.notifications = []
          draft.modals = {
            workForm: false,
            settings: false,
            export: false,
            about: false
          }
          draft.loading = {
            global: false,
            works: false,
            stats: false
          }
        })
      }
    })),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        floatWindow: state.floatWindow
      })
    }
  )
)