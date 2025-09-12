use std::sync::Mutex;
use tauri::Manager;
use std::collections::HashMap;
use std::sync::OnceLock;

pub struct TrayManager {
    tray_icon: Mutex<Option<tauri::tray::TrayIcon>>,
    menu_items: Mutex<HashMap<String, bool>>,
    tooltip: Mutex<String>,
}

impl TrayManager {
    pub fn new() -> Self {
        Self {
            tray_icon: Mutex::new(None),
            menu_items: Mutex::new(HashMap::new()),
            tooltip: Mutex::new("汐律 - 智能时间管理工具".to_string()),
        }
    }

    pub fn get_tray_icon(&self) -> Option<tauri::tray::TrayIcon> {
        self.tray_icon.lock().unwrap().clone()
    }

    pub fn set_tray_icon(&self, tray: tauri::tray::TrayIcon) {
        *self.tray_icon.lock().unwrap() = Some(tray);
    }

    pub fn remove_tray(&self) {
        *self.tray_icon.lock().unwrap() = None;
    }

    pub fn set_tooltip(&self, tooltip: String) {
        *self.tooltip.lock().unwrap() = tooltip;
    }

    pub fn get_tooltip(&self) -> String {
        self.tooltip.lock().unwrap().clone()
    }
}

unsafe impl Send for TrayManager {}
unsafe impl Sync for TrayManager {}

pub fn get_tray_manager() -> &'static TrayManager {
    static TRAY_MANAGER: OnceLock<TrayManager> = OnceLock::new();
    TRAY_MANAGER.get_or_init(|| TrayManager::new())
}