use crate::models::{TimerSession, TimeRecord, TimerConfig};
use crate::database::get_connection;
use rusqlite::{Result, params};
use chrono::Utc;

pub struct TimerService;

impl TimerService {
    pub fn start_timer(work_id: Option<i64>, mode: String, duration: i32) -> Result<TimerSession> {
        let actual_work_id = work_id.unwrap_or(0); // 使用 0 表示未分类
        
        let session = TimerSession {
            id: None,
            work_id: actual_work_id,
            mode,
            start_time: Utc::now(),
            is_active: true,
            duration,
        };
        
        // 记录到数据库
        let conn = get_connection()?;
        
        // 首先创建 timer_sessions 表，允许 work_id 为 NULL
        conn.execute(
            "CREATE TABLE IF NOT EXISTS timer_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                work_id INTEGER,
                mode TEXT NOT NULL,
                start_time DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                duration INTEGER NOT NULL,
                FOREIGN KEY (work_id) REFERENCES works(id)
            )",
            [],
        )?;
        
        conn.execute(
            "INSERT INTO timer_sessions (work_id, mode, start_time, is_active, duration) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                session.work_id,
                session.mode,
                session.start_time,
                session.is_active,
                session.duration
            ],
        )?;
        
        Ok(session)
    }

    pub fn stop_timer(session_id: Option<i64>, work_id: Option<i64>, mode: Option<String>, duration: Option<i32>) -> Result<Option<TimeRecord>> {
        // 根据前端传来的参数创建时间记录，使用默认值处理None
        let w_id = work_id.unwrap_or(0);
        let m = mode.unwrap_or_else(|| "explore".to_string());
        let d = duration.unwrap_or(25); // 默认25分钟
        
        if w_id > 0 || d > 0 { // 只要有work_id或duration就创建记录
            let end_time = Utc::now();
            let start_time = end_time - chrono::Duration::minutes(d as i64);
            
            let record = TimeRecord {
                id: None,
                work_id: Some(w_id),
                mode: m,
                duration: d,
                start_time,
                end_time,
                is_completed: true,
                notes: None,
            };
            
            // 保存时间记录
            let conn = get_connection()?;
            conn.execute(
                "CREATE TABLE IF NOT EXISTS time_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    work_id INTEGER,
                    mode TEXT NOT NULL,
                    duration INTEGER NOT NULL,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME NOT NULL,
                    is_completed BOOLEAN DEFAULT FALSE,
                    notes TEXT,
                    FOREIGN KEY (work_id) REFERENCES works(id)
                )",
                [],
            )?;
            
            conn.execute(
                "INSERT INTO time_records (work_id, mode, duration, start_time, end_time, is_completed) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    record.work_id,
                    record.mode,
                    record.duration,
                    record.start_time,
                    record.end_time,
                    record.is_completed
                ],
            )?;
            
            // 如果提供了session_id，更新对应session状态
            if let Some(sid) = session_id {
                conn.execute(
                    "UPDATE timer_sessions SET is_active = FALSE WHERE id = ?1",
                    params![sid],
                )?;
            }
            
            Ok(Some(record))
        } else {
            Ok(None)
        }
    }

    // 移除get_current_session方法，由前端管理状态

    pub fn get_timer_config() -> Result<TimerConfig> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT value FROM user_settings WHERE key = 'timer_config'"
        )?;
        let mut rows = stmt.query([])?;
        
        if let Some(row) = rows.next()? {
            let config_str: String = row.get(0)?;
            Ok(serde_json::from_str(&config_str).unwrap_or_default())
        } else {
            Ok(TimerConfig::default())
        }
    }

    pub fn save_timer_config(config: &TimerConfig) -> Result<()> {
        let conn = get_connection()?;
        let config_str = serde_json::to_string(config).map_err(|e| rusqlite::Error::InvalidColumnType(0, format!("JSON serialization error: {}", e), rusqlite::types::Type::Null))?;
        
        conn.execute(
            "INSERT OR REPLACE INTO user_settings (key, value) VALUES ('timer_config', ?1)",
            params![config_str],
        )?;
        Ok(())
    }

    // 简化pause_timer方法，仅更新数据库状态
    pub fn pause_timer(session_id: Option<i64>) -> Result<bool> {
        if let Some(sid) = session_id {
            let conn = get_connection()?;
            let rows_affected = conn.execute(
                "UPDATE timer_sessions SET is_active = FALSE WHERE id = ?1",
                params![sid],
            )?;
            Ok(rows_affected > 0)
        } else {
            Ok(false)
        }
    }

    // 简化resume_timer方法，仅更新数据库状态
    pub fn resume_timer(session_id: Option<i64>) -> Result<bool> {
        if let Some(sid) = session_id {
            let conn = get_connection()?;
            let rows_affected = conn.execute(
                "UPDATE timer_sessions SET is_active = TRUE WHERE id = ?1",
                params![sid],
            )?;
            Ok(rows_affected > 0)
        } else {
            Ok(false)
        }
    }

    pub fn get_timer_sessions(work_id: Option<i64>, limit: Option<i32>) -> Result<Vec<TimerSession>> {
        let conn = get_connection()?;
        let mut query = "SELECT id, work_id, mode, start_time, is_active, duration FROM timer_sessions".to_string();
        let mut params_vec = Vec::new();
        
        if let Some(id) = work_id {
            query.push_str(" WHERE work_id = ?1");
            params_vec.push(id.to_string());
        }
        
        query.push_str(" ORDER BY start_time DESC");
        
        if let Some(lim) = limit {
            query.push_str(" LIMIT ?");
            params_vec.push(lim.to_string());
        }
        
        let mut stmt = conn.prepare(&query)?;
        let rows = stmt.query_map(rusqlite::params_from_iter(params_vec), |row| {
            Ok(TimerSession {
                id: Some(row.get(0)?),
                work_id: row.get(1)?,
                mode: row.get(2)?,
                start_time: row.get(3)?,
                is_active: row.get(4)?,
                duration: row.get(5)?,
            })
        })?;
        
        let mut sessions = Vec::new();
        for session in rows {
            sessions.push(session?);
        }
        Ok(sessions)
    }
}