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
            if let Some(window) = app.get_webview_window("main") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
        tauri::SystemTrayEvent::RightClick {
            position: _,
            size: _,
            ..
        } => {
            // 右键点击显示菜单（默认行为）
        }
        tauri::SystemTrayEvent::DoubleClick {
            position: _,
            size: _,
            ..
        } => {
            // 双击显示悬浮窗
            if let Some(window) = app.get_webview_window("float") {
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        }
        tauri::SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
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
                _ => {}
            }
        }
        _ => {}
    }
}