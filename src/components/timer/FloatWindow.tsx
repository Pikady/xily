import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTimer } from '@/hooks/useTimer'
import { useWorks } from '@/hooks/useWorks'
import { TimerMode } from '@/types/timer'
import { 
  Play, 
  Pause, 
  Square, 
  Maximize2, 
  Minimize2,
  X,
  BookOpen,
  Zap,
  GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatWindowProps {
  isVisible: boolean
  onToggleVisibility: () => void
  onExpand?: () => void
  className?: string
}

interface Position {
  x: number
  y: number
}

export function FloatWindow({ 
  isVisible, 
  onToggleVisibility, 
  onExpand,
  className = '' 
}: FloatWindowProps) {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  
  const windowRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  
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

  // 保存位置到localStorage
  useEffect(() => {
    if (isVisible) {
      const savedPosition = localStorage.getItem('float-window-position')
      if (savedPosition) {
        try {
          const pos = JSON.parse(savedPosition)
          setPosition(pos)
        } catch (error) {
          console.error('Failed to parse saved position:', error)
        }
      }
    }
  }, [isVisible])

  // 保存位置
  const savePosition = (pos: Position) => {
    localStorage.setItem('float-window-position', JSON.stringify(pos))
  }

  // 处理鼠标按下（开始拖拽）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragHandleRef.current?.contains(e.target as Node)) return
    
    e.preventDefault()
    setIsDragging(true)
    
    const rect = windowRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
    
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }

  // 处理鼠标移动（拖拽中）
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !windowRef.current) return
    
    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    
    // 限制在窗口范围内
    const rect = windowRef.current.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width
    const maxY = window.innerHeight - rect.height
    
    const constrainedX = Math.max(0, Math.min(newX, maxX))
    const constrainedY = Math.max(0, Math.min(newY, maxY))
    
    setPosition({ x: constrainedX, y: constrainedY })
  }

  // 处理鼠标释放（结束拖拽）
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      savePosition(position)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }

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
  }, [isDragging, dragOffset, position])

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

  // 切换最小化
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // 关闭悬浮窗
  const handleClose = () => {
    onToggleVisibility()
  }

  // 展开到完整页面
  const handleExpand = () => {
    onExpand?.()
    onToggleVisibility()
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

  if (!isVisible) return null

  return (
    <div
      ref={windowRef}
      className={cn(
        'fixed z-50 transition-all duration-200',
        isMinimized ? 'w-64 h-16' : 'w-80',
        isDragging ? 'opacity-90 shadow-2xl' : 'opacity-100 shadow-lg',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      <Card className="h-full border-2 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-0 h-full">
          {/* 拖拽手柄 */}
          <div
            ref={dragHandleRef}
            className="flex items-center justify-between p-3 cursor-grab active:cursor-grabbing border-b bg-muted/50"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
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
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="w-3 h-3" />
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