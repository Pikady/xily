use crate::models::Work;
use crate::services::WorksService;
use chrono::Utc;

#[tauri::command]
pub async fn create_work(name: String, description: Option<String>, color: Option<String>, target_hours: Option<i32>) -> Result<Work, String> {
    let work = Work {
        id: None,
        name,
        description,
        color,
        created_at: Some(Utc::now()),
        updated_at: Some(Utc::now()),
        target_hours: target_hours.unwrap_or(0),
        is_archived: false,
    };
    
    match WorksService::create_work(&work) {
        Ok(id) => {
            let mut created_work = work;
            created_work.id = Some(id);
            Ok(created_work)
        }
        Err(e) => Err(format!("Failed to create work: {}", e)),
    }
}

#[tauri::command]
pub async fn get_works() -> Result<Vec<Work>, String> {
    match WorksService::get_all_works() {
        Ok(works) => Ok(works),
        Err(e) => Err(format!("Failed to get works: {}", e)),
    }
}

#[tauri::command]
pub async fn get_work(id: i64) -> Result<Option<Work>, String> {
    match WorksService::get_work(id) {
        Ok(work) => Ok(work),
        Err(e) => Err(format!("Failed to get work: {}", e)),
    }
}

#[tauri::command]
pub async fn update_work(work: Work) -> Result<Work, String> {
    match WorksService::update_work(&work) {
        Ok(_) => Ok(work),
        Err(e) => Err(format!("Failed to update work: {}", e)),
    }
}

#[tauri::command]
pub async fn delete_work(id: i64) -> Result<(), String> {
    match WorksService::delete_work(id) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete work: {}", e)),
    }
}

#[tauri::command]
pub async fn archive_work(id: i64) -> Result<(), String> {
    match WorksService::archive_work(id) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to archive work: {}", e)),
    }
}

#[tauri::command]
pub async fn unarchive_work(id: i64) -> Result<(), String> {
    match WorksService::unarchive_work(id) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to unarchive work: {}", e)),
    }
}