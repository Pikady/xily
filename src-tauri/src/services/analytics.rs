use crate::models::{TimeRecord, Work, WorkTimeStats, ModeStats, DailyStats};
use crate::database::get_connection;
use rusqlite::{Result, params};
use chrono::{DateTime, Utc, Duration};

pub struct AnalyticsService;

impl AnalyticsService {
    pub fn get_work_time_distribution(work_id: Option<i64>, start_date: Option<DateTime<Utc>>, end_date: Option<DateTime<Utc>>) -> Result<Vec<WorkTimeStats>> {
        let conn = get_connection()?;
        let mut query = "
            SELECT w.id, w.name, w.color, COALESCE(SUM(tr.duration), 0) as total_time,
                   COALESCE(COUNT(tr.id), 0) as session_count,
                   COALESCE(AVG(tr.duration), 0) as avg_duration
            FROM works w
            LEFT JOIN time_records tr ON w.id = tr.work_id
            WHERE 1=1
        ".to_string();

        let mut params_vec = Vec::new();

        if let Some(id) = work_id {
            query.push_str(" AND w.id = ?1");
            params_vec.push(id.to_string());
        }

        if let Some(start) = start_date {
            query.push_str(" AND tr.start_time >= ?");
            params_vec.push(start.to_rfc3339());
        }

        if let Some(end) = end_date {
            query.push_str(" AND tr.end_time <= ?");
            params_vec.push(end.to_rfc3339());
        }

        query.push_str(" GROUP BY w.id, w.name, w.color ORDER BY total_time DESC");

        println!("🔍 Query: {}", query);
        println!("🔍 Params: {:?}", params_vec);

        let mut stmt = conn.prepare(&query)?;
        let rows = stmt.query_map(rusqlite::params_from_iter(params_vec), |row| {
            Ok(WorkTimeStats {
                work_id: row.get(0)?,
                work_name: row.get(1)?,
                work_color: row.get(2)?,
                total_time: row.get(3)?,
                session_count: row.get(4)?,
                avg_duration: row.get(5)?,
            })
        })?;

        let mut stats = Vec::new();
        for stat in rows {
            let stat = stat?;
            println!("🔍 Work stat: {} - {} minutes, {} sessions", stat.work_name, stat.total_time, stat.session_count);
            stats.push(stat);
        }
        Ok(stats)
    }

    pub fn get_mode_distribution(start_date: Option<DateTime<Utc>>, end_date: Option<DateTime<Utc>>) -> Result<ModeStats> {
        let conn = get_connection()?;
        let mut query = "
            SELECT mode, SUM(duration) as total_time, COUNT(*) as session_count
            FROM time_records
            WHERE 1=1
        ".to_string();
        
        let mut params_vec = Vec::new();
        
        if let Some(start) = start_date {
            query.push_str(" AND start_time >= ?");
            params_vec.push(start.to_rfc3339());
        }
        
        if let Some(end) = end_date {
            query.push_str(" AND end_time <= ?");
            params_vec.push(end.to_rfc3339());
        }
        
        query.push_str(" GROUP BY mode");
        
        let mut stmt = conn.prepare(&query)?;
        let mut explore_time = 0;
        let mut utilize_time = 0;
        let mut explore_sessions = 0;
        let mut utilize_sessions = 0;
        
        let rows = stmt.query_map(rusqlite::params_from_iter(params_vec), |row| {
            let mode: String = row.get(0)?;
            let total_time: i32 = row.get(1)?;
            let session_count: i32 = row.get(2)?;
            
            if mode == "explore" {
                explore_time = total_time;
                explore_sessions = session_count;
            } else if mode == "utilize" {
                utilize_time = total_time;
                utilize_sessions = session_count;
            }
            
            Ok(())
        })?;
        
        for _ in rows {
            // 消费迭代器
        }
        
        Ok(ModeStats {
            explore_time,
            utilize_time,
            explore_sessions,
            utilize_sessions,
            total_time: explore_time + utilize_time,
            balance_ratio: if utilize_time > 0 { explore_time as f64 / utilize_time as f64 } else { 0.0 },
        })
    }

    pub fn get_daily_stats(days: i32) -> Result<Vec<DailyStats>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(&format!(
            "SELECT 
                DATE(start_time) as date,
                SUM(duration) as total_time,
                COUNT(*) as session_count,
                SUM(CASE WHEN mode = 'explore' THEN duration ELSE 0 END) as explore_time,
                SUM(CASE WHEN mode = 'utilize' THEN duration ELSE 0 END) as utilize_time
             FROM time_records
             WHERE start_time >= date('now', '-{} days')
             GROUP BY DATE(start_time)
             ORDER BY date DESC",
            days
        ))?;
        
        let rows = stmt.query_map([], |row| {
            Ok(DailyStats {
                date: row.get(0)?,
                total_time: row.get(1)?,
                session_count: row.get(2)?,
                explore_time: row.get(3)?,
                utilize_time: row.get(4)?,
            })
        })?;
        
        let mut stats = Vec::new();
        for stat in rows {
            stats.push(stat?);
        }
        Ok(stats)
    }

    pub fn get_work_progress(work_id: i64) -> Result<WorkProgress> {
        let conn = get_connection()?;
        let query = "
            SELECT
                w.target_hours,
                COALESCE(SUM(tr.duration), 0) as total_minutes,
                COALESCE(COUNT(tr.id), 0) as session_count,
                COALESCE(AVG(tr.duration), 0) as avg_duration
             FROM works w
             LEFT JOIN time_records tr ON w.id = tr.work_id
             WHERE w.id = ?1
             GROUP BY w.id, w.target_hours";

        println!("📊 get_work_progress query for work_id {}: {}", work_id, query);

        let mut stmt = conn.prepare(query)?;
        let mut rows = stmt.query(params![work_id])?;

        if let Some(row) = rows.next()? {
            let target_hours: i32 = row.get(0)?;
            let total_minutes: i32 = row.get(1)?;
            let session_count: i32 = row.get(2)?;
            let avg_duration: f64 = row.get(3)?;

            let progress_percentage = if target_hours > 0 {
                (total_minutes as f64 / (target_hours * 60) as f64) * 100.0
            } else {
                0.0
            };

            println!("📊 Work {} progress: {}m / {}h = {:.1}%, {} sessions",
                     work_id, total_minutes, target_hours, progress_percentage, session_count);

            Ok(WorkProgress {
                work_id,
                target_hours,
                total_minutes,
                session_count,
                avg_duration,
                progress_percentage,
            })
        } else {
            println!("📊 No work found for work_id {}, returning empty progress", work_id);
            Ok(WorkProgress {
                work_id,
                target_hours: 0,
                total_minutes: 0,
                session_count: 0,
                avg_duration: 0.0,
                progress_percentage: 0.0,
            })
        }
    }

    pub fn get_productivity_trends(days: i32) -> Result<Vec<ProductivityTrend>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(&format!(
            "SELECT 
                DATE(start_time) as date,
                SUM(duration) as total_time,
                SUM(CASE WHEN mode = 'explore' THEN duration ELSE 0 END) as explore_time,
                SUM(CASE WHEN mode = 'utilize' THEN duration ELSE 0 END) as utilize_time,
                COUNT(*) as session_count,
                AVG(duration) as avg_session_duration
             FROM time_records
             WHERE start_time >= date('now', '-{} days')
             GROUP BY DATE(start_time)
             ORDER BY date DESC",
            days
        ))?;
        
        let rows = stmt.query_map([], |row| {
            Ok(ProductivityTrend {
                date: row.get(0)?,
                total_time: row.get(1)?,
                explore_time: row.get(2)?,
                utilize_time: row.get(3)?,
                session_count: row.get(4)?,
                avg_session_duration: row.get(5)?,
            })
        })?;
        
        let mut trends = Vec::new();
        for trend in rows {
            trends.push(trend?);
        }
        Ok(trends)
    }

    pub fn export_data(work_id: Option<i64>, start_date: Option<DateTime<Utc>>, end_date: Option<DateTime<Utc>>) -> Result<ExportData> {
        let work_stats = Self::get_work_time_distribution(work_id, start_date, end_date)?;
        let mode_stats = Self::get_mode_distribution(start_date, end_date)?;
        let daily_stats = Self::get_daily_stats(30)?;
        
        Ok(ExportData {
            work_stats,
            mode_stats,
            daily_stats,
            export_date: Utc::now(),
        })
    }
}

#[derive(Debug, serde::Serialize)]
pub struct WorkProgress {
    pub work_id: i64,
    pub target_hours: i32,
    pub total_minutes: i32,
    pub session_count: i32,
    pub avg_duration: f64,
    pub progress_percentage: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct ProductivityTrend {
    pub date: String,
    pub total_time: i32,
    pub explore_time: i32,
    pub utilize_time: i32,
    pub session_count: i32,
    pub avg_session_duration: f64,
}

#[derive(Debug, serde::Serialize)]
pub struct ExportData {
    pub work_stats: Vec<WorkTimeStats>,
    pub mode_stats: ModeStats,
    pub daily_stats: Vec<DailyStats>,
    pub export_date: DateTime<Utc>,
}