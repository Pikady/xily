use tauri::{
    Manager, 
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent, MouseButton, MouseButtonState}
};

pub fn create_tray(app: &tauri::AppHandle) -> Result<tauri::tray::TrayIcon, Box<dyn std::error::Error>> {
    // 创建菜单项
    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "隐藏主窗口", true, None::<&str>)?;
    let float = MenuItem::with_id(app, "float", "显示悬浮窗", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出应用", true, None::<&str>)?;
    
    // 创建菜单
    let menu = Menu::with_items(app, &[&show, &hide, &float, &quit])?;
    
    // 尝试加载自定义图标
    let tray_icon = match tauri::image::Image::from_path("icons/tray-icon.png") {
        Ok(icon) => icon,
        Err(e) => {
            println!("警告: 无法加载自定义托盘图标: {}, 使用默认图标", e);
            app.default_window_icon().unwrap().clone()
        }
    };
    
    // 创建系统托盘
    let tray = TrayIconBuilder::new()
        .icon(tray_icon)
        .tooltip("汐律 - 智能时间管理工具")
        .menu(&menu)
        .show_menu_on_left_click(false) // 改为右键显示菜单
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
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
                _ => {
                    println!("未处理的菜单项: {:?}", event.id);
                }
            }
        })
        .on_tray_icon_event(|tray, event| {
            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    // 左键点击切换主窗口显示/隐藏
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
                TrayIconEvent::DoubleClick {
                    button: MouseButton::Left,
                    ..
                } => {
                    // 双击显示悬浮窗
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("float") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                }
                _ => {
                    // 其他事件（右键、悬停等）由系统默认处理
                }
            }
        })
        .build(app)?;
    
    Ok(tray)
}
