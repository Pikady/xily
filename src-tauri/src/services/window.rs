use tauri::{Manager, WebviewWindow};

pub struct WindowManager;

impl WindowManager {
    pub fn show_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("main") {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn hide_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("main") {
            window.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn create_float_window(app: &tauri::AppHandle) -> Result<WebviewWindow, String> {
        tauri::WebviewWindowBuilder::new(app, "float", tauri::WebviewUrl::App("float.html".parse().unwrap()))
            .title("汐律悬浮窗")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible_on_all_workspaces(true)
            .inner_size(200.0, 200.0)
            .build()
            .map_err(|e| e.to_string())
    }

    pub fn toggle_float_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("float") {
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

    pub fn show_float_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("float") {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        } else {
            Self::create_float_window(app)?;
        }
        Ok(())
    }

    pub fn hide_float_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("float") {
            window.hide().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn minimize_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("main") {
            window.minimize().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn maximize_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("main") {
            window.maximize().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn close_main_window(app: &tauri::AppHandle) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("main") {
            window.close().map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn set_float_window_position(app: &tauri::AppHandle, x: f64, y: f64) -> Result<(), String> {
        if let Some(window) = app.get_webview_window("float") {
            window.set_position(tauri::LogicalPosition::new(x, y))
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub fn get_float_window_position(app: &tauri::AppHandle) -> Result<Option<(f64, f64)>, String> {
        // 简化版本，暂时返回 None
        Ok(None)
    }

    pub fn is_float_window_visible(app: &tauri::AppHandle) -> Result<bool, String> {
        if let Some(window) = app.get_webview_window("float") {
            window.is_visible().map_err(|e| e.to_string())
        } else {
            Ok(false)
        }
    }

    pub fn is_main_window_visible(app: &tauri::AppHandle) -> Result<bool, String> {
        if let Some(window) = app.get_webview_window("main") {
            window.is_visible().map_err(|e| e.to_string())
        } else {
            Ok(false)
        }
    }

    pub fn center_window(window: &WebviewWindow) -> Result<(), String> {
        window.center().map_err(|e| e.to_string())
    }

    pub fn set_window_size(window: &WebviewWindow, width: f64, height: f64) -> Result<(), String> {
        window.set_size(tauri::LogicalSize::new(width, height))
            .map_err(|e| e.to_string())
    }

    pub fn set_window_always_on_top(window: &WebviewWindow, always_on_top: bool) -> Result<(), String> {
        window.set_always_on_top(always_on_top)
            .map_err(|e| e.to_string())
    }
}