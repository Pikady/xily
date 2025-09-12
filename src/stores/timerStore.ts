import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimerState, TimerConfig, TimerSession, TimerMode } from '@/types/timer'
import { TimerAPI } from '@/services/api'
import { immer } from 'zustand/middleware/immer'
import { useAnalyticsStore } from './analyticsStore'

export interface TimerStoreState {
  // 状态
  state: TimerState
  mode: TimerMode
  config: TimerConfig
  currentSession: TimerSession | null
  sessionHistory: TimerSession[]
  loading: boolean
  error: string | null
  
  // 计时器数据
  remainingTime: number
  isRunning: boolean
  startTime: number | null
  pauseTime: number | null
  
  // Actions
  startTimer: (mode: TimerMode, workId?: number) => Promise<void>
  pauseTimer: () => Promise<void>
  resumeTimer: () => Promise<void>
  stopTimer: () => Promise<void>
  resetTimer: () => void
  updateConfig: (config: Partial<TimerConfig>) => Promise<void>
  setMode: (mode: TimerMode) => void
  tick: () => void
  completeSession: () => Promise<void>
  fetchTimerHistory: (workId?: number) => Promise<void>
  clearHistory: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTimerStore = create<TimerStoreState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      state: 'idle',
      mode: 'explore',
      config: {
        focusDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        notificationEnabled: true
      },
      currentSession: null,
      sessionHistory: [],
      loading: false,
      error: null,
      remainingTime: 25 * 60, // 25分钟
      isRunning: false,
      startTime: null,
      pauseTime: null,

      startTimer: async (mode: TimerMode, workId?: number) => {
        try {
          set({ loading: true, error: null })
          
          const duration = get().config.focusDuration
          
          // 如果没有选择作品，显示提示但允许继续
          if (!workId) {
            console.log('未选择作品，将开始无归属的计时')
          }
          
          const session = await TimerAPI.startTimer({
            mode,
            workId,
            duration
          })
          
          set((draft) => {
            draft.state = 'running'
            draft.mode = mode
            draft.isRunning = true
            draft.startTime = Date.now()
            draft.pauseTime = null
            draft.remainingTime = duration * 60
            draft.currentSession = session
            draft.loading = false
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start timer',
            loading: false 
          })
          throw error
        }
      },

      pauseTimer: async () => {
        try {
          set({ loading: true, error: null })
          
          if (get().currentSession) {
            await TimerAPI.pauseTimer(get().currentSession!.id)
            set((draft) => {
              draft.state = 'paused'
              draft.isRunning = false
              draft.pauseTime = Date.now()
              draft.loading = false
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to pause timer',
            loading: false 
          })
          throw error
        }
      },

      resumeTimer: async () => {
        try {
          set({ loading: true, error: null })
          
          if (get().currentSession) {
            await TimerAPI.resumeTimer(get().currentSession!.id)
            const state = get()
            if (state.pauseTime) {
              const pauseDuration = Date.now() - state.pauseTime
              set((draft) => {
                draft.state = 'running'
                draft.isRunning = true
                draft.startTime = (draft.startTime || 0) + pauseDuration
                draft.pauseTime = null
                draft.loading = false
              })
            }
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to resume timer',
            loading: false 
          })
          throw error
        }
      },

      stopTimer: async () => {
        try {
          set({ loading: true, error: null })
          
          if (get().currentSession) {
            await TimerAPI.stopTimer(get().currentSession!.id)
            await get().completeSession()
          }
          
          set((draft) => {
            draft.state = 'idle'
            draft.isRunning = false
            draft.startTime = null
            draft.pauseTime = null
            draft.remainingTime = draft.config.focusDuration * 60
            draft.currentSession = null
            draft.loading = false
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to stop timer',
            loading: false 
          })
          throw error
        }
      },

      resetTimer: () => {
        const duration = get().config.focusDuration
        
        set((draft) => {
          draft.state = 'idle'
          draft.isRunning = false
          draft.startTime = null
          draft.pauseTime = null
          draft.remainingTime = duration * 60
          draft.currentSession = null
        })
      },

      updateConfig: async (config: Partial<TimerConfig>) => {
        try {
          set({ loading: true, error: null })
          const updatedConfig = await TimerAPI.updateTimerConfig(config)
          
          set((draft) => {
            draft.config = updatedConfig
            draft.loading = false
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update config',
            loading: false 
          })
          throw error
        }
      },

      setMode: (mode: TimerMode) => {
        set((draft) => {
          draft.mode = mode
        })
      },

      tick: () => {
        const state = get()
        if (!state.isRunning || state.state !== 'running') return

        const elapsed = Math.floor((Date.now() - (state.startTime || 0)) / 1000)
        const newRemainingTime = Math.max(0, (state.config.focusDuration * 60) - elapsed)

        set((draft) => {
          draft.remainingTime = newRemainingTime
          
          if (newRemainingTime === 0 && draft.currentSession) {
            draft.state = 'completed'
            draft.isRunning = false
          }
        })

        // 自动处理计时器结束 - 使用更可靠的方式
        if (newRemainingTime === 0) {
          // 使用 requestAnimationFrame 避免竞态条件
          requestAnimationFrame(() => {
            const currentState = get()
            if (currentState.state === 'completed' && currentState.remainingTime === 0) {
              get().completeSession().catch(console.error)
            }
          })
        }
      },

      completeSession: async () => {
        try {
          const state = get()
          
          if (state.currentSession) {
            // 停止计时器会话
            await TimerAPI.stopTimer(state.currentSession.id)
            
            set((draft) => {
              if (state.currentSession) {
                draft.sessionHistory.push(state.currentSession)
              }
              draft.currentSession = null
              draft.state = 'idle'
              draft.isRunning = false
              draft.remainingTime = draft.config.focusDuration * 60
            })
            
            // 触发analytics数据更新
            const analyticsStore = useAnalyticsStore.getState()
            analyticsStore.fetchData('all')
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to complete session'
          })
          throw error
        }
      },

      fetchTimerHistory: async (workId?: number) => {
        try {
          set({ loading: true, error: null })
          const history = await TimerAPI.getTimerHistory(workId)
          
          set((draft) => {
            draft.sessionHistory = history
            draft.loading = false
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch timer history',
            loading: false 
          })
          throw error
        }
      },

      clearHistory: () => {
        set((draft) => {
          draft.sessionHistory = []
        })
      },

      setLoading: (loading: boolean) => {
        set((draft) => {
          draft.loading = loading
        })
      },

      setError: (error: string | null) => {
        set((draft) => {
          draft.error = error
        })
      }
    })),
    {
      name: 'timer-storage',
      partialize: (state) => ({
        config: state.config,
        sessionHistory: state.sessionHistory
      })
    }
  )
)