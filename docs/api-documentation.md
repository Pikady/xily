# 汐律项目 API 接口文档

## 概述

本文档描述了汐律时间管理应用的后端 API 接口，供前端开发者进行对接。所有接口都通过 Tauri 的 `invoke` 方法调用。

## 基础信息

- **API 类型**: Tauri Commands
- **数据格式**: JSON
- **错误处理**: 统一返回 `Result<T, String>` 格式
- **异步支持**: 所有接口都支持异步调用

## 调用方式

### JavaScript/TypeScript 调用示例

```typescript
import { invoke } from '@tauri-apps/api/tauri';

// 调用 API
try {
  const result = await invoke<Work[]>('get_works');
  console.log('作品列表:', result);
} catch (error) {
  console.error('调用失败:', error);
}
```

### React Hook 封装示例

```typescript
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Work[]>('get_works');
      setWorks(result);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  }, []);

  return { works, loading, error, fetchWorks };
}
```

## 数据类型定义

### Work（作品）
```typescript
interface Work {
  id?: number;              // 作品ID
  name: string;             // 作品名称
  description?: string;     // 作品描述
  color?: string;           // 作品颜色（十六进制）
  created_at?: string;      // 创建时间
  updated_at?: string;      // 更新时间
  target_hours: number;     // 目标小时数
  is_archived: boolean;     // 是否已归档
}
```

### TimerSession（计时器会话）
```typescript
interface TimerSession {
  id?: number;              // 会话ID
  work_id: number;          // 关联作品ID
  mode: 'explore' | 'utilize'; // 模式：探索/利用
  start_time: string;       // 开始时间
  is_active: boolean;       // 是否活跃
  duration: number;         // 预设时长（分钟）
}
```

### TimerConfig（计时器配置）
```typescript
interface TimerConfig {
  focus_duration: number;           // 专注时长（分钟）
  short_break: number;              // 短休息时长（分钟）
  long_break: number;               // 长休息时长（分钟）
  auto_start_breaks: boolean;       // 自动开始休息
  auto_start_pomodoros: boolean;    // 自动开始番茄钟
}
```

### TimeRecord（时间记录）
```typescript
interface TimeRecord {
  id?: number;              // 记录ID
  work_id?: number;         // 关联作品ID
  mode: 'explore' | 'utilize'; // 模式
  duration: number;         // 实际时长（分钟）
  start_time: string;       // 开始时间
  end_time: string;         // 结束时间
  is_completed: boolean;    // 是否完成
  notes?: string;           // 备注
}
```

## API 接口详情

### 1. 作品管理 API

#### 1.1 创建作品
```typescript
// API 调用
const workId = await invoke<number>('create_work', {
  name: '学习 Rust',
  description: '深入学习 Rust 编程语言',
  color: '#3498db',
  target_hours: 100
});

// 参数
interface CreateWorkParams {
  name: string;           // 作品名称（必填）
  description?: string;   // 作品描述（可选）
  color?: string;         // 作品颜色（可选）
  target_hours: number;   // 目标小时数（必填）
}

// 返回值
number: 新创建的作品ID
```

#### 1.2 获取作品列表
```typescript
// API 调用
const works = await invoke<Work[]>('get_works');

// 返回值
Work[]: 作品列表（不包含已归档的作品）
```

#### 1.3 获取单个作品
```typescript
// API 调用
const work = await invoke<Work>('get_work', { id: 1 });

// 参数
interface GetWorkParams {
  id: number;  // 作品ID
}

// 返回值
Work | null: 作品信息，如果不存在返回 null
```

#### 1.4 更新作品
```typescript
// API 调用
await invoke('update_work', {
  id: 1,
  name: '学习 Rust (进阶)',
  description: '深入学习 Rust 高级特性',
  color: '#e67e22',
  target_hours: 150,
  is_archived: false
});

// 参数
Work: 完整的作品对象
```

#### 1.5 删除作品
```typescript
// API 调用
await invoke('delete_work', { id: 1 });

// 参数
interface DeleteWorkParams {
  id: number;  // 作品ID
}
```

#### 1.6 归档作品
```typescript
// API 调用
await invoke('archive_work', { id: 1 });

// 参数
interface ArchiveWorkParams {
  id: number;  // 作品ID
}
```

#### 1.7 取消归档作品
```typescript
// API 调用
await invoke('unarchive_work', { id: 1 });

// 参数
interface UnarchiveWorkParams {
  id: number;  // 作品ID
}
```

#### 1.8 获取作品统计
```typescript
// API 调用
const stats = await invoke<WorkStats>('get_work_stats', { id: 1 });

// 参数
interface GetWorkStatsParams {
  id: number;  // 作品ID
}

// 返回值
interface WorkStats {
  total_time: number;        // 总时长（分钟）
  session_count: number;     // 会话数量
  explore_time: number;      // 探索时长
  utilize_time: number;      // 利用时长
  completion_rate: number;   // 完成率
}
```

#### 1.9 获取所有作品统计
```typescript
// API 调用
const allStats = await invoke<WorkStats[]>('get_all_works_stats');

// 返回值
WorkStats[]: 所有作品的统计信息
```

### 2. 计时器 API

#### 2.1 开始计时
```typescript
// API 调用
const session = await invoke<TimerSession>('start_timer', {
  work_id: 1,
  mode: 'explore',
  duration: 25
});

// 参数
interface StartTimerParams {
  work_id: number;                    // 关联作品ID
  mode: 'explore' | 'utilize';        // 计时模式
  duration: number;                   // 时长（分钟）
}

// 返回值
TimerSession: 新创建的计时器会话
```

#### 2.2 停止计时
```typescript
// API 调用
const record = await invoke<TimeRecord>('stop_timer');

// 返回值
TimeRecord | null: 时间记录，如果没有活跃会话返回 null
```

#### 2.3 暂停计时
```typescript
// API 调用
const paused = await invoke<boolean>('pause_timer');

// 返回值
boolean: 是否成功暂停
```

#### 2.4 恢复计时
```typescript
// API 调用
const resumed = await invoke<boolean>('resume_timer');

// 返回值
boolean: 是否成功恢复
```

#### 2.5 获取当前会话
```typescript
// API 调用
const session = await invoke<TimerSession>('get_current_session');

// 返回值
TimerSession | null: 当前活跃的计时器会话
```

#### 2.6 获取计时器配置
```typescript
// API 调用
const config = await invoke<TimerConfig>('get_timer_config');

// 返回值
TimerConfig: 当前计时器配置
```

#### 2.7 保存计时器配置
```typescript
// API 调用
await invoke('save_timer_config', {
  focus_duration: 30,
  short_break: 5,
  long_break: 15,
  auto_start_breaks: true,
  auto_start_pomodoros: false
});

// 参数
TimerConfig: 计时器配置对象
```

#### 2.8 获取计时器历史
```typescript
// API 调用
const sessions = await invoke<TimerSession[]>('get_timer_sessions', {
  work_id: 1,
  limit: 10
});

// 参数
interface GetTimerSessionsParams {
  work_id?: number;  // 作品ID（可选）
  limit?: number;    // 限制数量（可选）
}

// 返回值
TimerSession[]: 计时器会话列表
```

### 3. 数据分析 API

#### 3.1 获取工作时间分布
```typescript
// API 调用
const distribution = await invoke<WorkTimeStats[]>('get_work_time_distribution', {
  work_id: 1,
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z'
});

// 参数
interface GetWorkTimeDistributionParams {
  work_id?: number;      // 作品ID（可选）
  start_date?: string;   // 开始日期（ISO格式）
  end_date?: string;     // 结束日期（ISO格式）
}

// 返回值
interface WorkTimeStats {
  work_id: number;           // 作品ID
  work_name: string;         // 作品名称
  work_color?: string;       // 作品颜色
  total_time: number;        // 总时长（分钟）
  session_count: number;     // 会话数量
  avg_duration: number;      // 平均时长（分钟）
}
```

#### 3.2 获取模式分布
```typescript
// API 调用
const modeStats = await invoke<ModeStats>('get_mode_distribution', {
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z'
});

// 参数
interface GetModeDistributionParams {
  start_date?: string;   // 开始日期（ISO格式）
  end_date?: string;     // 结束日期（ISO格式）
}

// 返回值
interface ModeStats {
  explore_time: number;      // 探索模式时长（分钟）
  utilize_time: number;      // 利用模式时长（分钟）
  explore_sessions: number;   // 探索模式会话数
  utilize_sessions: number;   // 利用模式会话数
  total_time: number;        // 总时长
  balance_ratio: number;      // 平衡比率（探索/利用）
}
```

#### 3.3 获取每日统计
```typescript
// API 调用
const dailyStats = await invoke<DailyStats[]>('get_daily_stats', {
  days: 30
});

// 参数
interface GetDailyStatsParams {
  days: number;  // 统计天数
}

// 返回值
interface DailyStats {
  date: string;          // 日期
  total_time: number;    // 总时长（分钟）
  session_count: number; // 会话数量
  explore_time: number;  // 探索时长
  utilize_time: number;  // 利用时长
}
```

#### 3.4 获取工作进度
```typescript
// API 调用
const progress = await invoke<WorkProgress>('get_work_progress', {
  work_id: 1
});

// 参数
interface GetWorkProgressParams {
  work_id: number;  // 作品ID
}

// 返回值
interface WorkProgress {
  work_id: number;            // 作品ID
  target_hours: number;       // 目标小时数
  total_minutes: number;       // 已完成分钟数
  session_count: number;       // 会话数量
  avg_duration: number;        // 平均时长
  progress_percentage: number; // 进度百分比
}
```

#### 3.5 获取生产力趋势
```typescript
// API 调用
const trends = await invoke<ProductivityTrend[]>('get_productivity_trends', {
  days: 30
});

// 参数
interface GetProductivityTrendsParams {
  days: number;  // 统计天数
}

// 返回值
interface ProductivityTrend {
  date: string;                  // 日期
  total_time: number;            // 总时长
  explore_time: number;          // 探索时长
  utilize_time: number;          // 利用时长
  session_count: number;         // 会话数量
  avg_session_duration: number;  // 平均会话时长
}
```

#### 3.6 导出数据
```typescript
// API 调用
const exportData = await invoke<ExportData>('export_data', {
  work_id: 1,
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z'
});

// 参数
interface ExportDataParams {
  work_id?: number;      // 作品ID（可选）
  start_date?: string;   // 开始日期（ISO格式）
  end_date?: string;     // 结束日期（ISO格式）
}

// 返回值
interface ExportData {
  work_stats: WorkTimeStats[];  // 工作统计
  mode_stats: ModeStats;        // 模式统计
  daily_stats: DailyStats[];    // 每日统计
  export_date: string;          // 导出时间
}
```

### 4. 窗口管理 API

#### 4.1 显示主窗口
```typescript
// API 调用
await invoke('show_main_window');
```

#### 4.2 隐藏主窗口
```typescript
// API 调用
await invoke('hide_main_window');
```

#### 4.3 切换悬浮窗
```typescript
// API 调用
await invoke('toggle_float_window');
```

#### 4.4 显示悬浮窗
```typescript
// API 调用
await invoke('show_float_window');
```

#### 4.5 隐藏悬浮窗
```typescript
// API 调用
await invoke('hide_float_window');
```

#### 4.6 最小化主窗口
```typescript
// API 调用
await invoke('minimize_main_window');
```

#### 4.7 最大化主窗口
```typescript
// API 调用
await invoke('maximize_main_window');
```

#### 4.8 设置悬浮窗位置
```typescript
// API 调用
await invoke('set_float_window_position', {
  x: 100,
  y: 100
});

// 参数
interface SetFloatWindowPositionParams {
  x: number;  // X坐标
  y: number;  // Y坐标
}
```

#### 4.9 获取悬浮窗位置
```typescript
// API 调用
const position = await invoke<{x: number, y: number} | null>('get_float_window_position');

// 返回值
{x: number, y: number} | null: 窗口位置坐标
```

#### 4.10 检查悬浮窗可见性
```typescript
// API 调用
const isVisible = await invoke<boolean>('is_float_window_visible');

// 返回值
boolean: 悬浮窗是否可见
```

#### 4.11 检查主窗口可见性
```typescript
// API 调用
const isVisible = await invoke<boolean>('is_main_window_visible');

// 返回值
boolean: 主窗口是否可见
```

### 5. 系统 API

#### 5.1 获取应用版本
```typescript
// API 调用
const version = await invoke<string>('get_app_version');

// 返回值
string: 应用版本号
```

#### 5.2 获取应用名称
```typescript
// API 调用
const name = await invoke<string>('get_app_name');

// 返回值
string: 应用名称
```

#### 5.3 退出应用
```typescript
// API 调用
await invoke('quit_app');
```

#### 5.4 显示通知
```typescript
// API 调用
await invoke('show_notification', {
  title: '计时完成',
  body: '您的一个番茄钟已完成！'
});

// 参数
interface ShowNotificationParams {
  title: string;  // 通知标题
  body: string;   // 通知内容
}
```

### 6. 系统托盘 API

系统托盘提供了在后台运行时的应用控制功能，支持显示/隐藏主窗口、悬浮窗以及退出应用等操作。

#### 6.1 显示系统托盘
```typescript
// API 调用
await invoke('show_tray');

// 说明
// 显示系统托盘图标，通常在应用启动时自动创建
```

#### 6.2 隐藏系统托盘
```typescript
// API 调用
await invoke('hide_tray');

// 说明
// 隐藏系统托盘图标
```

#### 6.3 设置托盘图标
```typescript
// API 调用
await invoke('set_tray_icon', {
  icon_path: 'icons/tray-icon.png'
});

// 参数
interface SetTrayIconParams {
  icon_path: string;  // 图标文件路径
}

// 说明
// 更新系统托盘图标
```

#### 6.4 设置托盘提示文本
```typescript
// API 调用
await invoke('set_tray_tooltip', {
  tooltip: '汐律 - 智能时间管理工具'
});

// 参数
interface SetTrayTooltipParams {
  tooltip: string;  // 提示文本
}

// 说明
// 设置鼠标悬停在托盘图标上时显示的提示文本
```

#### 6.5 更新托盘菜单
```typescript
// API 调用
await invoke('update_tray_menu', {
  show_item: true,
  hide_item: true,
  float_item: true,
  quit_item: true,
  timer_status: 'running' // 'running' | 'paused' | 'stopped'
});

// 参数
interface UpdateTrayMenuParams {
  show_item?: boolean;     // 是否显示"显示主窗口"菜单项
  hide_item?: boolean;     // 是否显示"隐藏主窗口"菜单项
  float_item?: boolean;    // 是否显示"显示悬浮窗"菜单项
  quit_item?: boolean;     // 是否显示"退出"菜单项
  timer_status?: string;   // 计时器状态，用于动态更新菜单文本
}

// 说明
// 动态更新系统托盘菜单项的状态和文本
```

#### 6.6 获取托盘可见性
```typescript
// API 调用
const isVisible = await invoke<boolean>('is_tray_visible');

// 返回值
boolean: 系统托盘是否可见
```

#### 6.7 托盘菜单事件处理
系统托盘支持以下菜单事件，这些事件在后端已经实现，前端可以通过监听状态变化来响应：

```typescript
// 菜单项事件
type TrayMenuEvent = 
  | 'show'      // 显示主窗口
  | 'hide'      // 隐藏主窗口
  | 'float'     // 切换悬浮窗
  | 'quit';     // 退出应用

// 托盘图标事件
type TrayIconEvent = 
  | 'left_click'    // 左键单击：切换主窗口显示/隐藏
  | 'double_click'  // 双击：切换悬浮窗显示/隐藏
  | 'right_click';   // 右键：显示上下文菜单
```

#### 6.8 托盘状态查询
```typescript
// API 调用
const trayState = await invoke<TrayState>('get_tray_state');

// 返回值
interface TrayState {
  is_visible: boolean;        // 托盘是否可见
  main_window_visible: boolean; // 主窗口是否可见
  float_window_visible: boolean; // 悬浮窗是否可见
  timer_status: string;       // 计时器状态
}

// 说明
// 获取当前系统托盘和窗口的状态信息
```

#### 6.9 设置托盘右键菜单
```typescript
// API 调用
await invoke('set_tray_context_menu', {
  items: [
    { id: 'show', text: '显示主窗口', enabled: true },
    { id: 'hide', text: '隐藏主窗口', enabled: true },
    { id: 'separator', text: '-', enabled: true },
    { id: 'float', text: '显示悬浮窗', enabled: true },
    { id: 'quit', text: '退出应用', enabled: true }
  ]
});

// 参数
interface TrayMenuItem {
  id: string;           // 菜单项ID
  text: string;         // 显示文本
  enabled: boolean;     // 是否启用
  checked?: boolean;    // 是否选中（仅用于复选框菜单项）
  separator?: boolean;  // 是否为分隔线
}

interface SetTrayContextMenuParams {
  items: TrayMenuItem[]; // 菜单项列表
}

// 说明
// 自定义系统托盘的右键上下文菜单
```

#### 6.10 托盘通知集成
```typescript
// API 调用
await invoke('show_tray_notification', {
  title: '计时完成',
  body: '您的一个番茄钟已完成！',
  icon: 'info',
  duration: 5000
});

// 参数
interface ShowTrayNotificationParams {
  title: string;        // 通知标题
  body: string;         // 通知内容
  icon?: string;        // 通知图标类型：'info' | 'warning' | 'error' | 'success'
  duration?: number;    // 显示时长（毫秒）
}

// 说明
// 通过系统托盘显示桌面通知
```

### 系统托盘使用示例

```typescript
// 完整的系统托盘管理示例
class TrayManager {
  // 初始化系统托盘
  static async init() {
    try {
      await invoke('show_tray');
      await invoke('set_tray_tooltip', '汐律 - 智能时间管理工具');
      await this.updateTrayMenu();
    } catch (error) {
      console.error('初始化系统托盘失败:', error);
    }
  }

  // 更新托盘菜单
  static async updateTrayMenu(timerStatus = 'stopped') {
    try {
      await invoke('update_tray_menu', {
        show_item: true,
        hide_item: true,
        float_item: true,
        quit_item: true,
        timer_status: timerStatus
      });
    } catch (error) {
      console.error('更新托盘菜单失败:', error);
    }
  }

  // 显示托盘通知
  static async showNotification(title: string, body: string) {
    try {
      await invoke('show_tray_notification', {
        title,
        body,
        icon: 'info',
        duration: 5000
      });
    } catch (error) {
      console.error('显示托盘通知失败:', error);
    }
  }

  // 获取托盘状态
  static async getState() {
    try {
      return await invoke<TrayState>('get_tray_state');
    } catch (error) {
      console.error('获取托盘状态失败:', error);
      return null;
    }
  }
}

// 在应用启动时初始化系统托盘
TrayManager.init();

// 在计时器状态变化时更新托盘
timerStore.subscribe((state) => {
  TrayManager.updateTrayMenu(state.status);
});

// 在计时完成时显示通知
if (timerCompleted) {
  TrayManager.showNotification('计时完成', '您的一个番茄钟已完成！');
}
```

## 错误处理

### 错误类型
```typescript
// 常见错误类型
type ApiError = {
  code: string;
  message: string;
  details?: any;
};

// 错误示例
const errors = {
  DATABASE_ERROR: '数据库操作失败',
  VALIDATION_ERROR: '数据验证失败',
  TIMER_NOT_RUNNING: '计时器未运行',
  WORK_NOT_FOUND: '作品不存在',
  INVALID_PARAMETERS: '参数无效'
};
```

### 错误处理最佳实践
```typescript
// 封装错误处理
async function safeApiCall<T>(
  command: string,
  params?: any
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await invoke<T>(command, params);
    return { success: true, data };
  } catch (error) {
    console.error(`API调用失败: ${command}`, error);
    return { success: false, error: error as string };
  }
}

// 使用示例
const result = await safeApiCall<Work[]>('get_works');
if (result.success) {
  console.log('作品列表:', result.data);
} else {
  showErrorToast(result.error);
}
```

## 性能优化建议

### 1. 数据缓存
```typescript
// 使用 React Query 进行数据缓存
import { useQuery } from '@tanstack/react-query';

function useWorks() {
  return useQuery({
    queryKey: ['works'],
    queryFn: () => invoke<Work[]>('get_works'),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}
```

### 2. 批量操作
```typescript
// 批量删除作品
async function deleteMultipleWorks(ids: number[]) {
  for (const id of ids) {
    await invoke('delete_work', { id });
  }
}
```

### 3. 防抖处理
```typescript
// 防抖处理频繁调用
import { debounce } from 'lodash';

const debouncedUpdate = debounce(async (work: Work) => {
  await invoke('update_work', work);
}, 500);
```

## 调试工具

### 1. 开发者工具
```typescript
// 开发环境日志
const isDev = import.meta.env.DEV;

function logApiCall(command: string, params?: any) {
  if (isDev) {
    console.log(`[API Call] ${command}`, params);
  }
}
```

### 2. 网络监控
```typescript
// API 调用监控
const apiMonitor = {
  calls: [] as Array<{command: string; timestamp: Date; success: boolean}>,
  
  log(command: string, success: boolean) {
    this.calls.push({ command, timestamp: new Date(), success });
  }
};
```

## 最佳实践

### 1. 组件封装
```typescript
// 作品管理组件
function WorkManager() {
  const { works, loading, error, fetchWorks } = useWorks();
  
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);
  
  // 组件逻辑...
}
```

### 2. 状态管理
```typescript
// 使用 Zustand 进行状态管理
import { create } from 'zustand';

interface TimerState {
  currentSession: TimerSession | null;
  isRunning: boolean;
  setCurrentSession: (session: TimerSession | null) => void;
  setIsRunning: (running: boolean) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  currentSession: null,
  isRunning: false,
  setCurrentSession: (session) => set({ currentSession: session }),
  setIsRunning: (running) => set({ isRunning: running }),
}));
```

### 3. 类型安全
```typescript
// 严格的类型定义
type ApiCommand = 
  | 'get_works'
  | 'create_work'
  | 'start_timer'
  | 'stop_timer'
  // ... 其他命令
;

// 类型安全的 API 调用
async function invokeApi<T>(command: ApiCommand, params?: any): Promise<T> {
  return await invoke<T>(command, params);
}
```

## 更新日志

### v1.2.0 (2025-09-12)
- ✅ 补充系统托盘相关API接口文档
- ✅ 添加系统托盘管理功能接口
- ✅ 完善托盘菜单和事件处理说明
- ✅ 添加托盘状态查询和控制接口
- ✅ 提供完整的托盘使用示例代码

### v1.1.0 (2025-09-11)
- ✅ 修复 create_work 接口参数名不匹配问题
- ✅ 添加作品归档/取消归档功能
- ✅ 添加作品统计功能
- ✅ 添加系统通知功能
- ✅ 完善分析相关API接口
- ✅ 修复前端API调用中的技术问题
- ✅ 更新API文档，补充新增接口说明

### v1.0.0 (2024-01-09)
- ✅ 完成所有基础 API 接口
- ✅ 实现作品管理功能
- ✅ 实现计时器功能
- ✅ 实现数据分析功能
- ✅ 实现窗口管理功能
- ✅ 实现系统托盘功能

## 联系方式

如有 API 接口相关问题，请联系开发团队。

---

*本文档最后更新时间：2025年9月12日*