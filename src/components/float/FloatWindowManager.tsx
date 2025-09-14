import React, { useState, useEffect } from 'react'
import { FloatWindowNew } from './FloatWindowNew'
import { WindowAPI, TimerAPI, WorksAPI } from '@/services/api'
import { Work } from '@/types/work'

interface FloatWindowManagerProps {
  onExpand?: () => void
}

export function FloatWindowManager({
  onExpand
}: FloatWindowManagerProps) {
  // 状态管理
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<any>(null)

  // 加载作品列表
  useEffect(() => {
    const loadWorks = async () => {
      try {
        const worksList = await WorksAPI.getAllWorks()
        setWorks(worksList)
      } catch (error) {
        console.error('加载作品列表失败:', error)
      }
    }

    loadWorks()
  }, [])

  const callbacks = {
    onStartTimer: async (workId: number, mode: 'explore' | 'utilize') => {
      try {
        setLoading(true)
        console.log('启动计时器:', workId, mode)

        // 调用后端API开始计时
        const session = await TimerAPI.startTimer({
          mode,
          workId,
          duration: 25 // 25分钟
        })

        setCurrentSession(session)
        console.log('计时器已启动:', session)
      } catch (error) {
        console.error('启动计时器失败:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },

    onPauseTimer: async () => {
      try {
        setLoading(true)
        console.log('暂停计时器')

        if (currentSession) {
          await TimerAPI.pauseTimer(currentSession.id)
          console.log('计时器已暂停')
        }
      } catch (error) {
        console.error('暂停计时器失败:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },

    onResumeTimer: async () => {
      try {
        setLoading(true)
        console.log('恢复计时器')

        if (currentSession) {
          await TimerAPI.resumeTimer(currentSession.id)
          console.log('计时器已恢复')
        }
      } catch (error) {
        console.error('恢复计时器失败:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },

    onStopTimer: async () => {
      try {
        setLoading(true)
        console.log('停止计时器')

        if (currentSession) {
          // 计算实际持续时间
          const actualDuration = 25 // 默认25分钟，应该根据实际计时时间计算

          await TimerAPI.stopTimer(
            currentSession.id,
            currentSession.workId,
            currentSession.mode,
            actualDuration
          )

          setCurrentSession(null)
          console.log('计时器已停止并保存')
        }
      } catch (error) {
        console.error('停止计时器失败:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },

    onCompleteTimer: async (workId: number, mode: 'explore' | 'utilize', duration: number) => {
      try {
        setLoading(true)
        console.log('完成计时器:', workId, mode, duration)

        if (currentSession) {
          const timeRecord = await TimerAPI.stopTimer(
            currentSession.id,
            workId,
            mode,
            duration
          )

          setCurrentSession(null)
          console.log('计时记录已保存:', timeRecord)

          // 显示完成提示
          alert(`🎉 计时完成！已记录 ${duration} 分钟到作品`)
        }
      } catch (error) {
        console.error('保存计时记录失败:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },

    onLoadWorks: async () => {
      try {
        const worksList = await WorksAPI.getAllWorks()
        setWorks(worksList)
        return worksList
      } catch (error) {
        console.error('加载作品列表失败:', error)
        throw error
      }
    },

    onModeChange: (mode: 'explore' | 'utilize') => {
      console.log('模式变更为:', mode)
    },

    onWorkChange: (workId: number) => {
      console.log('作品变更为:', workId)
    },

    onClose: async () => {
      try {
        await WindowAPI.hideFloatWindow()
        console.log('关闭悬浮窗')
      } catch (error) {
        console.error('关闭悬浮窗失败:', error)
      }
    },

    onExpand: () => {
      console.log('展开到主界面')
      onExpand?.()
    },

    onMoveWindow: async (x: number, y: number) => {
      try {
        await WindowAPI.setFloatWindowPosition(x, y)
        console.log('移动悬浮窗到:', { x, y })
      } catch (error) {
        console.error('移动悬浮窗失败:', error)
        throw error
      }
    },

    onResizeWindow: async (width: number, height: number) => {
      try {
        await WindowAPI.resizeFloatWindow(width, height)
        console.log('调整悬浮窗尺寸到:', { width, height })
      } catch (error) {
        console.error('调整悬浮窗尺寸失败:', error)
        throw error
      }
    }
  }

  return (
    <FloatWindowNew
      callbacks={callbacks}
      works={works}
      loading={loading}
    />
  )
}