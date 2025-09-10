mod database;
mod models;
mod services;
mod utils;
mod commands;

use services::{WorksService, TimerService, AnalyticsService};
use services::window::WindowManager;
use models::{Work, TimerSession, TimerConfig, TimeRecord};
use commands::*;

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
