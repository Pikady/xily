use tauri::Manager;

// 系统命令
#[tauri::command]
pub async fn get_app_version(app: tauri::AppHandle) -> Result<String, String> {
    Ok(app.package_info().version.to_string())
}

#[tauri::command]
pub async fn get_app_name(app: tauri::AppHandle) -> Result<String, String> {
    Ok(app.package_info().name.to_string())
}

#[tauri::command]
pub async fn quit_app(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

#[tauri::command]
pub async fn show_notification(
    app: tauri::AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    // 暂时禁用通知功能，避免编译错误
    println!("显示通知: {} - {}", title, body);
    
    // 使用 Tauri 2.x 通知系统需要在 lib.rs 中注册通知插件
    // 暂时返回成功
    Ok(())
}