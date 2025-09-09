# 汐律项目后端开发总结

## 项目概述

汐律是一个基于 Tauri 2.x 的桌面端智能时间管理工具，采用 Rust 后端 + TypeScript 前端的架构。产品核心是通过潮汐节律理念，帮助用户建立健康的学习创作节奏。

## 技术栈

- **后端**: Rust + Tauri 2.x
- **数据库**: SQLite
- **前端**: TypeScript + Vite
- **数据序列化**: Serde + Serde JSON
- **时间处理**: Chrono
- **异步处理**: Tokio

## 项目结构

```
src-tauri/
├── src/
│   ├── main.rs              # 应用入口
│   ├── lib.rs               # Tauri 命令定义和主运行函数
│   ├── database/            # 数据库模块
│   │   └── mod.rs           # 数据库连接和初始化
│   ├── models/              # 数据模型
│   │   └── mod.rs           # 核心数据结构定义
│   ├── services/            # 业务逻辑
│   │   ├── mod.rs           # 服务模块导出
│   │   ├── works.rs         # 作品管理服务
│   │   ├── timer.rs         # 计时器服务
│   │   ├── analytics.rs     # 数据分析服务
│   │   ├── window.rs        # 窗口管理服务
│   │   └── tray.rs          # 系统托盘服务
│   └── utils/               # 工具函数
│       └── mod.rs           # 通用工具函数
├── Cargo.toml               # 项目依赖配置
└── tauri.conf.json          # Tauri 配置文件
```

## 核心功能实现

### 1. 数据库模块 (database/mod.rs)

**功能特性：**
- SQLite 数据库连接管理
- 自动创建和初始化数据表
- 线程安全的连接池

**数据表设计：**
```sql
-- 作品表
CREATE TABLE works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    target_hours INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE
);

-- 时间记录表
CREATE TABLE time_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER,
    mode TEXT NOT NULL, -- 'explore' or 'utilize'
    duration INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (work_id) REFERENCES works(id)
);

-- 用户设置表
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 系统状态表
CREATE TABLE system_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 数据模型 (models/mod.rs)

**核心数据结构：**

```rust
// 作品结构
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

// 计时器会话
pub struct TimerSession {
    pub id: Option<i64>,
    pub work_id: i64,
    pub mode: String,
    pub start_time: DateTime<Utc>,
    pub is_active: bool,
    pub duration: i32,
}

// 计时器配置
pub struct TimerConfig {
    pub focus_duration: i32,     // 专注时长
    pub short_break: i32,        // 短休息时长
    pub long_break: i32,         // 长休息时长
    pub auto_start_breaks: bool, // 自动开始休息
    pub auto_start_pomodoros: bool, // 自动开始番茄钟
}
```

### 3. 作品管理服务 (services/works.rs)

**主要功能：**
- ✅ 创建新作品
- ✅ 获取作品列表
- ✅ 更新作品信息
- ✅ 删除作品
- ✅ 归档/取消归档作品
- ✅ 根据ID获取作品

**关键方法：**
```rust
impl WorksService {
    pub fn create_work(work: &Work) -> Result<i64>
    pub fn get_all_works() -> Result<Vec<Work>>
    pub fn update_work(work: &Work) -> Result<()>
    pub fn delete_work(id: i64) -> Result<()>
    pub fn archive_work(id: i64) -> Result<()>
    pub fn unarchive_work(id: i64) -> Result<()>
}
```

### 4. 计时器服务 (services/timer.rs)

**主要功能：**
- ✅ 开始计时器会话
- ✅ 停止计时器并保存记录
- ✅ 暂停/恢复计时器
- ✅ 获取当前会话状态
- ✅ 管理计时器配置
- ✅ 获取历史会话记录

**核心特性：**
- 支持探索模式（explore）和利用模式（utilize）
- 内存中的当前会话管理
- 自动计算实际持续时间
- 配置持久化存储

### 5. 数据分析服务 (services/analytics.rs)

**主要功能：**
- ✅ 工作时间分布统计
- ✅ 模式分布分析（探索vs利用）
- ✅ 每日统计数据
- ✅ 工作进度跟踪
- ✅ 生产力趋势分析
- ✅ 数据导出功能

**统计数据结构：**
```rust
pub struct WorkTimeStats {
    pub work_id: i64,
    pub work_name: String,
    pub total_time: i32,
    pub session_count: i32,
    pub avg_duration: f64,
}

pub struct ModeStats {
    pub explore_time: i32,
    pub utilize_time: i32,
    pub balance_ratio: f64,
    pub total_time: i32,
}
```

### 6. 窗口管理服务 (services/window.rs)

**主要功能：**
- ✅ 主窗口显示/隐藏
- ✅ 悬浮窗创建和管理
- ✅ 窗口位置控制
- ✅ 窗口状态查询
- ✅ 窗口属性设置

**悬浮窗特性：**
- 透明背景支持
- 始终置顶
- 可拖拽和位置记忆
- 跳过任务栏显示

### 7. 系统托盘服务 (services/tray.rs)

**主要功能：**
- ✅ 系统托盘菜单创建
- ✅ 托盘事件处理
- ✅ 菜单项动态更新
- ✅ 工具提示设置

**托盘菜单：**
- 显示/隐藏主窗口
- 显示/隐藏悬浮窗
- 退出应用

### 8. 工具函数模块 (utils/mod.rs)

**主要工具模块：**
- **time_utils**: 时间格式化、时间差计算
- **validation_utils**: 数据验证（作品名称、颜色、时长等）
- **string_utils**: 字符串处理、ID生成
- **file_utils**: 文件操作、目录管理
- **math_utils**: 数学计算、百分比计算
- **json_utils**: JSON数据处理
- **logging_utils**: 日志记录
- **config_utils**: 配置管理

## Tauri 命令接口 (lib.rs)

### 作品管理命令
```rust
create_work(name, description, color, target_hours) -> Result<i64>
get_works() -> Result<Vec<Work>>
get_work(id) -> Result<Option<Work>>
update_work(work) -> Result<()>
delete_work(id) -> Result<()>
archive_work(id) -> Result<()>
unarchive_work(id) -> Result<()>
```

### 计时器命令
```rust
start_timer(work_id, mode, duration) -> Result<TimerSession>
stop_timer() -> Result<Option<TimeRecord>>
pause_timer() -> Result<bool>
resume_timer() -> Result<bool>
get_current_session() -> Result<Option<TimerSession>>
get_timer_config() -> Result<TimerConfig>
save_timer_config(config) -> Result<()>
get_timer_sessions(work_id, limit) -> Result<Vec<TimerSession>>
```

### 数据分析命令
```rust
get_work_time_distribution(work_id, start_date, end_date) -> Result<Vec<Value>>
get_mode_distribution(start_date, end_date) -> Result<Value>
get_daily_stats(days) -> Result<Vec<Value>>
get_work_progress(work_id) -> Result<Value>
get_productivity_trends(days) -> Result<Vec<Value>>
export_data(work_id, start_date, end_date) -> Result<Value>
```

### 窗口管理命令
```rust
show_main_window(app) -> Result<()>
hide_main_window(app) -> Result<()>
toggle_float_window(app) -> Result<()>
show_float_window(app) -> Result<()>
hide_float_window(app) -> Result<()>
set_float_window_position(app, x, y) -> Result<()>
get_float_window_position(app) -> Result<Option<(f64, f64)>>
```

## 依赖配置 (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "image-ico", "image-png"] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.29", features = ["chrono"] }
chrono = { version = "0.4", features = ["serde"] }
once_cell = "1"
tokio = { version = "1", features = ["full"] }
uuid = { version = "1", features = ["v4"] }
regex = "1"
```

## 技术亮点

### 1. **架构设计**
- 模块化设计，职责分离清晰
- 服务层抽象，便于测试和维护
- 统一的错误处理机制

### 2. **数据管理**
- SQLite 轻量级数据库
- 数据库连接池管理
- 完整的数据模型定义

### 3. **异步处理**
- 基于 Tokio 的异步编程
- 非阻塞的数据库操作
- 高效的并发处理

### 4. **系统集成**
- Tauri 2.x 原生集成
- 系统托盘支持
- 多窗口管理

### 5. **数据分析**
- 丰富的统计分析功能
- 实时数据计算
- 多维度数据展示

## 开发规范

### 1. **代码风格**
- 遵循 Rust 官方代码风格
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 进行代码检查

### 2. **错误处理**
- 使用 `Result<T, String>` 统一错误处理
- 详细的错误信息返回
- 适当的错误传播

### 3. **异步编程**
- 合理使用 `async/await`
- 避免阻塞操作
- 正确的生命周期管理

### 4. **数据验证**
- 输入参数验证
- 数据完整性检查
- 边界条件处理

## 测试策略

### 1. **单元测试**
- 服务层功能测试
- 数据模型测试
- 工具函数测试

### 2. **集成测试**
- 数据库操作测试
- Tauri 命令测试
- 端到端功能测试

### 3. **性能测试**
- 数据库查询性能
- 大数据处理能力
- 内存使用监控

## 部署和构建

### 1. **开发环境**
```bash
# 开发模式
npm run tauri dev

# 构建应用
npm run tauri build
```

### 2. **生产构建**
- 代码优化和压缩
- 资源文件打包
- 平台特定配置

## 未来扩展

### 1. **功能扩展**
- 云同步功能
- 团队协作支持
- 高级数据分析

### 2. **性能优化**
- 数据库索引优化
- 缓存机制
- 内存使用优化

### 3. **用户体验**
- 更多主题支持
- 快捷键功能
- 通知系统增强

## 总结

本次开发成功实现了汐律项目的完整后端架构，包括：

1. **完整的数据管理**：支持作品、时间记录、用户设置等数据的CRUD操作
2. **智能计时系统**：实现潮汐节律的计时功能，支持多种模式切换
3. **强大的数据分析**：提供多维度的统计分析，帮助用户了解时间使用情况
4. **优秀的用户体验**：通过系统托盘、悬浮窗等提供便捷的操作方式
5. **良好的扩展性**：模块化设计便于后续功能扩展和维护

整个系统采用 Rust 语言开发，确保了高性能和内存安全，同时 Tauri 框架提供了优秀的跨平台能力。这个后端架构为汐律时间管理应用提供了坚实的技术基础。