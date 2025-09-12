// 临时占位符 - 实际的命令实现需要从 lib.rs 中移动过来
use tauri::Manager;

#[tauri::command]
pub async fn create_work() -> Result<(), String> { Ok(()) }
#[tauri::command]
pub async fn get_works() -> Result<(), String> { Ok(()) }
#[tauri::command]
pub async fn get_work() -> Result<(), String> { Ok(()) }
#[tauri::command]
pub async fn update_work() -> Result<(), String> { Ok(()) }
#[tauri::command]
pub async fn delete_work() -> Result<(), String> { Ok(()) }
#[tauri::command]
pub async fn archive_work() -> Result<(), String> { Ok(()) }
#[tauri::command]
pub async fn unarchive_work() -> Result<(), String> { Ok(()) }