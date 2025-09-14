import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Play, Pause, Square } from 'lucide-react'
import { TimerDisplayState } from './FloatWindowTypes'
import { formatTimeWithSeconds } from '@/utils/timeFormat'
import { cn } from '@/lib/utils'

interface FloatWindowTimerProps {
  state: TimerDisplayState
  onStart: () => void
  onPause: () => void
  onStop: () => void
  disabled?: boolean
}

export function FloatWindowTimer({
  state,
  onStart,
  onPause,
  onStop,
  disabled = false
}: FloatWindowTimerProps) {
  const getModeColor = (mode: 'explore' | 'utilize') => {
    return mode === 'explore'
      ? 'bg-blue-500 hover:bg-blue-600'
      : 'bg-orange-500 hover:bg-orange-600'
  }

  const getStatusText = () => {
    switch (state.state) {
      case 'running': return '专注中...'
      case 'paused': return '已暂停'
      case 'completed': return '已完成'
      default: return '准备开始'
    }
  }

  const isRunning = state.state === 'running'
  const isPaused = state.state === 'paused'
  const showStopButton = isRunning || isPaused

  return (
    <div className="space-y-4">
      {/* 时间显示 */}
      <div className="text-center">
        <div className="text-3xl font-bold tabular-nums">
          {state.time}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {getStatusText()}
        </div>
      </div>

      {/* 进度条 */}
      <Progress value={state.progress} className="h-2" />

      {/* 控制按钮 */}
      <div className="flex justify-center space-x-2">
        <Button
          size="sm"
          onClick={isRunning ? onPause : onStart}
          disabled={disabled}
          className={cn(
            'flex-1',
            getModeColor(state.mode),
            isRunning && 'bg-red-500 hover:bg-red-600'
          )}
        >
          {isRunning ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        {showStopButton && (
          <Button size="sm" variant="outline" onClick={onStop}>
            <Square className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}