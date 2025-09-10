import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimerState, TimerConfig, TimerSession } from '@/types/timer'
import { immer } from 'zustand/middleware/immer'

interface TimerStoreState {
  // 状态
  state: TimerState
  mode: 'explore' | 'utilize'
  config: TimerConfig
  currentSession: TimerSession | null
  sessionHistory: TimerSession[]
  
  // 计时器数据
  remainingTime: number
  isRunning: boolean
  startTime: number | null
  pauseTime: number | null
  
  // Actions
  startTimer: (mode: 'explore' | 'utilize', workId?: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => Promise<void>
  resetTimer: () => void
  updateConfig: (config: Partial<TimerConfig>) => void
  setMode: (mode: 'explore' | 'utilize') => void
  tick: () => void
  completeSession: () => Promise<void>
  clearHistory: () => void
}

export const useTimerStore = create<TimerStoreState>()(
  persist(
    immer((set, get) => ({
      // 初始状态
      state: 'idle',
      mode: 'explore',
      config: {
        focusTime: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        autoStartBreak: false,
        autoStartFocus: false,
        soundEnabled: true,
        notificationEnabled: true
      },
      currentSession: null,
      sessionHistory: [],
      remainingTime: 25 * 60, // 25分钟
      isRunning: false,
      startTime: null,
      pauseTime: null,

      startTimer: (mode: 'explore' | 'utilize', workId?: string) => {
        const state = get()
        const duration = state.config.focusTime * 60
        
        set((draft) => {
          draft.state = 'running'
          draft.mode = mode
          draft.isRunning = true
          draft.startTime = Date.now()
          draft.pauseTime = null
          draft.remainingTime = duration
          
          // 创建新的会话
          draft.currentSession = {
            id: Date.now().toString(),
            type: 'focus',
            mode,
            duration,
            startTime: new Date().toISOString(),
            endTime: null,
            isCompleted: false,
            workId
          }
        })
      },

      pauseTimer: () => {
        set((draft) => {
          draft.state = 'paused'
          draft.isRunning = false
          draft.pauseTime = Date.now()
          if (draft.currentSession) {
            draft.currentSession.pauseTime = new Date().toISOString()
          }
        })
      },

      resumeTimer: () => {
        const state = get()
        if (state.pauseTime && state.currentSession?.pauseTime) {
          const pauseDuration = Date.now() - state.pauseTime
          
          set((draft) => {
            draft.state = 'running'
            draft.isRunning = true
            draft.startTime = (draft.startTime || 0) + pauseDuration
            draft.pauseTime = null
            if (draft.currentSession) {
              draft.currentSession.resumeTime = new Date().toISOString()
            }
          })
        }
      },

      stopTimer: async () => {
        const state = get()
        
        if (state.currentSession) {
          // 完成当前会话
          await get().completeSession()
        }
        
        set((draft) => {
          draft.state = 'idle'
          draft.isRunning = false
          draft.startTime = null
          draft.pauseTime = null
          draft.remainingTime = draft.config.focusTime * 60
          draft.currentSession = null
        })
      },

      resetTimer: () => {
        const state = get()
        const duration = state.config.focusTime * 60
        
        set((draft) => {
          draft.state = 'idle'
          draft.isRunning = false
          draft.startTime = null
          draft.pauseTime = null
          draft.remainingTime = duration
          draft.currentSession = null
        })
      },

      updateConfig: (config: Partial<TimerConfig>) => {
        set((draft) => {
          draft.config = { ...draft.config, ...config }
        })
      },

      setMode: (mode: 'explore' | 'utilize') => {
        set((draft) => {
          draft.mode = mode
        })
      },

      tick: () => {
        const state = get()
        if (!state.isRunning || state.state !== 'running') return

        const elapsed = Math.floor((Date.now() - (state.startTime || 0)) / 1000)
        const newRemainingTime = Math.max(0, (state.config.focusTime * 60) - elapsed)

        set((draft) => {
          draft.remainingTime = newRemainingTime
          
          if (newRemainingTime === 0 && draft.currentSession) {
            // 计时器结束
            draft.state = 'completed'
            draft.isRunning = false
            draft.currentSession.endTime = new Date().toISOString()
            draft.currentSession.isCompleted = true
          }
        })

        // 自动处理计时器结束
        if (newRemainingTime === 0) {
          setTimeout(() => get().completeSession(), 100)
        }
      },

      completeSession: async () => {
        const state = get()
        
        if (state.currentSession) {
          const completedSession = {
            ...state.currentSession,
            endTime: new Date().toISOString(),
            isCompleted: true
          }
          
          // TODO: 调用API保存会话记录
          
          set((draft) => {
            if (completedSession.workId) {
              draft.sessionHistory.push(completedSession)
            }
            draft.currentSession = null
            draft.state = 'idle'
            draft.isRunning = false
            draft.remainingTime = draft.config.focusTime * 60
          })
        }
      },

      clearHistory: () => {
        set((draft) => {
          draft.sessionHistory = []
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