use tauri::{Manager, State};
use crate::services::get_tray_manager;

// 显示系统托盘
#[tauri::command]
pub async fn show_tray(app: tauri::AppHandle) -> Result<(), String> {
    let tray_manager = get_tray_manager();
    
    if tray_manager.get_tray_icon().is_none() {
        // 创建新的托盘图标
        match crate::services::create_tray(&app) {
            Ok(tray) => {
                tray_manager.set_tray_icon(tray);
                println!("系统托盘已创建");
            }
            Err(e) => {
                return Err(format!("创建系统托盘失败: {}", e));
            }
        }
    }
    
    Ok(())
}

// 隐藏系统托盘
#[tauri::command]
pub async fn hide_tray(app: tauri::AppHandle) -> Result<(), String> {
    let tray_manager = get_tray_manager();
    tray_manager.remove_tray();
    println!("系统托盘已隐藏");
    Ok(())
}

// 设置托盘图标
#[tauri::command]
pub async fn set_tray_icon(app: tauri::AppHandle, icon_path: String) -> Result<(), String> {
    // 更新托盘图标
    println!("设置托盘图标: {}", icon_path);
    // 在实际实现中，这里需要加载并设置新的图标
    Ok(())
}

// 设置托盘提示文本
#[tauri::command]
pub async fn set_tray_tooltip(app: tauri::AppHandle, tooltip: String) -> Result<(), String> {
    let tray_manager = get_tray_manager();
    // 判重：若内容相同则直接返回
    if tray_manager.get_tooltip() == tooltip {
        return Ok(());
    }
    tray_manager.set_tooltip(tooltip.clone());
    
    // 如果托盘图标存在，更新其提示
    if let Some(tray) = tray_manager.get_tray_icon() {
        if let Err(e) = tray.set_tooltip(Some(&tooltip)) {
            return Err(format!("设置托盘提示失败: {}", e));
        }
    }
    
    println!("设置托盘提示: {}", tooltip);
    Ok(())
}

// 更新托盘菜单
#[tauri::command]
pub async fn update_tray_menu(
    app: tauri::AppHandle,
    show_item: bool,
    hide_item: bool,
    float_item: bool,
    quit_item: bool,
    timer_status: String,
) -> Result<(), String> {
    // 简单日志去重：仅当状态变化时打印
    use std::sync::OnceLock;
    static LAST_STATUS: OnceLock<std::sync::Mutex<String>> = OnceLock::new();
    let last_status_mutex = LAST_STATUS.get_or_init(|| std::sync::Mutex::new(String::new()));
    let mut last_status = last_status_mutex.lock().map_err(|_| "状态锁获取失败".to_string())?;
    if *last_status != timer_status {
        println!("更新托盘菜单: timer_status = {}", timer_status);
        *last_status = timer_status.clone();
    }
    
    // 在实际实现中，这里需要重建菜单并应用到托盘
    // 暂时只记录日志
    
    Ok(())
}

// 设置托盘右键菜单
#[tauri::command]
pub async fn set_tray_context_menu(
    app: tauri::AppHandle,
    items: Vec<crate::models::TrayMenuItem>,
) -> Result<(), String> {
    println!("设置托盘右键菜单，项目数量: {}", items.len());
    
    // 在实际实现中，这里需要根据items创建新的菜单
    // 暂时只记录日志
    
    Ok(())
}

// 显示托盘通知
#[tauri::command]
pub async fn show_tray_notification(
    app: tauri::AppHandle,
    title: String,
    body: String,
    icon: Option<String>,
    duration: Option<u64>,
) -> Result<(), String> {
    // 显示系统通知
    println!("显示通知: {} - {}", title, body);
    
    // 暂时禁用通知功能，避免编译错误
    // 使用 Tauri 2.x 通知系统需要在 lib.rs 中注册通知插件
    // 暂时返回成功
    
    Ok(())
}

// 获取托盘可见性
#[tauri::command]
pub async fn is_tray_visible(app: tauri::AppHandle) -> Result<bool, String> {
    let tray_manager = get_tray_manager();
    Ok(tray_manager.get_tray_icon().is_some())
}

// 获取托盘状态
#[tauri::command]
pub async fn get_tray_state(app: tauri::AppHandle) -> Result<crate::models::TrayStateResponse, String> {
    let tray_manager = get_tray_manager();
    let main_visible = if let Some(window) = app.get_webview_window("main") {
        window.is_visible().unwrap_or(false)
    } else {
        false
    };
    
    let float_visible = if let Some(window) = app.get_webview_window("float") {
        window.is_visible().unwrap_or(false)
    } else {
        false
    };
    
    Ok(crate::models::TrayStateResponse {
        is_visible: tray_manager.get_tray_icon().is_some(),
        main_window_visible: main_visible,
        float_window_visible: float_visible,
        timer_status: "stopped".to_string(),
    })
}