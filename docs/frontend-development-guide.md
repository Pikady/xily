# 汐律前端开发指南

## 项目概述

**汐律** 是一个基于 Tauri + TypeScript 构建的桌面端智能时间管理工具。本指南将帮助前端开发者快速理解项目结构，掌握开发流程。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **路由**: React Router v6
- **UI组件**: Radix UI + Tailwind CSS
- **图表库**: Recharts
- **图标**: Lucide React
- **桌面端**: Tauri 2.x

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── layout/         # 布局组件
│   │   ├── SimpleLayout.tsx    # 主布局
│   │   ├── Header.tsx          # 页头
│   │   └── Sidebar.tsx         # 侧边栏
│   ├── timer/          # 计时器组件
│   │   ├── TimerDisplay.tsx    # 计时器显示
│   │   ├── TimerController.tsx  # 计时器控制器
│   │   └── FloatWindow.tsx     # 悬浮窗
│   ├── works/          # 作品管理组件
│   │   └── WorksManager.tsx    # 作品管理器
│   ├── charts/         # 图表组件
│   │   ├── StatCards.tsx       # 统计卡片
│   │   ├── TimeDistributionCharts.tsx  # 时间分布图
│   │   └── TrendAnalysisCharts.tsx     # 趋势分析图
│   └── ui/             # 基础UI组件
│       ├── button.tsx          # 按钮组件
│       ├── card.tsx            # 卡片组件
│       └── ...
├── pages/               # 页面组件
│   ├── Dashboard.tsx    # 仪表板
│   ├── Timer.tsx        # 计时器页面
│   ├── Analytics.tsx   # 分析页面
│   └── Settings.tsx     # 设置页面
├── stores/              # 状态管理
│   ├── timerStore.ts   # 计时器状态
│   ├── worksStore.ts   # 作品状态
│   └── analyticsStore.ts # 分析状态
├── hooks/               # 自定义Hooks
│   ├── useTimer.ts     # 计时器Hook
│   ├── useWorks.ts     # 作品管理Hook
│   ├── useDataSync.ts  # 数据同步Hook
│   └── useFloatWindow.ts # 悬浮窗Hook
├── contexts/           # React Context
│   └── AppContext.tsx   # 应用级Context
├── services/            # API服务
│   └── api.ts          # API接口封装
├── types/               # TypeScript类型定义
│   ├── timer.ts        # 计时器类型
│   ├── works.ts        # 作品类型
│   └── frontend.ts     # 前端通用类型
├── utils/               # 工具函数
│   └── format.ts       # 格式化工具
├── styles/              # 样式文件
│   └── global.css      # 全局样式
├── main.ts             # 应用入口
└── App.tsx             # 根组件
```

## 核心概念

### 1. 路由系统

项目使用 React Router v6 进行路由管理：

```typescript
// src/router.tsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <SimpleLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/timer', element: <Timer /> },
      { path: '/works', element: <WorksManager /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/settings', element: <Settings /> }
    ]
  }
])
```

### 2. 状态管理

使用 Zustand 进行状态管理，主要包含三个核心store：

#### TimerStore (src/stores/timerStore.ts)
管理计时器状态：
- 计时器状态（idle/running/paused/completed）
- 当前模式（explore/utilize）
- 计时器配置
- 当前会话和历史记录

#### WorksStore (src/stores/worksStore.ts)
管理作品数据：
- 作品列表
- 当前选中的作品
- 作品的增删改查

#### AnalyticsStore (src/stores/analyticsStore.ts)
管理分析数据：
- 时间分布统计
- 每日/每周统计
- 趋势分析数据

### 3. 组件设计模式

#### 页面组件 (Pages)
位于 `src/pages/` 目录，每个页面对应一个路由：
- 负责页面级的状态管理
- 组织子组件
- 处理页面级别的业务逻辑

#### 功能组件 (Components)
位于 `src/components/` 目录，按功能分类：
- `layout/`: 布局组件
- `timer/`: 计时器相关组件
- `charts/`: 图表组件
- `works/`: 作品管理组件

#### UI组件 (UI Components)
位于 `src/components/ui/` 目录，基于 Radix UI 的基础组件。

### 4. 自定义Hooks

#### useTimer (src/hooks/useTimer.ts)
封装计时器相关逻辑：
```typescript
const {
  timerState,
  timerMode,
  timerConfig,
  startTimer,
  pauseTimer,
  stopTimer,
  formattedTime,
  progressPercentage
} = useTimer()
```

#### useWorks (src/hooks/useWorks.ts)
封装作品管理逻辑：
```typescript
const {
  works,
  currentWork,
  activeWorks,
  selectWork,
  createWork,
  updateWork,
  deleteWork
} = useWorks()
```

### 5. API服务

API接口封装在 `src/services/api.ts` 中：
```typescript
// 计时器相关API
export const TimerAPI = {
  startTimer: (data: StartTimerRequest) => Promise<TimerSession>,
  pauseTimer: (sessionId: number) => Promise<void>,
  resumeTimer: (sessionId: number) => Promise<void>,
  stopTimer: (sessionId: number) => Promise<void>
}

// 作品相关API
export const WorksAPI = {
  getWorks: () => Promise<Work[]>,
  createWork: (data: CreateWorkRequest) => Promise<Work>,
  updateWork: (id: number, data: UpdateWorkRequest) => Promise<Work>,
  deleteWork: (id: number) => Promise<void>
}
```

## 开发指南

### 1. 添加新页面

1. 在 `src/pages/` 目录创建页面组件
2. 在 `src/router.tsx` 中添加路由配置
3. 在 `src/components/layout/SimpleLayout.tsx` 中添加导航链接

示例：
```typescript
// 1. 创建页面组件
// src/pages/NewPage.tsx
export function NewPage() {
  return <div>新页面内容</div>
}

// 2. 添加路由
// src/router.tsx
{
  path: '/new-page',
  element: <NewPage />
}

// 3. 添加导航链接
// src/components/layout/SimpleLayout.tsx
<Link to="/new-page">新页面</Link>
```

### 2. 添加新功能

#### 创建Store
```typescript
// src/stores/newFeatureStore.ts
import { create } from 'zustand'

interface NewFeatureState {
  data: any[]
  loading: boolean
  fetchData: () => Promise<void>
}

export const useNewFeatureStore = create<NewFeatureState>((set, get) => ({
  data: [],
  loading: false,
  fetchData: async () => {
    set({ loading: true })
    const data = await API.fetchData()
    set({ data, loading: false })
  }
}))
```

#### 创建Hook
```typescript
// src/hooks/useNewFeature.ts
import { useNewFeatureStore } from '@/stores/newFeatureStore'

export const useNewFeature = () => {
  const { data, loading, fetchData } = useNewFeatureStore()
  
  return {
    featureData: data,
    isLoading: loading,
    loadFeatureData: fetchData
  }
}
```

#### 创建组件
```typescript
// src/components/new-feature/NewFeatureComponent.tsx
import { useNewFeature } from '@/hooks/useNewFeature'

export function NewFeatureComponent() {
  const { featureData, isLoading, loadFeatureData } = useNewFeature()
  
  if (isLoading) return <div>加载中...</div>
  
  return (
    <div>
      {featureData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### 3. 调试技巧

#### 开发环境
```bash
# 启动开发服务器
npm run dev

# 启动Tauri开发环境
npm run tauri dev
```

#### 调试工具
- **浏览器开发者工具**: 在Tauri中可以使用 `Ctrl+Shift+I` 打开
- **React Developer Tools**: 安装浏览器扩展
- **Zustand Devtools**: 可以添加中间件进行状态调试

#### 常用调试代码
```typescript
// 在组件中添加调试信息
console.log('当前状态:', useTimerStore.getState())

// 监听状态变化
useTimerStore.subscribe(
  (state) => console.log('计时器状态变化:', state),
  (state) => state.state
)
```

### 4. 样式开发

项目使用 Tailwind CSS 进行样式开发：

```typescript
// 使用Tailwind类名
<div className="bg-blue-500 text-white p-4 rounded-lg">
  蓝色背景的卡片
</div>

// 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>移动端单列</div>
  <div>平板双列</div>
  <div>桌面三列</div>
</div>
```

### 5. 类型安全

项目严格使用TypeScript：

```typescript
// 定义接口
interface Work {
  id: number
  name: string
  description?: string
  color?: string
  target_hours: number
  created_at: string
  updated_at: string
}

// 使用类型
const updateWork = (id: number, data: Partial<Work>) => {
  // 类型安全的更新
}
```

## 核心功能说明

### 1. 计时器系统

- **双模式**: 探索模式（学习）和利用模式（创作）
- **悬浮窗**: 独立的计时器悬浮窗，支持拖拽
- **自动保存**: 计时记录自动保存到后端
- **配置管理**: 支持自定义时长和休息时间

### 2. 作品管理

- **CRUD操作**: 完整的作品增删改查功能
- **时间归属**: 计时记录归属到特定作品
- **目标设定**: 为作品设定时间目标
- **进度跟踪**: 实时显示作品进度

### 3. 数据分析

- **时间分布**: 按作品和模式统计时间分布
- **趋势分析**: 每日/每周时间使用趋势
- **效率报告**: 专注度和完成率分析
- **数据可视化**: 使用Recharts进行图表展示

## 开发注意事项

### 1. 性能优化

- 使用 `React.memo` 和 `useMemo` 优化组件渲染
- 使用 `useCallback` 缓存函数引用
- 合理使用 Zustand 的选择器避免不必要的重渲染

### 2. 错误处理

- 使用 ErrorBoundary 组件捕获错误
- 在API调用中添加错误处理
- 使用 useErrorHandler hook 统一处理错误

### 3. 数据同步

- 使用 useDataSync hook 实现数据自动同步
- 处理离线状态和数据冲突
- 实现乐观更新提升用户体验

### 4. 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 React 最佳实践
- 编写单元测试确保代码质量

## 悬浮窗系统详解

### 系统架构

汐律的悬浮窗是一个独立的计时器界面，可以在桌面任意位置拖拽，提供便捷的时间管理体验。系统由以下几个核心部分组成：

```
src/
├── components/float/
│   └── FloatWindowApp.tsx    # 悬浮窗主组件
├── hooks/
│   └── useFloatWindow.ts     # 悬浮窗管理Hook
└── services/
    └── api.ts               # Tauri窗口API封装
```

### 核心功能

#### 1. 窗口管理

悬浮窗支持完整的窗口操作：

```typescript
// 使用悬浮窗Hook
const { 
  isVisible, 
  position, 
  showFloatWindow, 
  hideFloatWindow, 
  toggleFloatWindow,
  setFloatWindowPosition 
} = useFloatWindow()

// 显示/隐藏悬浮窗
await toggleFloatWindow()

// 设置悬浮窗位置
await setFloatWindowPosition(100, 100)
```

#### 2. 拖拽功能

悬浮窗支持鼠标拖拽，实现流畅的移动体验：

```typescript
// 拖拽实现核心逻辑
const handleMouseDown = (e: React.MouseEvent) => {
  // 避免按钮触发拖拽
  if ((e.target as HTMLElement).closest('button')) {
    return
  }
  
  setIsDragging(true)
  // 计算鼠标相对于窗口的偏移量
  const rect = e.currentTarget.getBoundingClientRect()
  setDragOffset({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  })
}

// 全局鼠标移动事件
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return
  
  const newX = e.clientX - dragOffset.x
  const newY = e.clientY - dragOffset.y
  
  savePosition({ x: newX, y: newY })
}
```

#### 3. 最小化功能

悬浮窗支持最小化模式，节省屏幕空间：

```typescript
// 最小化状态切换
const toggleMinimize = () => {
  setIsMinimized(!isMinimized)
}

// 条件渲染不同状态的UI
{isMinimized ? (
  // 最小化状态：只显示关键信息
  <div className="flex items-center justify-between px-3 py-2">
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1">
        {getModeIcon(timerMode)}
        <span className="text-sm font-medium">{formattedTime}</span>
      </div>
      <Progress value={progressPercentage} className="w-16 h-1" />
    </div>
  </div>
) : (
  // 完整状态：显示所有信息
  <div className="p-4 space-y-4">
    {/* 完整的悬浮窗内容 */}
  </div>
)}
```

#### 4. 计时器控制

悬浮窗提供完整的计时器控制功能：

```typescript
// 开始/暂停计时器
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

// 停止计时器
const handleStop = async () => {
  await stopTimer()
}
```

### 设计特点

#### 1. 独立进程
- 悬浮窗运行在独立的Tauri窗口中
- 与主应用进程分离，不相互影响
- 支持独立的生命周期管理

#### 2. 状态同步
- 使用Zustand进行状态管理
- 悬浮窗与主应用实时同步计时器状态
- 确保数据一致性

#### 3. 位置持久化
```typescript
// 保存窗口位置到本地存储
const savePosition = useCallback(async (pos: Position) => {
  setPosition(pos)
  try {
    await WindowAPI.setFloatWindowPosition(pos.x, pos.y)
  } catch (error) {
    console.error('保存悬浮窗位置失败:', error)
  }
}, [])
```

#### 4. 响应式设计
- 根据不同状态调整UI布局
- 最小化状态只显示核心信息
- 支持动态大小调整

### 使用Tauri API

悬浮窗系统依赖Tauri的窗口管理API：

```typescript
// src/services/api.ts 中的窗口API
export const WindowAPI = {
  // 显示悬浮窗
  showFloatWindow: () => Promise<void>,
  
  // 隐藏悬浮窗
  hideFloatWindow: () => Promise<void>,
  
  // 切换悬浮窗显示状态
  toggleFloatWindow: () => Promise<void>,
  
  // 获取悬浮窗位置
  getFloatWindowPosition: () => Promise<Position>,
  
  // 设置悬浮窗位置
  setFloatWindowPosition: (x: number, y: number) => Promise<void>,
  
  // 检查悬浮窗是否可见
  isFloatWindowVisible: () => Promise<boolean>
}
```

### 样式设计

悬浮窗采用现代化的设计风格：

```typescript
// 主要样式特点
<div className={cn(
  'w-full h-full transition-all duration-200 cursor-grab active:cursor-grabbing',
  isMinimized ? 'min-h-[64px]' : 'min-h-[200px]',
  isDragging ? 'opacity-90' : 'opacity-100'
)}>
  <Card className="h-full border-2 bg-background/95 backdrop-blur-sm">
    {/* 半透明背景，模糊效果 */}
  </Card>
</div>
```

### 开发指南

#### 1. 添加新功能到悬浮窗

1. **在FloatWindowApp.tsx中添加UI元素**：
```typescript
// 添加新的控制按钮
<Button
  size="sm"
  variant="ghost"
  onClick={handleNewFeature}
>
  <NewFeatureIcon className="w-4 h-4" />
</Button>
```

2. **在useFloatWindow.ts中添加新方法**：
```typescript
interface FloatWindowManager {
  // 现有方法...
  handleNewFeature: () => Promise<void>
}
```

3. **在api.ts中添加Tauri API调用**：
```typescript
export const WindowAPI = {
  // 现有方法...
  newFeatureAPI: () => Promise<void>
}
```

#### 2. 修改悬浮窗样式

悬浮窗使用Tailwind CSS，可以通过修改className来调整样式：

```typescript
// 修改悬浮窗大小
<div className={cn(
  'w-full h-full',
  isMinimized ? 'min-h-[80px]' : 'min-h-[240px]' // 调整高度
)}>

// 修改背景效果
<Card className="h-full border-2 bg-background/90 backdrop-blur-md">
  {/* 调整透明度和模糊效果 */}
</Card>
```

#### 3. 调试悬浮窗

悬浮窗的调试需要特殊处理：

```typescript
// 1. 在悬浮窗中添加调试信息
console.log('悬浮窗状态:', {
  isVisible,
  position,
  isMinimized,
  timerState
})

// 2. 使用浏览器开发者工具
// 在Tauri中按 Ctrl+Shift+I 打开开发者工具

// 3. 监听状态变化
useTimerStore.subscribe(
  (state) => console.log('计时器状态变化:', state),
  (state) => state.state
)
```

### 性能优化

#### 1. 事件优化
```typescript
// 使用useCallback缓存事件处理函数
const handleMouseMove = useCallback((e: MouseEvent) => {
  // 处理逻辑
}, [isDragging, dragOffset])

// 及时清理事件监听
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
```

#### 2. 渲染优化
```typescript
// 使用React.memo避免不必要的重渲染
const FloatWindowApp = React.memo(function FloatWindowApp() {
  // 组件逻辑
})

// 使用useMemo缓存计算结果
const modeColor = useMemo(() => {
  return timerMode === 'explore' 
    ? 'bg-blue-500 hover:bg-blue-600' 
    : 'bg-orange-500 hover:bg-orange-600'
}, [timerMode])
```

### 常见问题

#### Q: 悬浮窗无法拖拽？
A: 检查 `handleMouseDown` 事件是否正确绑定，确保按钮元素不会触发拖拽。

#### Q: 悬浮窗位置不保存？
A: 确保 `savePosition` 函数正确调用，并且Tauri API正常工作。

#### Q: 悬浮窗与主应用状态不同步？
A: 检查Zustand store的订阅机制，确保状态变化能够正确传播。

#### Q: 如何修改悬浮窗的默认大小？
A: 修改 `FloatWindowApp.tsx` 中的 `min-h-[64px]` 和 `min-h-[200px]` 等尺寸类名。

---

悬浮窗系统是汐律的核心功能之一，通过独立窗口和拖拽功能为用户提供便捷的时间管理体验。在开发过程中需要注意性能优化和状态同步的问题。

## 部署和构建

```bash
# 开发构建
npm run build

# Tauri构建
npm run tauri build

# 预览构建结果
npm run preview
```

## 常见问题

### Q: 如何添加新的图表类型？
A: 在 `src/components/charts/` 目录下创建新的图表组件，使用 Recharts 库进行实现。

### Q: 如何修改主题颜色？
A: 在 `src/styles/global.css` 中修改CSS变量，或在 `src/contexts/AppContext.tsx` 中添加主题切换逻辑。

### Q: 如何处理Tauri API调用？
A: 在 `src/services/api.ts` 中添加Tauri API的封装，确保前后端接口统一。

---

这份文档涵盖了汐律前端项目的核心概念和开发流程。如有疑问，请参考源码或联系开发团队。