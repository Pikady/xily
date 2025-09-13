import { useEffect, useRef, useCallback } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useWorks } from '@/hooks/useWorks'
import { toast } from 'sonner'
import { TimerMode } from '@/types/timer'

interface TimerControllerProps {
  onTimerComplete?: () => void
  onSessionChange?: (session: any) => void
}

export function TimerController({ 
  onTimerComplete,
  onSessionChange 
}: TimerControllerProps) {
  const {
    timerState,
    timerMode,
    timerRemainingTime,
    isTimerRunning,
    timerError,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    completeSession,
    timerTick,
    setTimerError
  } = useTimer()

  const { currentWork } = useWorks()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isCompletingRef = useRef(false)

  // 处理计时器滴答
  useEffect(() => {
    if (isTimerRunning && timerState === 'running') {
      intervalRef.current = setInterval(() => {
        timerTick()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isTimerRunning, timerState, timerTick]) // 重新添加 timerTick 依赖，但确保它不会导致循环

  // 处理计时器完成 - 监听状态变化
  useEffect(() => {
    if (timerRemainingTime === 0 && timerState === 'completed' && !isCompletingRef.current) {
      handleTimerComplete()
    }
  }, [timerRemainingTime, timerState]) // 同时监听 remainingTime 和 state 变化

  // 处理错误
  useEffect(() => {
    if (timerError) {
      toast.error(timerError)
    }
  }, [timerError])

  // 处理计时器完成 - 简化版本
  const handleTimerComplete = useCallback(async () => {
    // 防止重复调用
    if (isCompletingRef.current) return
    isCompletingRef.current = true

    try {
      console.log('Timer completed, handling completion...')
      
      // 简化处理，只显示通知和完成会话
      const modeText = timerMode === 'explore' ? '探索' : '利用'
      
      // 显示完成提示
      toast.success(`🎉 ${modeText}模式专注完成！`)
      
      // 完成会话 - 添加错误处理
      try {
        await completeSession()
      } catch (sessionError) {
        console.error('Error completing session:', sessionError)
      }
      
      // 调用回调
      onTimerComplete?.()
      
    } catch (error) {
      console.error('Timer completion error:', error)
    } finally {
      // 延迟重置标志，避免立即重新触发
      setTimeout(() => {
        isCompletingRef.current = false
      }, 1000)
    }
  }, [timerMode, completeSession, onTimerComplete]) // 移除 currentWork 依赖

  // 开始计时器
  const handleStart = async (mode: TimerMode, workId?: number) => {
    try {
      if (!currentWork && !workId) {
        toast.warning('请先选择一个作品')
        return
      }
      
      await startTimer(mode, workId || currentWork?.id)
      
      const modeText = mode === 'explore' ? '探索' : '利用'
      toast.success(`开始${modeText}模式专注`)
    } catch (error) {
      console.error('Start timer error:', error)
      toast.error('开始计时器失败')
    }
  }

  // 暂停计时器
  const handlePause = async () => {
    try {
      await pauseTimer()
      toast.info('计时器已暂停')
    } catch (error) {
      console.error('Pause timer error:', error)
      toast.error('暂停计时器失败')
    }
  }

  // 恢复计时器
  const handleResume = async () => {
    try {
      await resumeTimer()
      toast.success('继续专注')
    } catch (error) {
      console.error('Resume timer error:', error)
      toast.error('恢复计时器失败')
    }
  }

  // 停止计时器
  const handleStop = async () => {
    try {
      await stopTimer()
      toast.info('计时器已停止')
    } catch (error) {
      console.error('Stop timer error:', error)
      toast.error('停止计时器失败')
    }
  }

  // 重置计时器
  const handleReset = () => {
    try {
      resetTimer()
      toast.info('计时器已重置')
    } catch (error) {
      console.error('Reset timer error:', error)
      toast.error('重置计时器失败')
    }
  }

  // 清理错误状态
  const clearError = () => {
    setTimerError(null)
  }

  // 导出控制方法供外部使用
  const controls = {
    start: handleStart,
    pause: handlePause,
    resume: handleResume,
    stop: handleStop,
    reset: handleReset,
    clearError
  }

  // 这个组件主要是逻辑控制，不渲染任何UI
  return null
}

// 导出一个hook来使用计时器控制
export const useTimerController = () => {
  const {
    timerState,
    timerMode,
    timerRemainingTime,
    isTimerRunning,
    timerLoading,
    timerError,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    completeSession,
    timerTick
  } = useTimer()

  const start = async (mode: TimerMode, workId?: number) => {
    try {
      await startTimer(mode, workId)
      return true
    } catch (error) {
      console.error('Start timer failed:', error)
      return false
    }
  }

  const pause = async () => {
    try {
      await pauseTimer()
      return true
    } catch (error) {
      console.error('Pause timer failed:', error)
      return false
    }
  }

  const resume = async () => {
    try {
      await resumeTimer()
      return true
    } catch (error) {
      console.error('Resume timer failed:', error)
      return false
    }
  }

  const stop = async () => {
    try {
      await stopTimer()
      return true
    } catch (error) {
      console.error('Stop timer failed:', error)
      return false
    }
  }

  const reset = () => {
    resetTimer()
  }

  const complete = async () => {
    try {
      await completeSession()
      return true
    } catch (error) {
      console.error('Complete session failed:', error)
      return false
    }
  }

  return {
    // 状态
    state: timerState,
    mode: timerMode,
    remainingTime: timerRemainingTime,
    isRunning: isTimerRunning,
    isLoading: timerLoading,
    error: timerError,
    
    // 操作
    start,
    pause,
    resume,
    stop,
    reset,
    complete,
    tick: timerTick
  }
}