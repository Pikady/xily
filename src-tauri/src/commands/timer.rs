// 计时器命令实现
use tauri::Manager;
use crate::services::timer::TimerService;
use crate::models::{TimerSession, TimerConfig, TimeRecord};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct StartTimerArgs {
    pub work_id: Option<i64>,
    pub mode: String,
    pub duration: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetTimerSessionsArgs {
    pub work_id: Option<i64>,
    pub limit: Option<i32>,
}

#[tauri::command]
pub async fn start_timer(args: StartTimerArgs) -> Result<TimerSession, String> {
    TimerService::start_timer(args.work_id, args.mode, args.duration)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pause_timer() -> Result<bool, String> {
    TimerService::pause_timer()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resume_timer() -> Result<bool, String> {
    TimerService::resume_timer()
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
pub async fn get_timer_sessions(args: GetTimerSessionsArgs) -> Result<Vec<TimerSession>, String> {
    TimerService::get_timer_sessions(args.work_id, args.limit)
        .map_err(|e| e.to_string())
}