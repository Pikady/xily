# 汐律项目架构和组件设计 (Shadcn UI + Tailwind CSS 版本)

## 1. 整体架构设计

### 1.1 架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        汐律前端架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────│
│  │   React UI     │  │   Zustand      │  │   Router      │
│  │   Components    │  │   Stores       │  │   Navigation  │
│  └─────────────────┘  └─────────────────┘  └───────────────│
│           │                      │                      │   │
│           ▼                      ▼                      ▼   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────│
│  │   API Service   │  │   Utils &       │  │   Theme &     │
│  │   Layer         │  │   Hooks         │  │   Styles      │
│  └─────────────────┘  └─────────────────┘  └───────────────│
│           │                      │                      │   │
│           ▼                      ▼                      ▼   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────│
│  │   Tauri API    │  │   Local Storage │  │   Error       │
│  │   Interface     │  │   & Cache       │  │   Handling    │
│  └─────────────────┘  └─────────────────┘  └───────────────│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈
- **前端框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **UI组件库**: Shadcn UI
- **样式框架**: Tailwind CSS
- **图表库**: Recharts
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **表单处理**: React Hook Form + Zod
- **构建工具**: Vite
- **桌面应用**: Tauri 2.x

### 1.3 数据流设计
```
User Action → Component → Store → API Service → Tauri → Backend
    ↑                                                      ↓
    └──────────────────── Response ────────────────────────┘
```

## 2. 详细目录结构

### 2.1 完整目录结构
```
src/
├── components/
│   ├── ui/                     # Shadcn UI 基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── progress.tsx
│   │   ├── badge.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── switch.tsx
│   ├── features/              # 功能组件
│   │   ├── timer/             # 计时器相关组件
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── TimerControls.tsx
│   │   │   ├── TimerProgress.tsx
│   │   │   └── FloatWindow.tsx
│   │   ├── works/             # 作品管理组件
│   │   │   ├── WorkCard.tsx
│   │   │   ├── WorkList.tsx
│   │   │   ├── WorkProgress.tsx
│   │   │   ├── WorkForm.tsx
│   │   │   └── WorkCreateModal.tsx
│   │   ├── tide/              # 潮汐模式组件
│   │   │   ├── TideModeSwitch.tsx
│   │   │   ├── TideModeIndicator.tsx
│   │   │   └── TideModeStats.tsx
│   │   └── analytics/        # 数据分析组件
│   │       ├── AnalyticsCharts.tsx
│   │       ├── StatsCard.tsx
│   │       ├── ProgressChart.tsx
│   │       └── ExportModal.tsx
│   ├── charts/               # 图表组件
│   │   ├── TimeDistributionChart.tsx
│   │   ├── ProgressChart.tsx
│   │   └── TrendChart.tsx
│   ├── layout/               # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SidebarItem.tsx
│   │   └── Footer.tsx
│   └── index.ts
├── pages/              # 页面组件
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.types.ts
│   │   └── components/
│   │       ├── StatsOverview/
│   │       │   ├── StatsOverview.tsx
│   │       │   └── StatsOverview.types.ts
│   │       ├── RecentActivity/
│   │       │   ├── RecentActivity.tsx
│   │       │   └── RecentActivity.types.ts
│   │       └── QuickActions/
│   │           ├── QuickActions.tsx
│   │           └── QuickActions.types.ts
│   ├── Works/
│   │   ├── Works.tsx
│   │   ├── Works.types.ts
│   │   └── components/
│   │       ├── WorkCreateModal/
│   │       │   ├── WorkCreateModal.tsx
│   │       │   └── WorkCreateModal.types.ts
│   │       └── WorkEditModal/
│   │           ├── WorkEditModal.tsx
│   │           └── WorkEditModal.types.ts
│   ├── Timer/
│   │   ├── Timer.tsx
│   │   ├── Timer.types.ts
│   │   └── components/
│   │       ├── TimerSettings/
│   │       │   ├── TimerSettings.tsx
│   │       │   └── TimerSettings.types.ts
│   │       └── TimerHistory/
│   │           ├── TimerHistory.tsx
│   │           └── TimerHistory.types.ts
│   ├── Analytics/
│   │   ├── Analytics.tsx
│   │   ├── Analytics.types.ts
│   │   └── components/
│   │       ├── AnalyticsFilters/
│   │       │   ├── AnalyticsFilters.tsx
│   │       │   └── AnalyticsFilters.types.ts
│   │       ├── AnalyticsCharts/
│   │       │   ├── AnalyticsCharts.tsx
│   │       │   └── AnalyticsCharts.types.ts
│   │       └── ExportModal/
│   │           ├── ExportModal.tsx
│   │           └── ExportModal.types.ts
│   └── Settings/
│       ├── Settings.tsx
│       ├── Settings.types.ts
│       └── components/
│           ├── GeneralSettings/
│           │   ├── GeneralSettings.tsx
│           │   └── GeneralSettings.types.ts
│           ├── TimerSettings/
│           │   ├── TimerSettings.tsx
│           │   └── TimerSettings.types.ts
│           └── AboutSettings/
│               ├── AboutSettings.tsx
│               └── AboutSettings.types.ts
├── hooks/              # 自定义Hooks
│   ├── api/
│   │   ├── useWorks.ts
│   │   ├── useTimer.ts
│   │   ├── useAnalytics.ts
│   │   └── useApi.ts
│   ├── ui/
│   │   ├── useTheme.ts
│   │   ├── useToast.ts
│   │   ├── useModal.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── timer/
│   │   ├── useTimerLogic.ts
│   │   ├── useTimerSound.ts
│   │   └── useTimerNotification.ts
│   └── index.ts
├── stores/             # Zustand 状态管理
│   ├── worksStore.ts
│   ├── timerStore.ts
│   ├── uiStore.ts
│   ├── appStore.ts
│   └── index.ts
├── services/           # API服务
│   ├── api.ts
│   ├── notification.ts
│   ├── sound.ts
│   ├── storage.ts
│   └── validation.ts
├── lib/                # 工具库
│   ├── utils.ts        # 通用工具函数
│   ├── validations.ts  # 表单验证
│   ├── constants.ts    # 常量定义
│   └── cn.ts          # clsx 合并工具
├── utils/              # 工具函数
│   ├── time.ts
│   ├── date.ts
│   ├── format.ts
│   └── helpers.ts
├── types/              # TypeScript 类型定义
│   ├── api.ts
│   ├── app.ts
│   ├── timer.ts
│   ├── work.ts
│   ├── analytics.ts
│   └── ui.ts
├── assets/             # 静态资源
│   ├── images/
│   │   ├── logo.png
│   │   ├── icon.png
│   │   └── favicon.ico
│   ├── sounds/
│   │   ├── start.mp3
│   │   ├── complete.mp3
│   │   └── notification.mp3
│   └── fonts/
│       └── inter.woff2
├── styles/             # 样式文件
│   ├── globals.css     # Tailwind 全局样式
│   └── theme.css       # 主题变量
├── constants/          # 常量定义
│   ├── routes.ts
│   ├── api.ts
│   ├── timer.ts
│   └── ui.ts
├── config/             # 配置文件
│   ├── app.ts
│   ├── api.ts
│   └── theme.ts
├── App.tsx
├── main.tsx
└── index.ts
```

## 3. 核心组件设计

### 3.1 Shadcn UI 组件集成

#### 3.1.1 基础组件配置
```typescript
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        explore: "bg-explore text-explore-foreground hover:bg-explore/90",
        utilize: "bg-utilize text-utilize-foreground hover:bg-utilize/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### 3.1.2 工具函数
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN')
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function calculateProgress(targetHours: number, spentMinutes: number): number {
  const targetMinutes = targetHours * 60
  return Math.min((spentMinutes / targetMinutes) * 100, 100)
}
```

### 3.2 计时器组件族

#### 3.2.1 TimerDisplay 组件
```typescript
// components/features/timer/TimerDisplay.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  timeRemaining: number; // 剩余时间（秒）
  totalTime: number;     // 总时间（秒）
  mode: 'explore' | 'utilize';
  isRunning: boolean;
  isPaused: boolean;
  workName?: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function TimerDisplay({
  timeRemaining,
  totalTime,
  mode,
  isRunning,
  isPaused,
  workName,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset
}: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        {/* 进度环 */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <Progress 
            value={progress} 
            className="w-full h-full rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn(
                "text-4xl font-bold",
                mode === 'explore' ? "text-explore" : "text-utilize"
              )}>
                {formatTime(timeRemaining)}
              </div>
              {isPaused && (
                <div className="text-sm text-muted-foreground mt-1">
                  已暂停
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 作品信息 */}
        {workName && (
          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground">当前作品</div>
            <div className="font-medium">{workName}</div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button
              onClick={onStart}
              size="lg"
              className={cn(
                mode === 'explore' 
                  ? "bg-explore hover:bg-explore/90" 
                  : "bg-utilize hover:bg-utilize/90"
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              开始
            </Button>
          ) : isPaused ? (
            <Button
              onClick={onResume}
              size="lg"
              className={cn(
                mode === 'explore' 
                  ? "bg-explore hover:bg-explore/90" 
                  : "bg-utilize hover:bg-utilize/90"
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              继续
            </Button>
          ) : (
            <Button
              onClick={onPause}
              variant="outline"
              size="lg"
            >
              <Pause className="w-4 h-4 mr-2" />
              暂停
            </Button>
          )}
          
          <Button
            onClick={onStop}
            variant="outline"
            size="lg"
            disabled={!isRunning && !isPaused}
          >
            <Square className="w-4 h-4 mr-2" />
            停止
          </Button>
          
          <Button
            onClick={onReset}
            variant="ghost"
            size="lg"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 3.2.2 FloatWindow 组件
```typescript
// components/features/timer/FloatWindow.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface FloatWindowProps {
  isVisible: boolean;
  position: { x: number; y: number };
  timerSession: TimerSession | null;
  onPositionChange: (position: { x: number; y: number }) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onClose: () => void;
}

export function FloatWindow({
  isVisible,
  position,
  timerSession,
  onPositionChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onClose
}: FloatWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      };
      onPositionChange(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50 cursor-move"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onMouseDown={handleMouseDown}
      >
        <Card className="w-64 shadow-lg backdrop-blur-sm bg-background/80">
          <CardContent className="p-4">
            {/* 模式指示器 */}
            <div className={cn(
              "w-3 h-3 rounded-full mx-auto mb-2",
              timerSession?.mode === 'explore' ? "bg-explore" : "bg-utilize"
            )} />
            
            {/* 时间显示 */}
            <div className="text-center mb-3">
              <div className={cn(
                "text-2xl font-bold",
                timerSession?.mode === 'explore' ? "text-explore" : "text-utilize"
              )}>
                {formatTime(timerSession?.remainingTime || 0)}
              </div>
              {timerSession?.work_name && (
                <div className="text-xs text-muted-foreground truncate">
                  {timerSession.work_name}
                </div>
              )}
            </div>

            {/* 进度条 */}
            <Progress 
              value={timerSession ? ((timerSession.duration * 60 - timerSession.remainingTime) / (timerSession.duration * 60)) * 100 : 0}
              className="h-1 mb-3"
            />

            {/* 控制按钮 */}
            <div className="flex justify-center space-x-1">
              {!timerSession?.is_active ? (
                <Button
                  size="sm"
                  onClick={onStart}
                  className={cn(
                    timerSession?.mode === 'explore' 
                      ? "bg-explore hover:bg-explore/90" 
                      : "bg-utilize hover:bg-utilize/90"
                  )}
                >
                  <Play className="w-3 h-3" />
                </Button>
              ) : timerSession?.is_paused ? (
                <Button
                  size="sm"
                  onClick={onResume}
                  className={cn(
                    timerSession?.mode === 'explore' 
                      ? "bg-explore hover:bg-explore/90" 
                      : "bg-utilize hover:bg-utilize/90"
                  )}
                >
                  <Play className="w-3 h-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onPause}
                >
                  <Pause className="w-3 h-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={onStop}
                disabled={!timerSession?.is_active}
              >
                <Square className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 3.3 作品管理组件族

#### 3.3.1 WorkCard 组件
```typescript
// components/features/works/WorkCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Edit, Archive, Trash2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDuration, calculateProgress } from "@/lib/utils"

interface WorkCardProps {
  work: Work;
  progress?: number;
  timeSpent?: number;
  onEdit?: (work: Work) => void;
  onDelete?: (workId: number) => void;
  onArchive?: (workId: number) => void;
  onSelect?: (work: Work) => void;
  isSelected?: boolean;
}

export function WorkCard({
  work,
  progress = 0,
  timeSpent = 0,
  onEdit,
  onDelete,
  onArchive,
  onSelect,
  isSelected = false
}: WorkCardProps) {
  const calculatedProgress = calculateProgress(work.target_hours, timeSpent);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={() => onSelect?.(work)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: work.color || 'hsl(var(--primary))' }}
            />
            <div className="flex-1">
              <CardTitle className="text-lg truncate">{work.name}</CardTitle>
              {work.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {work.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(work);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onArchive?.(work.id!);
              }}
            >
              <Archive className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(work.id!);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>完成进度</span>
            <span className="font-medium">{calculatedProgress.toFixed(1)}%</span>
          </div>
          <Progress value={calculatedProgress} className="h-2" />
        </div>
        
        {/* 时间统计 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>已投入: {formatDuration(timeSpent)}</span>
          </div>
          <Badge variant="secondary">
            目标: {work.target_hours}h
          </Badge>
        </div>
        
        {/* 创建时间 */}
        <div className="text-xs text-muted-foreground">
          创建于 {new Date(work.created_at!).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3.4 数据分析组件族

#### 3.4.1 StatsCard 组件
```typescript
// components/features/analytics/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  description,
  className
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      case 'stable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold">
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </div>
          {trend && trendValue && (
            <Badge variant="secondary" className={getTrendColor()}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(trendValue)}%</span>
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

## 4. 状态管理设计

### 4.1 Store 结构
```typescript
// stores/index.ts
export interface AppState {
  works: WorksState;
  timer: TimerState;
  ui: UIState;
  app: AppState;
}

// stores/worksStore.ts
interface WorksState {
  works: Work[];
  currentWork: Work | null;
  loading: boolean;
  error: string | null;
}

// stores/timerStore.ts
interface TimerState {
  currentSession: TimerSession | null;
  isRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  config: TimerConfig;
  history: TimerSession[];
}

// stores/uiStore.ts
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  floatWindowVisible: boolean;
  floatWindowPosition: { x: number; y: number };
  activeModal: string | null;
  toast: ToastState[];
}

// stores/appStore.ts
interface AppState {
  initialized: boolean;
  version: string;
  online: boolean;
  lastSync: Date | null;
}
```

### 4.2 Zustand Store 实现
```typescript
// stores/timerStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TimerService } from '../services/timer';
import { TimerSession, TimerConfig } from '../types/timer';

interface TimerState {
  currentSession: TimerSession | null;
  isRunning: boolean;
  isPaused: boolean;
  remainingTime: number;
  config: TimerConfig;
  history: TimerSession[];
  
  // Actions
  startTimer: (workId: number, mode: 'explore' | 'utilize', duration: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  updateConfig: (config: Partial<TimerConfig>) => Promise<void>;
  setRemainingTime: (time: number) => void;
  loadHistory: () => Promise<void>;
}

const defaultConfig: TimerConfig = {
  focus_duration: 25,
  short_break: 5,
  long_break: 15,
  auto_start_breaks: true,
  auto_start_pomodoros: false
};

export const useTimerStore = create<TimerState>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        isRunning: false,
        isPaused: false,
        remainingTime: 0,
        config: defaultConfig,
        history: [],
        
        startTimer: async (workId, mode, duration) => {
          try {
            const session = await TimerService.startTimer(workId, mode, duration);
            set({
              currentSession: session,
              isRunning: true,
              isPaused: false,
              remainingTime: duration * 60
            });
          } catch (error) {
            console.error('Failed to start timer:', error);
          }
        },
        
        pauseTimer: async () => {
          try {
            await TimerService.pauseTimer();
            set({ isPaused: true });
          } catch (error) {
            console.error('Failed to pause timer:', error);
          }
        },
        
        resumeTimer: async () => {
          try {
            await TimerService.resumeTimer();
            set({ isPaused: false });
          } catch (error) {
            console.error('Failed to resume timer:', error);
          }
        },
        
        stopTimer: async () => {
          try {
            const record = await TimerService.stopTimer();
            set({
              currentSession: null,
              isRunning: false,
              isPaused: false,
              remainingTime: 0
            });
            get().loadHistory();
          } catch (error) {
            console.error('Failed to stop timer:', error);
          }
        },
        
        updateConfig: async (newConfig) => {
          try {
            await TimerService.updateConfig(newConfig);
            set((state) => ({
              config: { ...state.config, ...newConfig }
            }));
          } catch (error) {
            console.error('Failed to update config:', error);
          }
        },
        
        setRemainingTime: (time) => {
          set({ remainingTime: time });
        },
        
        loadHistory: async () => {
          try {
            const history = await TimerService.getHistory();
            set({ history });
          } catch (error) {
            console.error('Failed to load history:', error);
          }
        }
      }),
      {
        name: 'timer-storage',
        partialize: (state) => ({
          config: state.config,
          history: state.history
        })
      }
    ),
    { name: 'timer-store' }
  )
);
```

## 5. API 服务层设计

### 5.1 API Service 基类
```typescript
// services/api.ts
import { invoke } from '@tauri-apps/api/core';

export class ApiService {
  private static instance: ApiService;
  
  private constructor() {}
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  private async handleRequest<T>(
    command: string,
    params?: any
  ): Promise<T> {
    try {
      const result = await invoke<T>(command, params);
      return result;
    } catch (error) {
      console.error(`API Error: ${command}`, error);
      throw new Error(this.formatErrorMessage(error));
    }
  }
  
  private formatErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

// services/works.ts
export class WorksService extends ApiService {
  async getWorks(): Promise<Work[]> {
    return this.handleRequest<Work[]>('get_works');
  }
  
  async createWork(work: CreateWorkParams): Promise<number> {
    return this.handleRequest<number>('create_work', work);
  }
  
  async updateWork(work: Work): Promise<void> {
    return this.handleRequest<void>('update_work', work);
  }
  
  async deleteWork(id: number): Promise<void> {
    return this.handleRequest<void>('delete_work', { id });
  }
  
  async archiveWork(id: number): Promise<void> {
    return this.handleRequest<void>('archive_work', { id });
  }
  
  async unarchiveWork(id: number): Promise<void> {
    return this.handleRequest<void>('unarchive_work', { id });
  }
}
```

### 5.2 API Hooks
```typescript
// hooks/api/useWorks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorksService } from '../services/works';
import { Work, CreateWorkParams } from '../types/work';

export function useWorks() {
  const queryClient = useQueryClient();
  
  const works = useQuery({
    queryKey: ['works'],
    queryFn: () => WorksService.getInstance().getWorks(),
  });

  const createWork = useMutation({
    mutationFn: (work: CreateWorkParams) => 
      WorksService.getInstance().createWork(work),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
  });

  const updateWork = useMutation({
    mutationFn: (work: Work) => 
      WorksService.getInstance().updateWork(work),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
  });

  const deleteWork = useMutation({
    mutationFn: (id: number) => 
      WorksService.getInstance().deleteWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
  });

  const archiveWork = useMutation({
    mutationFn: (id: number) => 
      WorksService.getInstance().archiveWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
  });

  return {
    works,
    createWork,
    updateWork,
    deleteWork,
    archiveWork,
  };
}
```

## 6. 样式系统设计

### 6.1 Tailwind CSS 配置
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          explore: "hsl(var(--explore))",    // 探索模式蓝色
          utilize: "hsl(var(--utilize))",    // 利用模式橙色
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 6.2 全局样式
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 210 40% 50%;
    --primary-foreground: 210 40% 98%;
    --explore: 210 40% 50%;    /* 蓝色系 - 探索模式 */
    --utilize: 24 100% 50%;    /* 橙色系 - 利用模式 */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 210 40% 50%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* 自定义工具类 */
@layer utilities {
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  
  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }
}
```

## 7. 路由和导航设计

### 7.1 路由配置
```typescript
// router/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { Dashboard } from '../pages/Dashboard';
import { Works } from '../pages/Works';
import { Timer } from '../pages/Timer';
import { Analytics } from '../pages/Analytics';
import { Settings } from '../pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/works',
        element: <Works />
      },
      {
        path: '/timer',
        element: <Timer />
      },
      {
        path: '/analytics',
        element: <Analytics />
      },
      {
        path: '/settings',
        element: <Settings />
      }
    ]
  }
]);

export default router;
```

### 7.2 布局组件
```typescript
// components/layout/Sidebar.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Timer, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: '仪表板', icon: LayoutDashboard },
  { path: '/works', label: '作品管理', icon: FolderOpen },
  { path: '/timer', label: '计时器', icon: Timer },
  { path: '/analytics', label: '数据分析', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn(
      "bg-background border-r transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          {isOpen && (
            <h1 className="text-xl font-bold">汐律</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </Button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
```

## 8. 性能优化策略

### 8.1 组件优化
```typescript
// 使用React.memo优化组件渲染
const WorkCard = React.memo<WorkCardProps>(({ work, onSelect, onEdit, onDelete }) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.work.id === nextProps.work.id &&
    prevProps.work.name === nextProps.work.name &&
    prevProps.isSelected === nextProps.isSelected
  );
});

// 使用useMemo和useCallback优化计算
const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining, mode }) => {
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeRemaining]);
  
  const handleTimeUpdate = useCallback((time: number) => {
    // 处理时间更新
  }, []);
  
  return (
    <div className={`timer-display timer-display--${mode}`}>
      <span className="timer-display__time">{formattedTime}</span>
    </div>
  );
};
```

### 8.2 代码分割和懒加载
```typescript
// 路由级别的代码分割
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Works = lazy(() => import('../pages/Works'));
const Timer = lazy(() => import('../pages/Timer'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Settings = lazy(() => import('../pages/Settings'));

// 组件级别的代码分割
const HeavyChart = lazy(() => import('./charts/HeavyChart'));

const AnalyticsPage: React.FC = () => {
  return (
    <div>
      <h2>数据分析</h2>
      <Suspense fallback={<LoadingSpinner />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
};
```

## 9. 测试策略

### 9.1 组件测试
```typescript
// components/features/timer/TimerDisplay.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('TimerDisplay', () => {
  const mockProps = {
    timeRemaining: 1500, // 25分钟
    totalTime: 1500,
    mode: 'explore' as const,
    isRunning: false,
    isPaused: false,
    workName: '测试作品',
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onStop: jest.fn(),
    onReset: jest.fn(),
  };

  it('renders timer display correctly', () => {
    render(<TimerDisplay {...mockProps} />);
    
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('测试作品')).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', () => {
    render(<TimerDisplay {...mockProps} />);
    
    fireEvent.click(screen.getByText('开始'));
    expect(mockProps.onStart).toHaveBeenCalled();
  });
});
```

### 9.2 Hook测试
```typescript
// hooks/api/useWorks.test.ts
import { renderHook, act } from '@testing-library/react';
import { useWorks } from './useWorks';
import { WorksService } from '../../services/works';

// Mock the service
jest.mock('../../services/works');

describe('useWorks', () => {
  const mockWorks = [
    { id: 1, name: '作品1', target_hours: 10 },
    { id: 2, name: '作品2', target_hours: 20 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (WorksService.getInstance as jest.Mock).mockReturnValue({
      getWorks: jest.fn().mockResolvedValue(mockWorks),
      createWork: jest.fn().mockResolvedValue(3),
    });
  });

  it('fetches works on mount', async () => {
    const { result } = renderHook(() => useWorks());
    
    expect(result.current.works.isLoading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.works.data).toEqual(mockWorks);
  });
});
```

## 10. 开发工具和配置

### 10.1 ESLint配置
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### 10.2 Prettier配置
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
};
```

## 11. 部署和构建配置

### 11.1 Vite配置
```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/stores": path.resolve(__dirname, "./src/stores"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          radix: ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
          lucide: ['lucide-react'],
          recharts: ['recharts'],
          zustand: ['zustand'],
          hookform: ['react-hook-form', '@hookform/resolvers'],
          zod: ['zod']
        }
      }
    }
  }
});
```

### 11.2 TypeScript配置
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/stores/*": ["src/stores/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/styles/*": ["src/styles/*"],
      "@/assets/*": ["src/assets/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "src-tauri"]
}
```

---

*本文档详细描述了汐律项目的前端架构和组件设计，使用Shadcn UI + Tailwind CSS技术栈，为开发工作提供了完整的技术指导。*