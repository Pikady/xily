# 汐律项目后端开发文档

## 1. 项目概述

### 1.1 项目简介
汐律是一个基于Tauri的桌面端智能时间管理工具，采用Rust后端 + TypeScript前端的架构。产品核心是通过潮汐节律理念，帮助用户建立健康的学习创作节奏。

### 1.2 技术栈
- **后端**: Rust + Tauri 2
- **数据库**: SQLite
- **前端**: TypeScript + Vite
- **数据序列化**: Serde + Serde JSON

### 1.3 项目结构
```
xily/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # 应用入口
│   │   ├── lib.rs           # Tauri命令定义
│   │   ├── database/        # 数据库模块
│   │   ├── models/          # 数据模型
│   │   ├── services/        # 业务逻辑
│   │   └── utils/           # 工具函数
│   └── Cargo.toml
└── src/
    ├── main.ts              # 前端入口
    └── components/          # React组件
```

## 2. 数据库模块设计

### 2.1 数据模型设计

#### 2.1.1 作品表 (works)
```sql
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
```

#### 2.1.2 时间记录表 (time_records)
```sql
CREATE TABLE time_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER,
    mode TEXT NOT NULL, -- 'explore' or 'utilize'
    duration INTEGER NOT NULL, -- minutes
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (work_id) REFERENCES works(id)
);
```

#### 2.1.3 用户设置表 (user_settings)
```sql
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.1.4 系统状态表 (system_state)
```sql
CREATE TABLE system_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 数据库模块实现

#### 2.2.1 数据库连接管理
```rust
// src-tauri/src/database/mod.rs
use rusqlite::{Connection, Result};
use std::sync::Mutex;
use once_cell::sync::Lazy;

static DB_CONN: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

pub fn init_database() -> Result<()> {
    let conn = Connection::open("xily.db")?;
    
    // 创建表
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS works (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            target_hours INTEGER DEFAULT 0,
            is_archived BOOLEAN DEFAULT FALSE
        );
        
        CREATE TABLE IF NOT EXISTS time_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_id INTEGER,
            mode TEXT NOT NULL,
            duration INTEGER NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            is_completed BOOLEAN DEFAULT FALSE,
            notes TEXT,
            FOREIGN KEY (work_id) REFERENCES works(id)
        );
        
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS system_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        "
    )?;
    
    *DB_CONN.lock().unwrap() = Some(conn);
    Ok(())
}

pub fn get_connection() -> Result<Connection> {
    DB_CONN.lock().unwrap().as_ref().cloned()
        .ok_or_else(|| rusqlite::Error::InvalidColumnType(0, "Database not initialized".into(), rusqlite::Type::Null))
}
```

## 3. 数据模型定义

### 3.1 Rust数据结构
```rust
// src-tauri/src/models/mod.rs
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimeRecord {
    pub id: Option<i64>,
    pub work_id: Option<i64>,
    pub mode: String,
    pub duration: i32,
    pub start_time: DateTime<Utc>,
    pub end_time: DateTime<Utc>,
    pub is_completed: bool,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserSetting {
    pub id: Option<i64>,
    pub key: String,
    pub value: String,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TimerSession {
    pub id: Option<i64>,
    pub work_id: i64,
    pub mode: String,
    pub start_time: DateTime<Utc>,
    pub is_active: bool,
    pub duration: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimerConfig {
    pub focus_duration: i32,     // 专注时长（分钟）
    pub short_break: i32,        // 短休息时长（分钟）
    pub long_break: i32,         // 长休息时长（分钟）
    pub auto_start_breaks: bool, // 自动开始休息
    pub auto_start_pomodoros: bool, // 自动开始番茄钟
}

impl Default for TimerConfig {
    fn default() -> Self {
        Self {
            focus_duration: 25,
            short_break: 5,
            long_break: 15,
            auto_start_breaks: true,
            auto_start_pomodoros: true,
        }
    }
}
```

## 4. 业务逻辑层

### 4.1 作品管理服务
```rust
// src-tauri/src/services/works.rs
use crate::models::Work;
use crate::database::get_connection;
use rusqlite::{Result, params};
use chrono::Utc;

pub struct WorksService;

impl WorksService {
    pub fn create_work(work: &Work) -> Result<i64> {
        let conn = get_connection()?;
        conn.execute(
            "INSERT INTO works (name, description, color, target_hours, is_archived) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                work.name,
                work.description,
                work.color,
                work.target_hours,
                work.is_archived
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_work(id: i64) -> Result<Option<Work>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, color, created_at, updated_at, target_hours, is_archived FROM works WHERE id = ?1"
        )?;
        let mut rows = stmt.query(params![id])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Work {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                target_hours: row.get(6)?,
                is_archived: row.get(7)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_all_works() -> Result<Vec<Work>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, color, created_at, updated_at, target_hours, is_archived FROM works WHERE is_archived = FALSE ORDER BY created_at DESC"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(Work {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                target_hours: row.get(6)?,
                is_archived: row.get(7)?,
            })
        })?;
        
        let mut works = Vec::new();
        for work in rows {
            works.push(work?);
        }
        Ok(works)
    }

    pub fn update_work(work: &Work) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE works SET name = ?1, description = ?2, color = ?3, target_hours = ?4, is_archived = ?5, updated_at = CURRENT_TIMESTAMP WHERE id = ?6",
            params![
                work.name,
                work.description,
                work.color,
                work.target_hours,
                work.is_archived,
                work.id
            ],
        )?;
        Ok(())
    }

    pub fn delete_work(id: i64) -> Result<()> {
        let conn = get_connection()?;
        conn.execute("DELETE FROM works WHERE id = ?1", params![id])?;
        conn.execute("DELETE FROM time_records WHERE work_id = ?1", params![id])?;
        Ok(())
    }
}
```

### 4.2 计时器服务
```rust
// src-tauri/src/services/timer.rs
use crate::models::{TimerSession, TimeRecord, TimerConfig};
use crate::database::get_connection;
use rusqlite::{Result, params};
use chrono::{Utc, Duration};
use std::sync::Mutex;
use once_cell::sync::Lazy;

static CURRENT_SESSION: Lazy<Mutex<Option<TimerSession>>> = Lazy::new(|| Mutex::new(None));

pub struct TimerService;

impl TimerService {
    pub fn start_timer(work_id: i64, mode: String, duration: i32) -> Result<TimerSession> {
        let session = TimerSession {
            id: None,
            work_id,
            mode,
            start_time: Utc::now(),
            is_active: true,
            duration,
        };
        
        // 保存当前会话
        *CURRENT_SESSION.lock().unwrap() = Some(session.clone());
        
        // 记录到数据库
        let conn = get_connection()?;
        conn.execute(
            "INSERT INTO timer_sessions (work_id, mode, start_time, is_active, duration) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                session.work_id,
                session.mode,
                session.start_time,
                session.is_active,
                session.duration
            ],
        )?;
        
        Ok(session)
    }

    pub fn stop_timer() -> Result<Option<TimeRecord>> {
        let mut current_session = CURRENT_SESSION.lock().unwrap();
        if let Some(session) = current_session.take() {
            let end_time = Utc::now();
            let actual_duration = (end_time - session.start_time).num_minutes() as i32;
            
            let record = TimeRecord {
                id: None,
                work_id: Some(session.work_id),
                mode: session.mode,
                duration: actual_duration,
                start_time: session.start_time,
                end_time,
                is_completed: actual_duration >= session.duration,
                notes: None,
            };
            
            // 保存时间记录
            let conn = get_connection()?;
            conn.execute(
                "INSERT INTO time_records (work_id, mode, duration, start_time, end_time, is_completed) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    record.work_id,
                    record.mode,
                    record.duration,
                    record.start_time,
                    record.end_time,
                    record.is_completed
                ],
            )?;
            
            Ok(Some(record))
        } else {
            Ok(None)
        }
    }

    pub fn get_current_session() -> Result<Option<TimerSession>> {
        Ok(CURRENT_SESSION.lock().unwrap().clone())
    }

    pub fn get_timer_config() -> Result<TimerConfig> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT value FROM user_settings WHERE key = 'timer_config'"
        )?;
        let mut rows = stmt.query([])?;
        
        if let Some(row) = rows.next()? {
            let config_str: String = row.get(0)?;
            Ok(serde_json::from_str(&config_str).unwrap_or_default())
        } else {
            Ok(TimerConfig::default())
        }
    }

    pub fn save_timer_config(config: &TimerConfig) -> Result<()> {
        let conn = get_connection()?;
        let config_str = serde_json::to_string(config)?;
        
        conn.execute(
            "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('timer_config', ?1)",
            params![config_str],
        )?;
        Ok(())
    }
}
```

### 4.3 数据分析服务
```rust
// src-tauri/src/services/analytics.rs
use crate::models::{TimeRecord, Work};
use crate::database::get_connection;
use rusqlite::{Result, params};
use chrono::{DateTime, Utc, Duration};

pub struct AnalyticsService;

impl AnalyticsService {
    pub fn get_work_time_distribution(work_id: Option<i64>, start_date: Option<DateTime<Utc>>, end_date: Option<DateTime<Utc>>) -> Result<Vec<WorkTimeStats>> {
        let conn = get_connection()?;
        let mut query = "
            SELECT w.id, w.name, w.color, SUM(tr.duration) as total_time, 
                   COUNT(tr.id) as session_count, 
                   AVG(tr.duration) as avg_duration
            FROM works w
            LEFT JOIN time_records tr ON w.id = tr.work_id
            WHERE 1=1
        ".to_string();
        
        let mut params_vec = Vec::new();
        
        if let Some(id) = work_id {
            query.push_str(" AND w.id = ?1");
            params_vec.push(id.to_string());
        }
        
        if let Some(start) = start_date {
            query.push_str(" AND tr.start_time >= ?").push_str(&(params_vec.len() + 1).to_string());
            params_vec.push(start.to_rfc3339());
        }
        
        if let Some(end) = end_date {
            query.push_str(" AND tr.end_time <= ?").push_str(&(params_vec.len() + 1).to_string());
            params_vec.push(end.to_rfc3339());
        }
        
        query.push_str(" GROUP BY w.id, w.name, w.color ORDER BY total_time DESC");
        
        let mut stmt = conn.prepare(&query)?;
        let rows = stmt.query_map(rusqlite::params_from_iter(params_vec), |row| {
            Ok(WorkTimeStats {
                work_id: row.get(0)?,
                work_name: row.get(1)?,
                work_color: row.get(2)?,
                total_time: row.get(3)?,
                session_count: row.get(4)?,
                avg_duration: row.get(5)?,
            })
        })?;
        
        let mut stats = Vec::new();
        for stat in rows {
            stats.push(stat?);
        }
        Ok(stats)
    }

    pub fn get_mode_distribution(start_date: Option<DateTime<Utc>>, end_date: Option<DateTime<Utc>>) -> Result<ModeStats> {
        let conn = get_connection()?;
        let mut query = "
            SELECT mode, SUM(duration) as total_time, COUNT(*) as session_count
            FROM time_records
            WHERE 1=1
        ".to_string();
        
        let mut params_vec = Vec::new();
        
        if let Some(start) = start_date {
            query.push_str(" AND start_time >= ?1");
            params_vec.push(start.to_rfc3339());
        }
        
        if let Some(end) = end_date {
            query.push_str(" AND end_time <= ?").push_str(&(params_vec.len() + 1).to_string());
            params_vec.push(end.to_rfc3339());
        }
        
        query.push_str(" GROUP BY mode");
        
        let mut stmt = conn.prepare(&query)?;
        let mut explore_time = 0;
        let mut utilize_time = 0;
        let mut explore_sessions = 0;
        let mut utilize_sessions = 0;
        
        let rows = stmt.query_map(rusqlite::params_from_iter(params_vec), |row| {
            let mode: String = row.get(0)?;
            let total_time: i32 = row.get(1)?;
            let session_count: i32 = row.get(2)?;
            
            if mode == "explore" {
                explore_time = total_time;
                explore_sessions = session_count;
            } else if mode == "utilize" {
                utilize_time = total_time;
                utilize_sessions = session_count;
            }
            
            Ok(())
        })?;
        
        for _ in rows {
            // 消费迭代器
        }
        
        Ok(ModeStats {
            explore_time,
            utilize_time,
            explore_sessions,
            utilize_sessions,
            total_time: explore_time + utilize_time,
            balance_ratio: if utilize_time > 0 { explore_time as f64 / utilize_time as f64 } else { 0.0 },
        })
    }

    pub fn get_daily_stats(days: i32) -> Result<Vec<DailyStats>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT 
                DATE(start_time) as date,
                SUM(duration) as total_time,
                COUNT(*) as session_count,
                SUM(CASE WHEN mode = 'explore' THEN duration ELSE 0 END) as explore_time,
                SUM(CASE WHEN mode = 'utilize' THEN duration ELSE 0 END) as utilize_time
             FROM time_records
             WHERE start_time >= date('now', '-{} days')
             GROUP BY DATE(start_time)
             ORDER BY date DESC",
        )?;
        
        let rows = stmt.query_map([], |row| {
            Ok(DailyStats {
                date: row.get(0)?,
                total_time: row.get(1)?,
                session_count: row.get(2)?,
                explore_time: row.get(3)?,
                utilize_time: row.get(4)?,
            })
        })?;
        
        let mut stats = Vec::new();
        for stat in rows {
            stats.push(stat?);
        }
        Ok(stats)
    }
}

#[derive(Debug, serde::Serialize)]
pub struct WorkTimeStats {
    pub work_id: i64,
    pub work_name: String,
    pub work_color: Option<String>,
    pub total_time: i32,
    pub session_count: i32,
    pub avg_duration: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct ModeStats {
    pub explore_time: i32,
    pub utilize_time: i32,
    pub explore_sessions: i32,
    pub utilize_sessions: i32,
    pub total_time: i32,
    pub balance_ratio: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct DailyStats {
    pub date: String,
    pub total_time: i32,
    pub session_count: i32,
    pub explore_time: i32,
    pub utilize_time: i32,
}
```

## 5. Tauri命令API

### 5.1 主要命令接口
```rust
// src-tauri/src/lib.rs
mod database;
mod models;
mod services;
mod utils;

use services::{WorksService, TimerService, AnalyticsService};
use models::{Work, TimerSession, TimerConfig, TimeRecord};
use tauri::State;

#[tauri::command]
pub async fn create_work(name: String, description: Option<String>, color: Option<String>, target_hours: i32) -> Result<i64, String> {
    let work = Work {
        id: None,
        name,
        description,
        color,
        created_at: None,
        updated_at: None,
        target_hours,
        is_archived: false,
    };
    
    WorksService::create_work(&work)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_works() -> Result<Vec<Work>, String> {
    WorksService::get_all_works()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_work(work: Work) -> Result<(), String> {
    WorksService::update_work(&work)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_work(id: i64) -> Result<(), String> {
    WorksService::delete_work(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn start_timer(work_id: i64, mode: String, duration: i32) -> Result<TimerSession, String> {
    TimerService::start_timer(work_id, mode, duration)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_timer() -> Result<Option<TimeRecord>, String> {
    TimerService::stop_timer()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_current_session() -> Result<Option<TimerSession>, String> {
    TimerService::get_current_session()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_timer_config() -> Result<TimerConfig, String> {
    TimerService::get_timer_config()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_timer_config(config: TimerConfig) -> Result<(), String> {
    TimerService::save_timer_config(&config)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_work_time_distribution(work_id: Option<i64>, start_date: Option<String>, end_date: Option<String>) -> Result<Vec<serde_json::Value>, String> {
    let start = start_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    let end = end_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    
    AnalyticsService::get_work_time_distribution(work_id, start, end)
        .map(|stats| serde_json::to_value(stats).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_mode_distribution(start_date: Option<String>, end_date: Option<String>) -> Result<serde_json::Value, String> {
    let start = start_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    let end = end_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    
    AnalyticsService::get_mode_distribution(start, end)
        .map(|stats| serde_json::to_value(stats).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_daily_stats(days: i32) -> Result<Vec<serde_json::Value>, String> {
    AnalyticsService::get_daily_stats(days)
        .map(|stats| stats.into_iter().map(|s| serde_json::to_value(s).unwrap()).collect())
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 初始化数据库
            if let Err(e) = database::init_database() {
                eprintln!("Failed to initialize database: {}", e);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_work,
            get_works,
            update_work,
            delete_work,
            start_timer,
            stop_timer,
            get_current_session,
            get_timer_config,
            save_timer_config,
            get_work_time_distribution,
            get_mode_distribution,
            get_daily_stats,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 6. 系统集成功能

### 6.1 窗口管理
```rust
// src-tauri/src/services/window.rs
use tauri::{Manager, Window};

pub struct WindowManager;

impl WindowManager {
    pub fn show_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_window("main") {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn hide_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_window("main") {
            window.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn create_float_window(app: &tauri::AppHandle) -> Result<Window, String> {
        tauri::WindowBuilder::new(app, "float", tauri::WindowUrl::App("float.html".parse().unwrap()))
            .title("汐律悬浮窗")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible_on_all_workspaces(true)
            .build()
            .map_err(|e| e.to_string())
    }

    pub fn toggle_float_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_window("float") {
            if window.is_visible().unwrap_or(false) {
                window.hide().map_err(|e| e.to_string())?;
            } else {
                window.show().map_err(|e| e.to_string())?;
                window.set_focus().map_err(|e| e.to_string())?;
            }
        } else {
            Self::create_float_window(app)?;
        }
        Ok(())
    }
}
```

### 6.2 系统托盘
```rust
// src-tauri/src/services/tray.rs
use tauri::{Manager, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

pub fn create_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "显示主窗口");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏主窗口");
    let float = CustomMenuItem::new("float".to_string(), "显示悬浮窗");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(float)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    SystemTray::new().with_menu(tray_menu)
}

pub fn handle_tray_event(app: &tauri::AppHandle, event: tauri::SystemTrayEvent) {
    match event {
        tauri::SystemTrayEvent::LeftClick {
            position: _,
            size: _,
            ..
        } => {
            if let Some(window) = app.get_window("main") {
                if window.is_visible().unwrap_or(false) {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
        }
        tauri::SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "show" => {
                    if let Some(window) = app.get_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_window("main") {
                        window.hide().unwrap();
                    }
                }
                "float" => {
                    if let Some(window) = app.get_window("float") {
                        if window.is_visible().unwrap_or(false) {
                            window.hide().unwrap();
                        } else {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}
```

## 7. 依赖配置

### 7.1 Cargo.toml更新
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
```

## 8. 开发流程

### 8.1 开发步骤
1. **数据库模块**：实现数据库连接和基础操作
2. **数据模型**：定义所有数据结构和序列化
3. **业务服务**：实现核心业务逻辑
4. **API接口**：创建Tauri命令接口
5. **系统集成**：实现窗口管理和系统托盘
6. **测试验证**：编写单元测试和集成测试

### 8.2 构建和运行
```bash
# 开发模式
npm run tauri dev

# 构建应用
npm run tauri build

# 运行测试
cargo test
```

## 9. 性能优化

### 9.1 数据库优化
- 使用索引优化查询性能
- 实现数据分页查询
- 定期清理过期数据

### 9.2 内存管理
- 使用Rc/Arc管理共享状态
- 避免内存泄漏
- 实现资源池化

### 9.3 异步处理
- 使用tokio实现异步操作
- 避免阻塞主线程
- 实现任务队列

这个开发文档提供了完整的后端实现方案，包括数据库设计、业务逻辑、API接口和系统集成。通过这个方案，可以实现汐律项目的所有核心功能。