import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square, BookOpen, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

// 导入子组件
import { FloatWindowHeader } from './FloatWindowHeader'
import { FloatWindowTimer } from './FloatWindowTimer'
import { FloatWindowWorkSelector } from './FloatWindowWorkSelector'
import { FloatWindowModeSwitcher } from './FloatWindowModeSwitcher'
import { useFloatWindowStore } from './FloatWindowStore'
import { FloatWindowCallbacks, TimerDisplayState } from './FloatWindowTypes'

// Hooks and API
import { useTimer } from '@/hooks/useTimer'
import { useWorks } from '@/hooks/useWorks'
import { Work } from '@/types/work'
import { formatTimeWithSeconds } from '@/utils/timeFormat'
import { toast } from 'sonner'

interface FloatWindowNewProps {
  callbacks?: FloatWindowCallbacks
  className?: string
  works?: Work[]
  loading?: boolean
}

interface Position {
  x: number
  y: number
}

export function FloatWindowNew({
  callbacks,
  className = '',
  works: externalWorks = [],
  loading: externalLoading = false
}: FloatWindowNewProps) {
  // 状态管理
  const {
    isVisible,
    isMinimized,
    position,
    setPosition: setStorePosition,
    setVisible,
    setMinimized
  } = useFloatWindowStore()

  // 使用hooks
  const {
    timerState: state,
    timerMode: mode,
    timerRemainingTime: remainingTime,
    isTimerRunning: isRunning,
    timerLoading: timerLoading,
    formattedTime,
    progressPercentage,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    completeSession,
    timerTick,
    setTimerMode
  } = useTimer()

  const { currentWork, works: hookWorks, selectWork } = useWorks()

  // 本地状态
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [works, setWorks] = useState<Work[]>(externalWorks)
  const [loading, setLoading] = useState(externalLoading)

  // 初始化悬浮窗为可见状态
  useEffect(() => {
    setVisible(true)
  }, [setVisible])

  // 同步外部作品数据
  useEffect(() => {
    if (externalWorks.length > 0) {
      setWorks(externalWorks)
      if (!currentWork && externalWorks.length > 0) {
        selectWork(externalWorks[0])
      }
    }
  }, [externalWorks, currentWork, selectWork])

  // 同步外部loading状态
  useEffect(() => {
    setLoading(externalLoading)
  }, [externalLoading])

  // 构建计时器显示状态
  const timerDisplayState: TimerDisplayState = {
    time: formattedTime,
    mode: mode,
    state: state,
    progress: progressPercentage
  }

  // 计时器滴答 - 处理倒计时
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && state === 'running') {
      interval = setInterval(() => {
        timerTick()
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, state, timerTick])

  // 窗口拖拽
  const windowRef = useRef<HTMLDivElement>(null)

  const savePosition = useCallback((newPosition: Position) => {
    setStorePosition(newPosition.x, newPosition.y)
  }, [setStorePosition])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 如果点击的是按钮，不触发拖拽
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    
    // 允许在窗口任何地方拖拽，但排除按钮
    e.preventDefault()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    })
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback(async (e: MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragOffset.x
    const deltaY = e.clientY - dragOffset.y
    
    const newX = position.x + deltaX
    const newY = position.y + deltaY

    // 通过 Tauri API 移动窗口
    try {
      await callbacks?.onMoveWindow?.(newX, newY)
      savePosition({ x: newX, y: newY })
    } catch (error) {
      console.error('移动窗口失败:', error)
    }
  }, [isDragging, dragOffset, position, savePosition, callbacks])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  // 全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // 计时器操作
  const handleStartTimer = async () => {
    if (!currentWork) {
      toast.warning('请先选择一个作品')
      return
    }

    try {
      setLoading(true)
      await startTimer(mode, currentWork.id)
      toast.success(`开始${mode === 'explore' ? '探索' : '利用'}模式专注`)

      // 调用回调
      await callbacks?.onStartTimer?.(currentWork.id, mode)
    } catch (error) {
      console.error('启动计时器失败:', error)
      toast.error('启动计时器失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePauseTimer = async () => {
    try {
      setLoading(true)
      await pauseTimer()
      toast.info('计时器已暂停')

      // 调用回调
      await callbacks?.onPauseTimer?.()
    } catch (error) {
      console.error('暂停计时器失败:', error)
      toast.error('暂停计时器失败')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeTimer = async () => {
    try {
      setLoading(true)
      await resumeTimer()
      toast.success('继续专注')

      // 调用回调
      await callbacks?.onResumeTimer?.()
    } catch (error) {
      console.error('恢复计时器失败:', error)
      toast.error('恢复计时器失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStopTimer = async () => {
    try {
      setLoading(true)
      await stopTimer()
      toast.info('计时器已停止')

      // 调用回调
      await callbacks?.onStopTimer?.()
    } catch (error) {
      console.error('停止计时器失败:', error)
      toast.error('停止计时器失败')
    } finally {
      setLoading(false)
    }
  }

  const handleWorkChange = async (workId: number) => {
    const work = works.find(w => w.id === workId)
    if (work) {
      selectWork(work)
      callbacks?.onWorkChange?.(workId)
    }
  }

  const handleModeChange = (newMode: 'explore' | 'utilize') => {
    setTimerMode(newMode)
    callbacks?.onModeChange?.(newMode)
  }

  // 窗口控制
  const handleClose = async () => {
    try {
      await callbacks?.onClose?.()
    } catch (error) {
      console.error('隐藏悬浮窗失败:', error)
    }
  }

  const handleMinimize = () => {
    setMinimized(!isMinimized)
  }

  const handleExpand = () => {
    callbacks?.onExpand?.()
  }

  // 获取模式图标
  const getModeIcon = (currentMode: 'explore' | 'utilize') => {
    return currentMode === 'explore' ? <BookOpen className="w-3 h-3" /> : <Zap className="w-3 h-3" />
  }

  // 如果窗口不可见，不渲染
  if (!isVisible) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={cn(
        'relative transition-all duration-200 cursor-grab active:cursor-grabbing',
        isMinimized ? 'w-64 h-16' : 'w-80 h-[480px]',
        isDragging ? 'opacity-90 shadow-2xl scale-105' : 'opacity-100 shadow-lg scale-100',
        'rounded-lg overflow-hidden flex-shrink-0 bg-white/95',
        mode === 'explore' ? 'border-2 border-blue-500' : 'border-2 border-orange-500',
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full border-0 bg-transparent">
        <CardContent className="p-0 h-full">
          {/* 标题栏 */}
          <FloatWindowHeader
            title={mode === 'explore' ? '探索模式' : '利用模式'}
            mode={mode}
            isMinimized={isMinimized}
            onMinimize={handleMinimize}
            onMaximize={handleExpand}
            onClose={handleClose}
          />

          {/* 内容区域 */}
          {!isMinimized && (
            <div className="p-3 space-y-3">
              {/* 作品选择器 */}
              <FloatWindowWorkSelector
                currentWorkId={currentWork?.id}
                onWorkChange={handleWorkChange}
                disabled={loading || isRunning}
                works={hookWorks.length > 0 ? hookWorks : works}
              />

              {/* 模式切换器 */}
              <FloatWindowModeSwitcher
                currentMode={mode}
                onModeChange={handleModeChange}
                disabled={loading || isRunning}
              />

              {/* 计时器 */}
              <FloatWindowTimer
                state={timerDisplayState}
                onStart={state === 'paused' ? handleResumeTimer : handleStartTimer}
                onPause={handlePauseTimer}
                onStop={handleStopTimer}
                disabled={loading || timerLoading || !currentWork}
              />
            </div>
          )}

          {/* 最小化状态显示 */}
          {isMinimized && (
            <div className="flex items-center justify-between px-3 py-2 h-full">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getModeIcon(mode)}
                  <span className="text-sm font-medium">
                    {formattedTime}
                  </span>
                </div>
                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={state === 'paused' ? handleResumeTimer : handleStartTimer}
                  disabled={loading || timerLoading || !currentWork}
                  className={cn(
                    'h-6 w-6 p-0',
                    state === 'running' && 'bg-red-100 text-red-600 hover:bg-red-200'
                  )}
                >
                  {state === 'running' ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}