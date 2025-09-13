import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TimerState, TimerConfig, TimerSession, TimerMode } from '@/types/timer'
import { TimerAPI } from '@/services/api'
import { immer } from 'zustand/middleware/immer'
import { triggerDataSync } from '@/services/DataSyncManager'
import { emit } from '@/events/EventBus'
import { errorHandler, ErrorCodes, ErrorCategory } from '@/errors/ErrorHandler'

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
          
          // 仅记录开始计时，不依赖后端返回session
          const startTime = Date.now()
          const tempSession: TimerSession = {
            id: Date.now(), // 临时ID，完成时替换
            workId: workId || 0,
            mode,
            duration,
            actualDuration: 0,
            remainingTime: duration * 60,
            isActive: true,
            isPaused: false,
            isCompleted: false,
            startTime: new Date(startTime).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          // 先更新前端状态，确保用户界面立即响应
          set((draft) => {
            draft.state = 'running'
            draft.mode = mode
            draft.isRunning = true
            draft.startTime = startTime
            draft.pauseTime = null
            draft.remainingTime = duration * 60
            draft.currentSession = tempSession
            draft.loading = false
          })
          
          // 异步通知后端开始计时（不等待完成，不阻塞前端）
          TimerAPI.startTimer({
            mode,
            workId: workId || undefined,
            duration
          }).catch(error => {
            console.warn('后端计时开始失败，前端继续计时:', error)
            // 后端失败不影响前端计时，只记录警告
          })
          
          // 触发智能数据同步 - 只更新分布数据
          triggerDataSync('timer_started', {
            workId: workId,
            mode
          })
          
          // 发布事件给其他Store
          emit('timer:started', {
            workId: workId,
            mode,
            duration
          }, 'timerStore')
          
        } catch (error) {
          console.error('启动计时器时发生错误:', error)
          set({ loading: false, error: '启动计时器失败，请重试' })
          // 不重置整个计时器状态，只显示错误信息
        }
      },

      pauseTimer: async () => {
        try {
          set({ loading: true, error: null })
          
          if (get().currentSession) {
            // 前端立即暂停，异步通知后端
            set((draft) => {
              draft.state = 'paused'
              draft.isRunning = false
              draft.pauseTime = Date.now()
              draft.loading = false
            })
            
            // 异步通知后端暂停（不等待完成）
            TimerAPI.pauseTimer(get().currentSession!.id).catch(error => {
              console.warn('后端计时暂停失败:', error)
            })
            
            // 发布暂停事件
            emit('timer:paused', {
              sessionId: get().currentSession!.id,
              workId: get().currentSession?.workId
            }, 'timerStore')
          }
        } catch (error) {
          console.error('暂停计时器时发生错误:', error)
          set({ loading: false, error: '暂停计时器失败，请重试' })
        }
      },

      resumeTimer: async () => {
        try {
          set({ loading: true, error: null })
          
          if (get().currentSession) {
            const state = get()
            if (state.pauseTime) {
              const pauseDuration = Date.now() - state.pauseTime
              
              // 前端立即恢复，异步通知后端
              set((draft) => {
                draft.state = 'running'
                draft.isRunning = true
                draft.startTime = (draft.startTime || 0) + pauseDuration
                draft.pauseTime = null
                draft.loading = false
              })
              
              // 异步通知后端恢复（不等待完成）
              TimerAPI.resumeTimer(get().currentSession!.id).catch(error => {
                console.warn('后端计时恢复失败:', error)
              })
              
              // 发布恢复事件
              emit('timer:resumed', {
                sessionId: get().currentSession!.id,
                workId: get().currentSession?.workId
              }, 'timerStore')
            }
          }
        } catch (error) {
          console.error('恢复计时器时发生错误:', error)
          set({ loading: false, error: '恢复计时器失败，请重试' })
        }
      },

      stopTimer: async () => {
        try {
          set({ loading: true, error: null })
          
          if (get().currentSession) {
            // 异步通知后端停止（不等待完成）
            TimerAPI.stopTimer(get().currentSession!.id).catch(error => {
              console.warn('后端计时停止失败:', error)
            })
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
          console.error('停止计时器时发生错误:', error)
          set({ loading: false, error: '停止计时器失败，请重试' })
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
          draft.loading = false
          draft.error = null
        })
      },

      updateConfig: async (config: Partial<TimerConfig>) => {
        try {
          set({ loading: true, error: null })
          
          // 先更新前端状态，确保UI立即响应
          set((draft) => {
            draft.config = { ...draft.config, ...config }
            draft.loading = false
          })
          
          // 异步通知后端更新配置（不等待完成）
          TimerAPI.updateTimerConfig(config).catch(error => {
            console.warn('后端配置更新失败:', error)
          })
        } catch (error) {
          console.error('更新计时器配置时发生错误:', error)
          set({ loading: false, error: '更新配置失败，请重试' })
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

        try {
          const elapsed = Math.floor((Date.now() - (state.startTime || 0)) / 1000)
          const newRemainingTime = Math.max(0, (state.config.focusDuration * 60) - elapsed)

          set((draft) => {
            draft.remainingTime = newRemainingTime
            
            if (newRemainingTime === 0 && draft.currentSession) {
              draft.state = 'completed'
              draft.isRunning = false
            }
          })
        } catch (error) {
          console.error('Error in timer tick:', error)
        }
      },

      completeSession: async () => {
        try {
          set({ loading: true, error: null })
          const state = get()

          if (state.currentSession) {
            const sessionId = state.currentSession.id
            const workId = state.currentSession?.workId || 0
            const mode = state.currentSession?.mode || 'explore'
            const duration = state.currentSession?.duration || state.config.focusDuration

            // 前端立即更新状态
            set((draft) => {
              if (state.currentSession) {
                // 确保会话标记为已完成
                const completedSession = {
                  ...state.currentSession,
                  isCompleted: true,
                  actualDuration: duration // 使用实际时长
                }
                draft.sessionHistory.push(completedSession)
              }
              draft.currentSession = null
              draft.state = 'idle'
              draft.isRunning = false
              draft.remainingTime = draft.config.focusDuration * 60
              draft.loading = false
            })

            // 异步保存到后端（等待完成以确保数据正确写入）
            try {
              await TimerAPI.stopTimer(sessionId, workId, mode, duration)
              console.log('Timer session saved to backend successfully')
            } catch (error) {
              console.warn('后端计时保存失败:', error)
            }

            // 触发智能数据同步 - 更新所有相关数据类型
            triggerDataSync('timer_completed', {
              workId: workId,
              mode: mode
            })

            // 发布完成事件
            emit('timer:completed', {
              sessionId: sessionId,
              workId: workId,
              mode: mode,
              duration: duration
            }, 'timerStore')
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('完成计时会话时发生错误:', error)
          set({ loading: false, error: '完成计时会话失败，请重试' })
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
          console.error('获取计时历史时发生错误:', error)
          set({ loading: false, error: '获取历史记录失败，请重试' })
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