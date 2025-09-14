// 分析相关命令实现
use crate::services::analytics::{AnalyticsService, WorkProgress, ProductivityTrend, ExportData};
use crate::models::{WorkTimeStats, ModeStats, DailyStats};
use chrono::{DateTime, Utc};

#[tauri::command]
pub async fn get_work_time_distribution(
    workId: Option<i64>,
    startDate: Option<String>,
    endDate: Option<String>
) -> Result<Vec<WorkTimeStats>, String> {
    let start = startDate
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    let end = endDate
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    AnalyticsService::get_work_time_distribution(workId, start, end)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_mode_distribution(
    startDate: Option<String>,
    endDate: Option<String>
) -> Result<ModeStats, String> {
    let start = startDate
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    let end = endDate
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
pub async fn get_work_progress(workId: i64) -> Result<WorkProgress, String> {
    AnalyticsService::get_work_progress(workId)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_work_stats(workId: i64) -> Result<WorkProgress, String> {
    println!("🚀 get_work_stats called with workId: {}", workId);

    // 首先测试数据库连接
    match crate::database::get_connection() {
        Ok(conn) => {
            println!("✅ 数据库连接成功");
            // 测试查询作品是否存在
            let count: rusqlite::Result<i32> = conn.query_row("SELECT COUNT(*) FROM works WHERE id = ?1", [workId], |row| row.get(0));
            match count {
                Ok(count) => println!("📊 找到 {} 个作品 ID 为 {}", count, workId),
                Err(e) => println!("❌ 查询作品失败: {}", e),
            }
        }
        Err(e) => {
            println!("❌ 数据库连接失败: {}", e);
            return Err(format!("数据库连接失败: {}", e));
        }
    }

    let result = AnalyticsService::get_work_progress(workId)
        .map_err(|e| {
            println!("❌ get_work_stats failed: {}", e);
            e.to_string()
        });
    println!("🎯 get_work_stats result: {:?}", result);
    result
}

#[tauri::command]
pub async fn get_productivity_trends(days: i32) -> Result<Vec<ProductivityTrend>, String> {
    AnalyticsService::get_productivity_trends(days)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_data(
    workId: Option<i64>,
    startDate: Option<String>,
    endDate: Option<String>
) -> Result<ExportData, String> {
    let start = startDate
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    let end = endDate
        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
        .map(|dt| dt.with_timezone(&Utc));

    AnalyticsService::export_data(workId, start, end)
        .map_err(|e| e.to_string())
}