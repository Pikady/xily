import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, AppSettings } from '@/types/app'
import { UserPreferences } from '@/types/frontend'
import { immer } from 'zustand/middleware/immer'

export interface AppStoreState {
  // 应用状态
  state: AppState
  initialized: boolean
  firstLaunch: boolean
  
  // 用户偏好
  preferences: UserPreferences
  
  // 应用设置
  settings: AppSettings
  
  // 更新信息
  update: {
    available: boolean
    version: string
    downloadProgress: number
    downloaded: boolean
  }
  
  // 统计信息
  stats: {
    totalSessions: number
    totalFocusTime: number
    currentStreak: number
    longestStreak: number
    lastActiveDate: string | null
  }
  
  // Actions
  initializeApp: () => Promise<void>
  setState: (state: AppState) => void
  setInitialized: (initialized: boolean) => void
  setFirstLaunch: (firstLaunch: boolean) => void
  
  // 偏好设置
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  resetPreferences: () => void
  
  // 应用设置
  updateSettings: (settings: Partial<AppSettings>) => void
  resetSettings: () => void
  
  // 更新管理
  checkForUpdates: () => Promise<void>
  downloadUpdate: () => Promise<void>
  installUpdate: () => Promise<void>
  
  // 统计信息
  updateStats: (stats: Partial<AppStoreState['stats']>) => void
  resetStats: () => void
  
  // 重置
  resetApp: () => void
}

export const useAppStore = create<AppStoreState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      state: 'loading',
      initialized: false,
      firstLaunch: true,
      
      preferences: {
        theme: 'light',
        language: 'zh-CN',
        autoStart: false,
        notifications: true,
        sounds: true
      },
      
      settings: {
        theme: 'light',
        language: 'zh-CN',
        auto_start: false,
        notifications: true,
        sounds: true,
        shortcuts: {
          toggle_timer: 'Ctrl+T',
          start_pause: 'Space',
          stop_timer: 'Ctrl+S',
          toggle_sidebar: 'Ctrl+B',
          toggle_float_window: 'Ctrl+F',
          quick_add_work: 'Ctrl+N'
        }
      },
      
      update: {
        available: false,
        version: '',
        downloadProgress: 0,
        downloaded: false
      },
      
      stats: {
        totalSessions: 0,
        totalFocusTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null
      },

      // 应用初始化
      initializeApp: async () => {
        try {
          // TODO: 调用API获取应用数据
          // await api.get('/app/initialize')
          
          set((draft) => {
            draft.state = 'ready'
            draft.initialized = true
          })
        } catch (error) {
          console.error('Failed to initialize app:', error)
          set((draft) => {
            draft.state = 'error'
          })
        }
      },

      setState: (state: AppState) => {
        set((draft) => {
          draft.state = state
        })
      },

      setInitialized: (initialized: boolean) => {
        set((draft) => {
          draft.initialized = initialized
        })
      },

      setFirstLaunch: (firstLaunch: boolean) => {
        set((draft) => {
          draft.firstLaunch = firstLaunch
        })
      },

      // 偏好设置
      updatePreferences: (preferences: Partial<UserPreferences>) => {
        set((draft) => {
          draft.preferences = { ...draft.preferences, ...preferences }
        })
      },

      resetPreferences: () => {
        set((draft) => {
          draft.preferences = {
            theme: 'light',
            language: 'zh-CN',
            autoStart: false,
            notifications: true,
            sounds: true
          }
        })
      },

      // 应用设置
      updateSettings: (settings: Partial<AppSettings>) => {
        set((draft) => {
          draft.settings = { ...draft.settings, ...settings }
        })
      },

      resetSettings: () => {
        set((draft) => {
          draft.settings = {
            theme: 'light',
            language: 'zh-CN',
            auto_start: false,
            notifications: true,
            sounds: true,
            shortcuts: {
              toggle_timer: 'Ctrl+T',
              start_pause: 'Space',
              stop_timer: 'Ctrl+S',
              toggle_sidebar: 'Ctrl+B',
              toggle_float_window: 'Ctrl+F',
              quick_add_work: 'Ctrl+N'
            }
          }
        })
      },

      // 更新管理
      checkForUpdates: async () => {
        try {
          // TODO: 调用Tauri API检查更新
          // const result = await checkUpdate()
          // set((draft) => {
          //   draft.update.available = result.available
          //   draft.update.version = result.version
          // })
        } catch (error) {
          console.error('Failed to check for updates:', error)
        }
      },

      downloadUpdate: async () => {
        try {
          set((draft) => {
            draft.update.downloadProgress = 0
          })
          
          // TODO: 调用Tauri API下载更新
          // await downloadUpdate()
          
          set((draft) => {
            draft.update.downloaded = true
          })
        } catch (error) {
          console.error('Failed to download update:', error)
        }
      },

      installUpdate: async () => {
        try {
          // TODO: 调用Tauri API安装更新
          // await installUpdate()
        } catch (error) {
          console.error('Failed to install update:', error)
        }
      },

      // 统计信息
      updateStats: (stats: Partial<AppStoreState['stats']>) => {
        set((draft) => {
          draft.stats = { ...draft.stats, ...stats }
        })
      },

      resetStats: () => {
        set((draft) => {
          draft.stats = {
            totalSessions: 0,
            totalFocusTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null
          }
        })
      },

      // 重置
      resetApp: () => {
        set((draft) => {
          draft.state = 'loading'
          draft.initialized = false
          draft.firstLaunch = true
          draft.update = {
            available: false,
            version: '',
            downloadProgress: 0,
            downloaded: false
          }
        })
      }
    })),
    {
      name: 'app-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        settings: state.settings,
        stats: state.stats,
        firstLaunch: state.firstLaunch
      })
    }
  )
)