import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTimer } from '@/hooks/useTimer'
import { useWorks } from '@/hooks/useWorks'
import { WindowAPI } from '@/services/api'
import { TimerMode } from '@/types/timer'
import { 
  Play, 
  Pause, 
  Square, 
  Minimize2,
  X,
  BookOpen,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Position {
  x: number
  y: number
}

export function FloatWindowApp() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  
  const {
    timerState,
    timerMode,
    timerRemainingTime,
    isTimerRunning,
    formattedTime,
    progressPercentage,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer
  } = useTimer()
  
  const { currentWork } = useWorks()

  // 初始化位置
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const savedPosition = await WindowAPI.getFloatWindowPosition()
        if (savedPosition) {
          setPosition(savedPosition)
        }
      } catch (error) {
        console.error('加载悬浮窗位置失败:', error)
      }
    }
    
    loadPosition()
  }, [])

  // 保存位置
  const savePosition = useCallback(async (pos: Position) => {
    setPosition(pos)
    try {
      await WindowAPI.setFloatWindowPosition(pos.x, pos.y)
    } catch (error) {
      console.error('保存悬浮窗位置失败:', error)
    }
  }, [])

  // 处理鼠标按下（开始拖拽）
  const handleMouseDown = (e: React.MouseEvent) => {
    // 如果点击的是按钮，不触发拖拽
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    
    e.preventDefault()
    setIsDragging(true)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    setDragOffset({ x: offsetX, y: offsetY })
    
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }

  // 处理鼠标移动（拖拽中）
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    
    savePosition({ x: newX, y: newY })
  }, [isDragging, dragOffset, savePosition])

  // 处理鼠标释放（结束拖拽）
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  // 添加全局鼠标事件监听
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

  // 处理开始/暂停
  const handleStartPause = async () => {
    if (timerState === 'running') {
      await pauseTimer()
    } else if (timerState === 'paused') {
      await resumeTimer()
    } else {
      if (currentWork) {
        await startTimer(timerMode, currentWork.id)
      }
    }
  }

  // 处理停止
  const handleStop = async () => {
    await stopTimer()
  }

  // 关闭悬浮窗
  const handleClose = async () => {
    try {
      await WindowAPI.hideFloatWindow()
    } catch (error) {
      console.error('关闭悬浮窗失败:', error)
    }
  }

  // 切换最小化
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // 获取模式颜色
  const getModeColor = (mode: TimerMode) => {
    return mode === 'explore' 
      ? 'bg-blue-500 hover:bg-blue-600' 
      : 'bg-orange-500 hover:bg-orange-600'
  }

  // 获取模式图标
  const getModeIcon = (mode: TimerMode) => {
    return mode === 'explore' ? <BookOpen className="w-3 h-3" /> : <Zap className="w-3 h-3" />
  }

  return (
    <div
      className={cn(
        'w-full h-full transition-all duration-200 cursor-grab active:cursor-grabbing',
        isMinimized ? 'min-h-[64px]' : 'min-h-[200px]',
        isDragging ? 'opacity-90' : 'opacity-100'
      )}
      onMouseDown={handleMouseDown}
    >
      <Card className="h-full border-2 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-0 h-full">
          {/* 拖拽手柄 */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/50">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  timerMode === 'explore' ? 'bg-blue-500' : 'bg-orange-500'
                )} />
                <span className="text-sm font-medium">
                  {timerMode === 'explore' ? '探索' : '利用'}模式
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 内容区域 */}
          {!isMinimized && (
            <div className="p-4 space-y-4">
              {/* 当前作品 */}
              {currentWork && (
                <div className="flex items-center space-x-2">
                  {currentWork.color && (
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: currentWork.color }}
                    />
                  )}
                  <span className="text-sm font-medium truncate">
                    {currentWork.name}
                  </span>
                </div>
              )}

              {/* 时间显示 */}
              <div className="text-center">
                <div className="text-3xl font-bold">{formattedTime}</div>
                <div className="text-xs text-muted-foreground">
                  {timerState === 'running' ? '专注中...' : 
                   timerState === 'paused' ? '已暂停' : '准备开始'}
                </div>
              </div>

              {/* 进度条 */}
              <Progress value={progressPercentage} className="h-2" />

              {/* 控制按钮 */}
              <div className="flex justify-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleStartPause}
                  disabled={!currentWork && timerState === 'idle'}
                  className={cn(
                    'flex-1',
                    getModeColor(timerMode)
                  )}
                >
                  {timerState === 'running' ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                {(timerState === 'running' || timerState === 'paused') && (
                  <Button size="sm" variant="outline" onClick={handleStop}>
                    <Square className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 最小化状态显示 */}
          {isMinimized && (
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {getModeIcon(timerMode)}
                  <span className="text-sm font-medium">
                    {formattedTime}
                  </span>
                </div>
                <Progress value={progressPercentage} className="w-16 h-1" />
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartPause}
                  disabled={!currentWork && timerState === 'idle'}
                  className={cn(
                    'h-6 w-6 p-0',
                    timerState === 'running' && 'bg-red-100 text-red-600 hover:bg-red-200'
                  )}
                >
                  {timerState === 'running' ? (
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