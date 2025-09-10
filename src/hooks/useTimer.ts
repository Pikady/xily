import { useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'
import { TimerMode, TimerConfig, TimerSession } from '@/types/timer'
import { useErrorHandler } from './useErrorHandler'

export const useTimer = () => {
  const {
    state,
    mode,
    config,
    currentSession,
    sessionHistory,
    remainingTime,
    isRunning,
    loading,
    error,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    updateConfig,
    setMode,
    tick,
    completeSession,
    fetchTimerHistory,
    clearHistory,
    setLoading,
    setError
  } = useTimerStore()

  // 格式化剩余时间显示
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // 计算进度百分比
  const progressPercentage = useCallback(() => {
    const totalTime = config.focusDuration * 60
    return ((totalTime - remainingTime) / totalTime) * 100
  }, [config.focusDuration, remainingTime])

  // 开始计时器
  const start = useCallback(async (timerMode: TimerMode, workId?: number) => {
    await startTimer(timerMode, workId)
  }, [startTimer])

  // 暂停计时器
  const pause = useCallback(async () => {
    await pauseTimer()
  }, [pauseTimer])

  // 恢复计时器
  const resume = useCallback(async () => {
    await resumeTimer()
  }, [resumeTimer])

  // 停止计时器
  const stop = useCallback(async () => {
    await stopTimer()
  }, [stopTimer])

  // 重置计时器
  const reset = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  // 更新配置
  const updateTimerConfig = useCallback(async (newConfig: Partial<TimerConfig>) => {
    await updateConfig(newConfig)
  }, [updateConfig])

  // 设置模式
  const setTimerMode = useCallback((timerMode: TimerMode) => {
    setMode(timerMode)
  }, [setMode])

  // 计时器滴答
  const timerTick = useCallback(() => {
    tick()
  }, [tick])

  // 完成会话
  const complete = useCallback(async () => {
    await completeSession()
  }, [completeSession])

  // 获取历史记录
  const loadHistory = useCallback(async (workId?: number) => {
    await fetchTimerHistory(workId)
  }, [fetchTimerHistory])

  // 清空历史
  const clearTimerHistory = useCallback(() => {
    clearHistory()
  }, [clearHistory])

  // 设置加载状态
  const setTimerLoading = useCallback((loadingState: boolean) => {
    setLoading(loadingState)
  }, [setLoading])

  // 设置错误状态
  const setTimerError = useCallback((errorMessage: string | null) => {
    setError(errorMessage)
  }, [setError])

  // 获取今日统计
  const getTodayStats = useCallback(() => {
    const today = new Date().toDateString()
    const todaySessions = sessionHistory.filter(session => 
      new Date(session.startTime).toDateString() === today
    )
    
    return {
      totalSessions: todaySessions.length,
      totalTime: todaySessions.reduce((sum, session) => sum + session.actualDuration, 0),
      exploreTime: todaySessions
        .filter(session => session.mode === 'explore')
        .reduce((sum, session) => sum + session.actualDuration, 0),
      utilizeTime: todaySessions
        .filter(session => session.mode === 'utilize')
        .reduce((sum, session) => sum + session.actualDuration, 0),
      completedSessions: todaySessions.filter(session => session.isCompleted).length
    }
  }, [sessionHistory])

  // 获取本周统计
  const getWeekStats = useCallback(() => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const weekSessions = sessionHistory.filter(session => 
      new Date(session.startTime) >= weekStart
    )
    
    return {
      totalSessions: weekSessions.length,
      totalTime: weekSessions.reduce((sum, session) => sum + session.actualDuration, 0),
      averageSessionTime: weekSessions.length > 0 
        ? weekSessions.reduce((sum, session) => sum + session.actualDuration, 0) / weekSessions.length
        : 0
    }
  }, [sessionHistory])

  return {
    // 状态
    timerState: state,
    timerMode: mode,
    timerConfig: config,
    currentTimerSession: currentSession,
    timerHistory: sessionHistory,
    timerRemainingTime: remainingTime,
    isTimerRunning: isRunning,
    timerLoading: loading,
    timerError: error,
    
    // 工具函数
    formattedTime: formatTime(remainingTime),
    progressPercentage: progressPercentage(),
    
    // 操作
    startTimer: start,
    pauseTimer: pause,
    resumeTimer: resume,
    stopTimer: stop,
    resetTimer: reset,
    updateTimerConfig,
    setTimerMode,
    timerTick,
    completeSession: complete,
    loadTimerHistory: loadHistory,
    clearTimerHistory,
    setTimerLoading,
    setTimerError,
    
    // 统计
    getTodayStats,
    getWeekStats
  }
}

export default useTimer