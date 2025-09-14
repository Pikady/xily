// 悬浮窗组件导出
export { FloatWindowNew } from './FloatWindowNew'
export { FloatWindowManager } from './FloatWindowManager'
export { FloatWindowHeader } from './FloatWindowHeader'
export { FloatWindowTimer } from './FloatWindowTimer'
export { FloatWindowWorkSelector } from './FloatWindowWorkSelector'
export { FloatWindowModeSwitcher } from './FloatWindowModeSwitcher'

// 状态管理
export { useFloatWindowStore } from './FloatWindowStore'

// 类型定义
export type {
  FloatWindowState,
  FloatWindowConfig,
  TimerDisplayState,
  FloatWindowCallbacks
} from './FloatWindowTypes'

// 默认导出
export { FloatWindowManager as default } from './FloatWindowManager'