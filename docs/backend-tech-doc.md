# 汐律 (Xily) 后端技术文档

## 概述

汐律是一个基于 Tauri + Rust 构建的智能时间管理桌面应用。本文档详细介绍了后端架构、功能实现以及开发指南。

## 项目结构

```
src-tauri/
├── src/
│   ├── main.rs          # 应用程序入口点
│   ├── lib.rs           # 库入口，包含 Tauri 应用配置
│   ├── database/        # 数据库模块
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑服务
│   ├── commands/        # Tauri 命令处理
│   └── utils/           # 工具函数
├── Cargo.toml           # Rust 依赖配置
└── tauri.conf.json      # Tauri 应用配置
```

## 核心模块详解

### 1. 应用入口 (main.rs & lib.rs)

**main.rs** - 程序入口点：
```rust
fn main() {
    xily_lib::run()
}
```

**lib.rs** - 核心配置：
- 数据库初始化
- Tauri 应用配置
- 注册所有命令处理器
- 开发模式自动开启 DevTools

### 2. 数据库模块 (database/mod.rs)

使用 SQLite 作为本地数据库，包含以下表：

**works 表** - 作品管理：
- `id`: 主键
- `name`: 作品名称
- `description`: 描述
- `color`: 颜色标识
- `target_hours`: 目标小时数
- `is_archived`: 是否归档

**time_records 表** - 时间记录：
- `work_id`: 关联作品
- `mode`: 模式 (explore/utilize)
- `duration`: 持续时间（分钟）
- `start_time/end_time`: 开始/结束时间
- `is_completed`: 是否完成

**user_settings 表** - 用户设置：
- `key/value`: 键值对存储

**system_state 表** - 系统状态：
- 存储应用运行时状态

### 3. 数据模型 (models/mod.rs)

#### Work 结构体
```rust
pub struct Work {
    pub id: Option<i64>,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub target_hours: i32,
    pub is_archived: bool,
}
```

#### TimerSession 结构体
```rust
pub struct TimerSession {
    pub id: Option<i64>,
    pub work_id: i64,
    pub mode: String,
    pub start_time: DateTime<Utc>,
    pub is_active: bool,
    pub duration: i32,
}
```

#### TimerConfig 结构体
```rust
pub struct TimerConfig {
    pub focus_duration: i32,     // 专注时长
    pub short_break: i32,        // 短休息时长
    pub long_break: i32,         // 长休息时长
    pub auto_start_breaks: bool, // 自动开始休息
    pub auto_start_pomodoros: bool, // 自动开始番茄钟
}
```

### 4. 服务层 (services/)

#### WorksService (works.rs)
负责作品管理的所有业务逻辑：

- **create_work**: 创建新作品
- **get_work/get_all_works**: 获取作品信息
- **update_work**: 更新作品信息
- **delete_work**: 删除作品（级联删除时间记录）
- **archive_work/unarchive_work**: 归档/恢复作品

#### TimerService (timer.rs)
管理计时器功能：

- **start_timer**: 开始新的计时会话
- **stop_timer**: 停止计时并保存记录
- **pause_timer/resume_timer**: 暂停/恢复计时
- **get_current_session**: 获取当前会话
- **get_timer_config/save_timer_config**: 计时器配置管理

**重要特性**：
- 使用 `Lazy<Mutex<Option<TimerSession>>>` 管理当前会话状态
- 自动创建 `timer_sessions` 表跟踪计时会话
- 停止时自动计算实际持续时间并创建时间记录

#### AnalyticsService (analytics.rs)
提供数据分析和统计功能：

- **get_work_time_distribution**: 作品时间分布统计
- **get_mode_distribution**: 探索/利用模式统计
- **get_daily_stats**: 每日统计
- **get_work_progress**: 作品进度分析
- **get_productivity_trends**: 生产力趋势
- **export_data**: 数据导出

### 5. 命令处理器 (commands/mod.rs)

所有前端可调用的 Tauri 命令都在此定义。使用 `#[tauri::command]` 宏标记：

```rust
#[tauri::command]
pub async fn create_work(name: String, description: Option<String>, color: Option<String>, target_hours: i32) -> Result<i64, String> {
    let work = Work { /* ... */ };
    WorksService::create_work(&work).map_err(|e| e.to_string())
}
```

## 开发指南

### 1. 环境搭建

**依赖版本**：
- Rust 2021 edition
- Tauri 2.x
- rusqlite 0.29 (SQLite)
- chrono 0.4 (时间处理)
- serde/serde_json (序列化)
- tokio (异步运行时)
- once_cell (懒加载)

**开发命令**：
```bash
# 开发模式
npm run tauri dev

# 构建应用
npm run tauri build
```

### 2. 添加新功能

#### 步骤1：定义数据模型
在 `models/mod.rs` 中添加新的结构体：

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NewFeature {
    pub id: Option<i64>,
    pub name: String,
    // 其他字段...
}
```

#### 步骤2：实现服务层逻辑
在相应的服务文件中添加方法：

```rust
impl WorksService {
    pub fn new_feature_method(&self) -> Result<NewFeature> {
        // 实现逻辑
    }
}
```

#### 步骤3：添加命令处理器
在 `commands/mod.rs` 中添加：

```rust
#[tauri::command]
pub async fn new_command(param: String) -> Result<NewFeature, String> {
    WorksService::new_feature_method().map_err(|e| e.to_string())
}
```

#### 步骤4：注册命令
在 `lib.rs` 的 `invoke_handler` 中添加：

```rust
.invoke_handler(tauri::generate_handler![
    // 现有命令...
    new_command,  // 新命令
])
```

### 3. 数据库操作

#### 创建新表
在 `database/mod.rs` 的 `init_database` 函数中添加：

```sql
CREATE TABLE IF NOT EXISTS new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- 其他字段...
);
```

#### 查询示例
```rust
pub fn get_data() -> Result<Vec<Data>> {
    let conn = get_connection()?;
    let mut stmt = conn.prepare("SELECT * FROM table")?;
    let rows = stmt.query_map([], |row| {
        Ok(Data {
            id: row.get(0)?,
            // 其他字段...
        })
    })?;
    
    let mut results = Vec::new();
    for row in rows {
        results.push(row?);
    }
    Ok(results)
}
```

### 4. 调试技巧

#### 开发模式
- 应用启动时自动打开 DevTools
- 使用 `eprintln!` 输出调试信息

#### 数据库调试
- 数据库文件位置：`src-tauri/xily.db`
- 可使用 SQLite 工具查看数据

#### 日志输出
```rust
eprintln!("Debug info: {}", some_value);
```

### 5. 错误处理

使用 `Result<T, String>` 模式：

```rust
pub fn some_operation() -> Result<DataType, String> {
    // 操作...
    match result {
        Ok(data) => Ok(data),
        Err(e) => Err(format!("Operation failed: {}", e)),
    }
}
```

## 已实现功能

### 1. 作品管理 (WorksService)
- ✅ 创建/获取/更新/删除作品
- ✅ 归档/恢复作品
- ✅ 目标小时数设置

### 2. 计时器系统 (TimerService)
- ✅ 开始/停止/暂停/恢复计时
- ✅ 当前会话状态管理
- ✅ 计时器配置持久化
- ✅ 会话历史记录

### 3. 数据分析 (AnalyticsService)
- ✅ 作品时间分布统计
- ✅ 探索/利用模式分析
- ✅ 每日统计报告
- ✅ 作品进度追踪
- ✅ 生产力趋势分析
- ✅ 数据导出功能

### 4. 窗口管理
- ✅ 主窗口显示/隐藏
- ✅ 悬浮窗控制
- ✅ 窗口位置管理

### 5. 系统功能
- ✅ 应用版本信息
- ✅ 应用退出控制

## 开发注意事项

### 1. 线程安全
- 使用 `Mutex` 保护共享状态
- 使用 `Lazy` 实现懒加载

### 2. 错误处理
- 所有数据库操作都要处理错误
- 使用 `map_err` 转换错误类型

### 3. 性能考虑
- 数据库连接使用全局单例
- 避免频繁的数据库连接创建

### 4. 数据一致性
- 更新操作要同时更新 `updated_at` 字段
- 删除操作要考虑外键约束

## 悬浮窗系统详解

汐律的悬浮窗是一个独立的窗口，提供简洁的计时控制界面，用户可以在使用其他应用时继续进行时间管理。

### 架构设计

悬浮窗系统采用前后端分离架构：

**后端 (Rust)**
- 窗口创建和管理 (`services/window.rs`)
- 位置记忆和状态控制
- 与主窗口的通信

**前端 (React)**
- 独立的 React 应用 (`src/float-window.tsx`)
- 悬浮窗UI组件 (`src/components/float/FloatWindowApp.tsx`)
- 专门的HTML页面 (`float.html`)

### 后端实现 (services/window.rs)

#### 窗口创建
```rust
pub fn create_float_window(app: &tauri::AppHandle) -> Result<WebviewWindow, String> {
    tauri::WebviewWindowBuilder::new(app, "float", tauri::WebviewUrl::App("float.html".parse().unwrap()))
        .title("汐律悬浮窗")
        .decorations(false)           // 无边框
        .transparent(true)            // 透明背景
        .always_on_top(true)          // 始终置顶
        .skip_taskbar(true)           // 不在任务栏显示
        .visible_on_all_workspaces(true) // 所有工作空间可见
        .inner_size(200.0, 200.0)    // 初始大小
        .build()
        .map_err(|e| e.to_string())
}
```

#### 关键配置参数
- **decorations: false** - 移除窗口边框和标题栏
- **transparent: true** - 支持透明背景，实现圆形悬浮窗效果
- **always_on_top: true** - 确保悬浮窗始终在其他窗口之上
- **skip_taskbar: true** - 不在任务栏显示，保持界面清洁
- **visible_on_all_workspaces: true** - 跨桌面工作空间显示

#### 窗口管理功能
```rust
// 切换显示/隐藏
pub fn toggle_float_window(app: &tauri::AppHandle) -> Result<(), String>

// 显示悬浮窗（如果不存在则创建）
pub fn show_float_window(app: &tauri::AppHandle) -> Result<(), String>

// 隐藏悬浮窗
pub fn hide_float_window(app: &tauri::AppHandle) -> Result<(), String>

// 设置窗口位置
pub fn set_float_window_position(app: &tauri::AppHandle, x: f64, y: f64) -> Result<(), String>

// 获取窗口位置（待实现）
pub fn get_float_window_position(app: &tauri::AppHandle) -> Result<Option<(f64, f64)>, String>

// 检查窗口可见性
pub fn is_float_window_visible(app: &tauri::AppHandle) -> Result<bool, String>
```

### 前端实现

#### HTML页面 (float.html)
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="/src/styles/globals.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>汐律悬浮窗</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: transparent;
        overflow: hidden;
      }
      
      #float-root {
        width: 100%;
        height: 100%;
        min-height: 200px;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #3b82f6;
        border-radius: 8px;
      }
    </style>
  </head>
  
  <body>
    <div id="float-root"></div>
    <script type="module" src="/src/float-window.tsx" defer></script>
  </body>
</html>
```

#### React入口 (src/float-window.tsx)
```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import { FloatWindowApp } from './components/float/FloatWindowApp'

const container = document.getElementById('float-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <FloatWindowApp />
    </React.StrictMode>
  )
}
```

#### 悬浮窗组件 (FloatWindowApp.tsx)

##### 核心功能
1. **拖拽移动** - 鼠标拖拽改变窗口位置
2. **位置记忆** - 自动保存和恢复窗口位置
3. **最小化** - 支持收缩到小型状态
4. **计时控制** - 开始/暂停/停止计时器
5. **状态显示** - 实时显示计时状态和进度

##### 状态管理
```typescript
const [isMinimized, setIsMinimized] = useState(false)        // 最小化状态
const [position, setPosition] = useState<Position>({ x: 100, y: 100 })  // 窗口位置
const [isDragging, setIsDragging] = useState(false)          // 拖拽状态
const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })  // 拖拽偏移
```

##### 拖拽实现
```typescript
// 开始拖拽
const handleMouseDown = (e: React.MouseEvent) => {
  if ((e.target as HTMLElement).closest('button')) return  // 按钮不触发拖拽
  
  e.preventDefault()
  setIsDragging(true)
  
  const rect = e.currentTarget.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top
  setDragOffset({ x: offsetX, y: offsetY })
  
  document.body.style.cursor = 'grabbing'
  document.body.style.userSelect = 'none'
}

// 拖拽中
const handleMouseMove = useCallback((e: MouseEvent) => {
  if (!isDragging) return
  
  const newX = e.clientX - dragOffset.x
  const newY = e.clientY - dragOffset.y
  
  savePosition({ x: newX, y: newY })
}, [isDragging, dragOffset, savePosition])

// 结束拖拽
const handleMouseUp = useCallback(() => {
  if (isDragging) {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
}, [isDragging])
```

##### 位置持久化
```typescript
// 加载保存的位置
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
```

### 命令接口

后端提供的悬浮窗相关命令：

```rust
// 窗口控制
pub async fn toggle_float_window(app: tauri::AppHandle) -> Result<(), String>
pub async fn show_float_window(app: tauri::AppHandle) -> Result<(), String>
pub async fn hide_float_window(app: tauri::AppHandle) -> Result<(), String>

// 位置管理
pub async fn set_float_window_position(app: tauri::AppHandle, x: f64, y: f64) -> Result<(), String>
pub async fn get_float_window_position(app: tauri::AppHandle) -> Result<Option<(f64, f64)>, String>

// 状态查询
pub async fn is_float_window_visible(app: tauri::AppHandle) -> Result<bool, String>
```

### 开发指南

#### 添加新的悬浮窗功能

1. **后端命令** - 在 `window.rs` 中添加新方法
2. **命令注册** - 在 `commands/mod.rs` 中添加命令处理器
3. **API接口** - 在前端 `services/api.ts` 中添加调用方法
4. **UI组件** - 在 `FloatWindowApp.tsx` 中实现相应功能

#### 调试悬浮窗

```bash
# 开发模式启动
npm run tauri dev

# 查看悬浮窗
# 在主界面中点击悬浮窗按钮或使用快捷键
```

#### 常见问题

1. **窗口不显示** - 检查 `create_float_window` 是否正确执行
2. **拖拽失效** - 检查鼠标事件监听器是否正确注册
3. **位置丢失** - 确保 `set_float_window_position` 正确保存位置
4. **透明背景** - 检查 CSS 中的 `background: transparent` 设置

### 优化建议

1. **圆形窗口** - 使用 CSS `border-radius: 50%` 实现圆形悬浮窗
2. **动画效果** - 添加窗口显示/隐藏的过渡动画
3. **快捷键** - 实现全局快捷键控制悬浮窗
4. **主题切换** - 支持深色/浅色主题切换
5. **多显示器** - 优化多显示器环境下的位置管理

### 已实现功能

- ✅ 独立悬浮窗创建和管理
- ✅ 拖拽移动功能
- ✅ 位置记忆和恢复
- ✅ 最小化/展开切换
- ✅ 计时器控制
- ✅ 实时状态显示
- ✅ 模式指示（探索/利用）
- ✅ 进度条显示
- ✅ 透明背景和边框

## 系统托盘系统详解

汐律的系统托盘提供了便捷的后台操作入口，让用户可以在不打开主窗口的情况下快速访问应用功能。

### 架构设计

系统托盘是桌面应用的重要组成部分，提供以下功能：

- **后台运行** - 应用最小化到系统托盘继续运行
- **快速访问** - 通过托盘菜单快速操作窗口
- **状态指示** - 显示应用当前运行状态
- **交互控制** - 支持点击、双击等鼠标操作

### 后端实现 (services/tray.rs)

#### 托盘创建函数
```rust
pub fn create_tray(app: &tauri::AppHandle) -> Result<tauri::tray::TrayIcon, Box<dyn std::error::Error>> {
    // 创建菜单项
    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "隐藏主窗口", true, None::<&str>)?;
    let float = MenuItem::with_id(app, "float", "显示悬浮窗", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    
    // 创建菜单
    let menu = Menu::with_items(app, &[&show, &hide, &float, &quit])?;
    
    // 创建系统托盘
    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .menu_on_left_click(true)
        .on_menu_event(|app, event| {
            // 菜单事件处理
        })
        .on_tray_icon_event(|tray, event| {
            // 托盘图标事件处理
        })
        .build(app)?;
    
    Ok(tray)
}
```

#### 菜单项配置

系统托盘包含四个主要菜单项：

1. **显示主窗口** - 显示应用主界面
2. **隐藏主窗口** - 隐藏应用主界面
3. **显示悬浮窗** - 切换悬浮窗显示状态
4. **退出** - 完全退出应用

#### 事件处理系统

##### 菜单事件处理
```rust
.on_menu_event(|app, event| {
    match event.id.as_ref() {
        "show" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "hide" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.hide();
            }
        }
        "float" => {
            if let Some(window) = app.get_webview_window("float") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
        "quit" => {
            app.exit(0);
        }
        _ => {
            println!("未处理的菜单项: {:?}", event.id);
        }
    }
})
```

##### 托盘图标事件处理
```rust
.on_tray_icon_event(|tray, event| {
    match event {
        TrayIconEvent::Click {
            button: MouseButton::Left,
            button_state: MouseButtonState::Up,
            ..
        } => {
            // 左键点击切换主窗口显示/隐藏
            let app = tray.app_handle();
            if let Some(window) = app.get_webview_window("main") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
        TrayIconEvent::DoubleClick {
            button: MouseButton::Left,
            ..
        } => {
            // 双击显示悬浮窗
            let app = tray.app_handle();
            if let Some(window) = app.get_webview_window("float") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
        _ => {
            // 其他事件（右键、悬停等）由系统默认处理
        }
    }
})
```

### 关键配置参数

#### TrayIconBuilder 配置
- **icon()** - 托盘图标，使用应用默认图标
- **menu()** - 关联的右键菜单
- **menu_on_left_click(true)** - 左键点击显示菜单
- **on_menu_event()** - 菜单项点击事件处理器
- **on_tray_icon_event()** - 托盘图标事件处理器

#### 交互行为设计
- **左键单击** - 切换主窗口显示/隐藏
- **左键双击** - 切换悬浮窗显示/隐藏
- **右键单击** - 显示上下文菜单
- **菜单项** - 提供明确的操作选项

### 集成到应用

#### 在 lib.rs 中初始化
```rust
// 在 setup 函数中添加系统托盘初始化
.setup(|app| {
    // 初始化数据库
    if let Err(e) = database::init_database() {
        eprintln!("Failed to initialize database: {}", e);
    }
    
    // 创建系统托盘
    if let Err(e) = services::create_tray(app) {
        eprintln!("Failed to create system tray: {}", e);
    }
    
    // 开发模式下自动打开 DevTools
    #[cfg(debug_assertions)]
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.open_devtools();
    }
    
    Ok(())
})
```

#### 依赖导入
确保在 `Cargo.toml` 中包含必要的依赖：
```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "image-ico", "image-png"] }
```

### 开发指南

#### 添加新的托盘菜单项

1. **创建菜单项**：
```rust
let new_item = MenuItem::with_id(app, "new_item", "新功能", true, None::<&str>)?;
```

2. **添加到菜单**：
```rust
let menu = Menu::with_items(app, &[&show, &hide, &float, &new_item, &quit])?;
```

3. **处理事件**：
```rust
.on_menu_event(|app, event| {
    match event.id.as_ref() {
        // 现有处理...
        "new_item" => {
            // 新功能处理逻辑
        }
        _ => {}
    }
})
```

#### 动态更新菜单

```rust
// 更新菜单项文本
tray.get_item_by_id("show").set_text("显示窗口")?;

// 启用/禁用菜单项
tray.get_item_by_id("float").set_enabled(false)?;

// 设置菜单项选中状态
tray.get_item_by_id("auto_start").set_selected(true)?;
```

#### 托盘图标状态

```rust
// 更改托盘图标
tray.set_icon(Some(&new_icon))?;

// 设置托盘提示文本
tray.set_tooltip(Some("汐律 - 运行中"))?;

// 显示/隐藏托盘图标
tray.set_visible(true)?;
```

### 调试技巧

#### 常见问题

1. **托盘不显示**
   - 检查 `tray-icon` feature 是否启用
   - 确认图标文件路径正确
   - 验证 `create_tray` 函数被正确调用

2. **菜单无响应**
   - 检查事件处理器是否正确注册
   - 确认菜单项ID匹配
   - 查看控制台错误信息

3. **窗口操作失败**
   - 确认窗口名称正确
   - 检查窗口是否存在
   - 处理可能的错误情况

#### 调试输出
```rust
// 在事件处理器中添加调试信息
.on_menu_event(|app, event| {
    println!("菜单事件: ID = {:?}", event.id);
    match event.id.as_ref() {
        // 处理逻辑...
    }
})
```

### 优化建议

1. **动态菜单** - 根据应用状态动态调整菜单项
2. **状态指示** - 使用不同图标表示不同状态
3. **快捷键支持** - 添加全局快捷键操作
4. **通知集成** - 结合系统通知功能
5. **多语言** - 支持菜单项多语言显示

### 已实现功能

- ✅ 系统托盘创建和管理
- ✅ 右键上下文菜单
- ✅ 左键单击切换主窗口
- ✅ 左键双击切换悬浮窗
- ✅ 菜单项事件处理
- ✅ 应用退出控制
- ✅ 窗口状态管理

### 扩展功能建议

1. **计时状态显示** - 在托盘图标上显示计时状态
2. **快捷菜单** - 添加常用操作的快捷方式
3. **设置集成** - 快速访问应用设置
4. **统计信息** - 显示今日使用统计
5. **主题切换** - 快速切换应用主题

## 下一步开发建议

1. **系统托盘**：实现托盘图标和菜单
2. **通知系统**：计时完成通知
3. **数据备份**：自动备份功能
4. **导入导出**：多格式数据导入导出
5. **设置界面**：用户偏好设置
6. **主题系统**：支持自定义主题

## 调试和测试

### 常用调试命令
```bash
# 查看数据库
sqlite3 src-tauri/xily.db

# 开发模式
npm run tauri dev

# 日志查看
# 在 DevTools Console 中查看前端日志
# 在终端查看后端日志
```

### 测试数据
- 示例作品数据
- 计时器配置数据
- 时间记录数据