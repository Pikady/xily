mod database;
mod models;
mod services;
mod utils;

use services::{WorksService, TimerService, AnalyticsService};
use services::window::WindowManager;
use models::{Work, TimerSession, TimerConfig, TimeRecord};

// 作品管理命令
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
pub async fn get_work(id: i64) -> Result<Option<Work>, String> {
    WorksService::get_work(id)
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
pub async fn archive_work(id: i64) -> Result<(), String> {
    WorksService::archive_work(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn unarchive_work(id: i64) -> Result<(), String> {
    WorksService::unarchive_work(id)
        .map_err(|e| e.to_string())
}

// 计时器命令
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
pub async fn get_timer_sessions(work_id: Option<i64>, limit: Option<i32>) -> Result<Vec<TimerSession>, String> {
    TimerService::get_timer_sessions(work_id, limit)
        .map_err(|e| e.to_string())
}

// 数据分析命令
#[tauri::command]
pub async fn get_work_time_distribution(work_id: Option<i64>, start_date: Option<String>, end_date: Option<String>) -> Result<Vec<serde_json::Value>, String> {
    let start = start_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    let end = end_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    
    AnalyticsService::get_work_time_distribution(work_id, start, end)
        .map(|stats| stats.into_iter().map(|s| serde_json::to_value(s).unwrap()).collect())
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

#[tauri::command]
pub async fn get_work_progress(work_id: i64) -> Result<serde_json::Value, String> {
    AnalyticsService::get_work_progress(work_id)
        .map(|progress| serde_json::to_value(progress).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_productivity_trends(days: i32) -> Result<Vec<serde_json::Value>, String> {
    AnalyticsService::get_productivity_trends(days)
        .map(|trends| trends.into_iter().map(|t| serde_json::to_value(t).unwrap()).collect())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_data(work_id: Option<i64>, start_date: Option<String>, end_date: Option<String>) -> Result<serde_json::Value, String> {
    let start = start_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    let end = end_date.map(|s| chrono::DateTime::parse_from_rfc3339(&s).unwrap().with_timezone(&chrono::Utc));
    
    AnalyticsService::export_data(work_id, start, end)
        .map(|data| serde_json::to_value(data).unwrap())
        .map_err(|e| e.to_string())
}

// 窗口管理命令
#[tauri::command]
pub async fn show_main_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::show_main_window(&app)
}

#[tauri::command]
pub async fn hide_main_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::hide_main_window(&app)
}

#[tauri::command]
pub async fn toggle_float_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::toggle_float_window(&app)
}

#[tauri::command]
pub async fn show_float_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::show_float_window(&app)
}

#[tauri::command]
pub async fn hide_float_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::hide_float_window(&app)
}

#[tauri::command]
pub async fn minimize_main_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::minimize_main_window(&app)
}

#[tauri::command]
pub async fn maximize_main_window(app: tauri::AppHandle) -> Result<(), String> {
    WindowManager::maximize_main_window(&app)
}

#[tauri::command]
pub async fn set_float_window_position(app: tauri::AppHandle, x: f64, y: f64) -> Result<(), String> {
    WindowManager::set_float_window_position(&app, x, y)
}

#[tauri::command]
pub async fn get_float_window_position(app: tauri::AppHandle) -> Result<Option<(f64, f64)>, String> {
    WindowManager::get_float_window_position(&app)
}

#[tauri::command]
pub async fn is_float_window_visible(app: tauri::AppHandle) -> Result<bool, String> {
    WindowManager::is_float_window_visible(&app)
}

#[tauri::command]
pub async fn is_main_window_visible(app: tauri::AppHandle) -> Result<bool, String> {
    WindowManager::is_main_window_visible(&app)
}

// 系统命令
#[tauri::command]
pub async fn get_app_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
pub async fn get_app_name() -> Result<String, String> {
    Ok(env!("CARGO_PKG_NAME").to_string())
}

#[tauri::command]
pub async fn quit_app(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            // 初始化数据库
            if let Err(e) = database::init_database() {
                eprintln!("Failed to initialize database: {}", e);
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // 作品管理
            create_work,
            get_works,
            get_work,
            update_work,
            delete_work,
            archive_work,
            unarchive_work,
            
            // 计时器
            start_timer,
            stop_timer,
            pause_timer,
            resume_timer,
            get_current_session,
            get_timer_config,
            save_timer_config,
            get_timer_sessions,
            
            // 数据分析
            get_work_time_distribution,
            get_mode_distribution,
            get_daily_stats,
            get_work_progress,
            get_productivity_trends,
            export_data,
            
            // 窗口管理
            show_main_window,
            hide_main_window,
            toggle_float_window,
            show_float_window,
            hide_float_window,
            minimize_main_window,
            maximize_main_window,
            set_float_window_position,
            get_float_window_position,
            is_float_window_visible,
            is_main_window_visible,
            
            // 系统命令
            get_app_version,
            get_app_name,
            quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
