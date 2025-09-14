# 新悬浮窗组件使用指南

## 概述

本文档介绍汐律应用全新设计的悬浮窗组件，该组件专注于核心功能：简洁计时器、作品选择和模式切换。

## 组件特性

### ✨ 核心功能
- **简洁计时器**: 大字体时间显示，直观的进度条
- **作品选择**: 下拉选择当前作品，支持作品颜色标识
- **模式切换**: 一键切换探索/利用模式
- **拖拽定位**: 自由拖拽到任意位置
- **状态记忆**: 自动记住窗口位置和状态

### 🎨 设计亮点
- **三种显示状态**: 标准状态、紧凑状态、最小化状态
- **模式颜色**: 探索模式(蓝色)、利用模式(橙色)
- **流畅动画**: 平滑的状态切换和交互动画
- **响应式设计**: 适应不同屏幕尺寸

## 快速开始

### 1. 基础使用

```tsx
import { FloatWindowManager } from '@/components/float'

function App() {
  const handleExpand = () => {
    // 展开到主界面的逻辑
    window.location.href = '/timer'
  }

  return (
    <div>
      {/* 主应用内容 */}

      {/* 悬浮窗 */}
      <FloatWindowManager onExpand={handleExpand} />
    </div>
  )
}
```

### 2. 手动控制悬浮窗

```tsx
import { useFloatWindowNew } from '@/hooks/useFloatWindowNew'

function TimerPage() {
  const {
    isVisible,
    showFloatWindow,
    hideFloatWindow,
    toggleFloatWindow
  } = useFloatWindowNew()

  return (
    <div>
      <button onClick={showFloatWindow}>
        显示悬浮窗
      </button>
      <button onClick={hideFloatWindow}>
        隐藏悬浮窗
      </button>
      <button onClick={toggleFloatWindow}>
        切换悬浮窗
      </button>
    </div>
  )
}
```

### 3. 独立组件使用

```tsx
import { FloatWindowNew } from '@/components/float'

function CustomFloatWindow() {
  const callbacks = {
    onStartTimer: async (workId, mode) => {
      console.log('开始计时:', workId, mode)
    },
    onPauseTimer: async () => {
      console.log('暂停计时')
    },
    onModeChange: (mode) => {
      console.log('模式变更:', mode)
    }
  }

  return (
    <FloatWindowNew callbacks={callbacks} />
  )
}
```

## 组件API

### FloatWindowManager Props

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| onExpand | () => void | 否 | 点击展开按钮时的回调 |

### FloatWindowNew Props

| 属性 | 类型 | 必需 | 说明 |
|------|------|------|------|
| callbacks | FloatWindowCallbacks | 否 | 悬浮窗回调函数 |
| className | string | 否 | 自定义CSS类名 |

### FloatWindowCallbacks

```typescript
interface FloatWindowCallbacks {
  onStartTimer?: (workId: number, mode: 'explore' | 'utilize') => Promise<void>
  onPauseTimer?: () => Promise<void>
  onResumeTimer?: () => Promise<void>
  onStopTimer?: () => Promise<void>
  onModeChange?: (mode: 'explore' | 'utilize') => void
  onWorkChange?: (workId: number) => void
  onClose?: () => void
  onExpand?: () => void
}
```

### Hook API

#### useFloatWindowNew

```typescript
const floatWindow = useFloatWindowNew()

// 属性
floatWindow.isVisible      // 是否可见
floatWindow.position       // 位置 {x, y}
floatWindow.isMinimized     // 是否最小化

// 方法
await floatWindow.showFloatWindow()      // 显示悬浮窗
await floatWindow.hideFloatWindow()      // 隐藏悬浮窗
await floatWindow.toggleFloatWindow()    // 切换悬浮窗
await floatWindow.setFloatWindowPosition(x, y)  // 设置位置
floatWindow.minimizeFloatWindow()        // 最小化
floatWindow.maximizeFloatWindow()        // 最大化
floatWindow.expandFloatWindow()          // 展开
```

## 状态管理

### FloatWindowStore

悬浮窗使用独立的状态管理，通过Zustand进行管理：

```typescript
import { useFloatWindowStore } from '@/components/float'

const {
  isVisible,
  isMinimized,
  position,
  setVisible,
  setMinimized,
  setPosition
} = useFloatWindowStore()
```

## 样式定制

### CSS变量

```css
:root {
  --float-window-width: 320px;
  --float-window-height-minimized: 64px;
  --float-window-bg: rgba(255, 255, 255, 0.95);
  --float-window-border-color: #3b82f6;
}
```

### 自定义样式

```tsx
<FloatWindowNew
  className="custom-float-window"
  callbacks={callbacks}
/>

<style>
.custom-float-window {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>
```

## 最佳实践

### 1. 状态同步

```tsx
// 在主应用中同步悬浮窗状态
useEffect(() => {
  if (timerState === 'running') {
    showFloatWindow()
  }
}, [timerState])
```

### 2. 错误处理

```tsx
const callbacks = {
  onStartTimer: async (workId, mode) => {
    try {
      await startTimer(mode, workId)
    } catch (error) {
      console.error('启动计时器失败:', error)
      // 显示错误提示
    }
  }
}
```

### 3. 性能优化

```tsx
// 使用React.memo避免不必要的重渲染
const MemoizedFloatWindow = React.memo(FloatWindowNew)

// 使用useCallback稳定回调函数
const handleStartTimer = useCallback(async (workId, mode) => {
  await startTimer(mode, workId)
}, [startTimer])
```

## 常见问题

### Q: 如何自定义悬浮窗大小？
A: 可以通过CSS类名覆盖默认尺寸：

```css
.custom-size {
  width: 400px !important;
  min-height: 300px !important;
}
```

### Q: 如何禁用拖拽功能？
A: 在组件中设置 `dragEnabled: false` 或通过CSS禁用：

```css
.no-drag {
  cursor: default !important;
}
```

### Q: 如何与主应用状态同步？
A: 使用提供的回调函数或通过事件总线进行同步：

```tsx
useEffect(() => {
  const handleTimerUpdate = (event) => {
    // 更新悬浮窗状态
  }

  window.addEventListener('timer-update', handleTimerUpdate)
  return () => window.removeEventListener('timer-update', handleTimerUpdate)
}, [])
```

## 迁移指南

### 从旧悬浮窗迁移

1. **替换导入**：
   ```typescript
   // 旧
   import { FloatWindowApp } from './components/float/FloatWindowApp'

   // 新
   import { FloatWindowManager } from '@/components/float'
   ```

2. **更新API调用**：
   ```typescript
   // 旧
   const { showFloatWindow } = useFloatWindow()

   // 新
   const { showFloatWindow } = useFloatWindowNew()
   ```

3. **调整回调函数**：
   ```typescript
   // 旧
   const callbacks = {
     onTimerStart: () => {}
   }

   // 新
   const callbacks = {
     onStartTimer: async (workId, mode) => {}
   }
   ```

## 示例项目

查看完整示例：`src/examples/FloatWindowExample.tsx`

## 更新日志

### v2.0.0 (2025-09-14)
- ✅ 全新设计，专注核心功能
- ✅ 组件化架构，易于定制
- ✅ 独立状态管理
- ✅ 完善的TypeScript支持
- ✅ 响应式设计

---

*如有问题或建议，请提交Issue或联系开发团队。*