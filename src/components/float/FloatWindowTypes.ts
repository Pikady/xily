// 悬浮窗相关类型定义
import { Work } from '@/types/work'
export interface FloatWindowState {
  isVisible: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: 'standard' | 'compact' | 'minimal'
}

export interface FloatWindowConfig {
  defaultPosition: { x: number; y: number }
  defaultSize: FloatWindowState['size']
  autoSavePosition: boolean
  dragEnabled: boolean
  minimizeEnabled: boolean
}

export interface TimerDisplayState {
  time: string
  progress: number
  state: 'idle' | 'running' | 'paused' | 'completed'
  mode: 'explore' | 'utilize'
}

export interface FloatWindowCallbacks {
  onStartTimer?: (workId: number, mode: 'explore' | 'utilize') => Promise<void>
  onPauseTimer?: () => Promise<void>
  onResumeTimer?: () => Promise<void>
  onStopTimer?: () => Promise<void>
  onCompleteTimer?: (workId: number, mode: 'explore' | 'utilize', duration: number) => Promise<void>
  onLoadWorks?: () => Promise<Work[]>
  onModeChange?: (mode: 'explore' | 'utilize') => void
  onWorkChange?: (workId: number) => void
  onClose?: () => void
  onExpand?: () => void
  onMoveWindow?: (x: number, y: number) => Promise<void>
  onResizeWindow?: (width: number, height: number) => Promise<void>
}