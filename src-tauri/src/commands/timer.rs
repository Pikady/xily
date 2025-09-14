// 计时器命令实现
use crate::services::timer::TimerService;
use crate::models::{TimerSession, TimerConfig, TimeRecord};
use serde::{Deserialize, Serialize};


#[derive(Debug, Serialize, Deserialize)]
pub struct GetTimerSessionsArgs {
    pub work_id: Option<i64>,
    pub limit: Option<i32>,
}

#[tauri::command]
pub async fn start_timer(work_id: Option<i64>, mode: String, duration: i32) -> Result<TimerSession, String> {
    TimerService::start_timer(work_id, mode, duration)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pause_timer(session_id: Option<i64>) -> Result<bool, String> {
    TimerService::pause_timer(session_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resume_timer(session_id: Option<i64>) -> Result<bool, String> {
    TimerService::resume_timer(session_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn stop_timer(sessionId: i64, workId: i64, mode: String, duration: i32) -> Result<Option<TimeRecord>, String> {
    println!("🎯 stop_timer called with parameters: sessionId={}, workId={}, mode={}, duration={}", sessionId, workId, mode, duration);

    TimerService::stop_timer(Some(sessionId), Some(workId), Some(mode), Some(duration))
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