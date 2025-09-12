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

// 统计数据结构
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

// 托盘相关数据模型
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct TrayMenuItem {
    pub id: String,
    pub text: String,
    pub enabled: bool,
    pub checked: Option<bool>,
    pub separator: Option<bool>,
    pub icon: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct TrayStateResponse {
    pub is_visible: bool,
    pub main_window_visible: bool,
    pub float_window_visible: bool,
    pub timer_status: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct TrayPosition {
    pub x: f64,
    pub y: f64,
}