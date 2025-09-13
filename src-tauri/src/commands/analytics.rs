// 分析相关命令实现
use crate::services::analytics::{AnalyticsService, WorkProgress, ProductivityTrend, ExportData};
use crate::models::{WorkTimeStats, ModeStats, DailyStats};
use chrono::{DateTime, Utc};

#[tauri::command]
pub async fn get_work_time_distribution(
    work_id: Option<i64>,
    start_date: Option<String>,
    end_date: Option<String>
) -> Result<Vec<WorkTimeStats>, String> {
    let start = start_date
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    let end = end_date
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    AnalyticsService::get_work_time_distribution(work_id, start, end)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_mode_distribution(
    start_date: Option<String>,
    end_date: Option<String>
) -> Result<ModeStats, String> {
    let start = start_date
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    let end = end_date
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    AnalyticsService::get_mode_distribution(start, end)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_daily_stats(days: i32) -> Result<Vec<DailyStats>, String> {
    AnalyticsService::get_daily_stats(days)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_work_progress(work_id: i64) -> Result<WorkProgress, String> {
    AnalyticsService::get_work_progress(work_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_work_stats(work_id: i64) -> Result<WorkProgress, String> {
    AnalyticsService::get_work_progress(work_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_productivity_trends(days: i32) -> Result<Vec<ProductivityTrend>, String> {
    AnalyticsService::get_productivity_trends(days)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_data(
    work_id: Option<i64>,
    start_date: Option<String>,
    end_date: Option<String>
) -> Result<ExportData, String> {
    let start = start_date
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    let end = end_date
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    AnalyticsService::export_data(work_id, start, end)
        .map_err(|e| e.to_string())
}