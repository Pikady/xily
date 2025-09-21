mod database;
mod models;
mod services;
mod utils;
mod commands;

use services::{WorksService, TimerService, AnalyticsService};
use services::window::WindowManager;
use services::tray::create_tray;
use services::get_tray_manager;
use models::{Work, TimerSession, TimerConfig, TimeRecord};
use commands::*;
use commands::ai_work::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 初始化数据库
            if let Err(e) = database::init_database() {
                eprintln!("Failed to initialize database: {}", e);
            }
            
            // 初始化系统托盘
            let tray_manager = get_tray_manager();
            match create_tray(app.handle()) {
                Ok(tray) => {
                    tray_manager.set_tray_icon(tray);
                    println!("系统托盘初始化成功");
                }
                Err(e) => {
                    eprintln!("Failed to create system tray: {}", e);
                }
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // AI工作创建
            start_ai_session,
            send_ai_message,
            extract_work_information,
            generate_motivation_strategies,
            create_work_from_ai,

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
            get_timer_config,
            save_timer_config,
            get_timer_sessions,

            // 数据分析
            get_work_time_distribution,
            get_mode_distribution,
            get_daily_stats,
            get_work_progress,
            get_work_stats,
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
            show_notification,

            // 系统托盘
            show_tray,
            hide_tray,
            set_tray_icon,
            set_tray_tooltip,
            update_tray_menu,
            set_tray_context_menu,
            show_tray_notification,
            is_tray_visible,
            get_tray_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
