import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTimer } from '@/hooks/useTimer'
import { useWorks } from '@/hooks/useWorks'
import { TimerMode } from '@/types/timer'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock,
  Target,
  Zap,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  className?: string
  compact?: boolean
}

export function TimerDisplay({ className = '', compact = false }: TimerDisplayProps) {
  const {
    timerState,
    timerMode,
    timerConfig,
    currentTimerSession,
    timerRemainingTime,
    isTimerRunning,
    timerLoading,
    formattedTime,
    progressPercentage,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setTimerMode,
    updateTimerConfig,
    getTodayStats
  } = useTimer()

  const { currentWork, activeWorks } = useWorks()
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(
    currentWork?.id || null
  )

  const todayStats = getTodayStats()

  // 处理模式切换
  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode)
  }

  // 处理开始/暂停
  const handleStartPause = async () => {
    if (timerState === 'running') {
      await pauseTimer()
    } else if (timerState === 'paused') {
      await resumeTimer()
    } else {
      // 确保有选择作品或当前工作
      const workId = selectedWorkId || currentWork?.id
      if (!workId) {
        console.warn('请先选择一个作品')
        return
      }
      await startTimer(timerMode, workId)
    }
  }

  // 处理停止
  const handleStop = async () => {
    await stopTimer()
  }

  // 处理重置
  const handleReset = () => {
    resetTimer()
  }

  // 获取模式样式
  const getModeStyles = (mode: TimerMode) => {
    return cn(
      'px-4 py-2 rounded-lg font-medium transition-colors',
      mode === 'explore' 
        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300'
        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300',
      timerMode === mode && 'ring-2 ring-offset-2'
    )
  }

  // 获取模式图标
  const getModeIcon = (mode: TimerMode) => {
    return mode === 'explore' ? <BookOpen className="w-4 h-4" /> : <Zap className="w-4 h-4" />
  }

  if (compact) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 模式指示器 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleModeChange('explore')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    timerMode === 'explore' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleModeChange('utilize')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    timerMode === 'utilize' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Zap className="w-4 h-4" />
                </button>
              </div>

              {/* 时间显示 */}
              <div className="text-center">
                <div className="text-2xl font-bold">{formattedTime}</div>
                <div className="text-xs text-muted-foreground">
                  {currentWork?.name || '未选择作品'}
                </div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleStartPause}
                disabled={timerLoading}
                className={cn(
                  timerMode === 'explore' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                )}
              >
                {timerState === 'running' ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleStop}
                disabled={timerState === 'idle'}
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 模式选择 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleModeChange('explore')}
              className={getModeStyles('explore')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              探索模式
            </button>
            <button
              onClick={() => handleModeChange('utilize')}
              className={getModeStyles('utilize')}
            >
              <Zap className="w-4 h-4 mr-2" />
              利用模式
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 主要计时器 */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* 当前作品 */}
            {currentWork && (
              <div className="flex items-center justify-center space-x-2">
                {currentWork.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: currentWork.color }}
                  />
                )}
                <span className="text-lg font-medium">{currentWork.name}</span>
              </div>
            )}

            {/* 时间显示 */}
            <div className="relative">
              <div className="w-64 h-64 mx-auto">
                <Progress 
                  value={progressPercentage} 
                  className="w-full h-full rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold">{formattedTime}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {timerConfig.focusDuration} 分钟专注
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                onClick={handleStartPause}
                disabled={timerLoading}
                className={cn(
                  timerMode === 'explore' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                )}
              >
                {timerLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : timerState === 'running' ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    暂停
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    开始
                  </>
                )}
              </Button>
              
              {/* 快速测试按钮 - 只在空闲状态显示 */}
              {timerState === 'idle' && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    // 临时设置为1分钟进行测试
                    updateTimerConfig({ focusDuration: 1 }).then(() => {
                      handleStartPause()
                    })
                  }}
                  disabled={timerLoading}
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  1分钟测试
                </Button>
              )}
              
              {(timerState === 'running' || timerState === 'paused') && (
                <Button size="lg" variant="outline" onClick={handleStop}>
                  <Square className="w-5 h-5 mr-2" />
                  停止
                </Button>
              )}
              
              <Button size="lg" variant="ghost" onClick={handleReset} disabled={timerLoading}>
                {timerLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 今日统计 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {todayStats.exploreTime}分钟
              </div>
              <div className="text-xs text-muted-foreground">探索时间</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {todayStats.utilizeTime}分钟
              </div>
              <div className="text-xs text-muted-foreground">利用时间</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {todayStats.completedSessions}
              </div>
              <div className="text-xs text-muted-foreground">完成专注</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {todayStats.totalTime}分钟
              </div>
              <div className="text-xs text-muted-foreground">今日总计</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}