use rusqlite::{Connection, Result, types::Type};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use std::path::PathBuf;

static DB_CONN: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));
static DB_PATH: Lazy<Mutex<Option<PathBuf>>> = Lazy::new(|| Mutex::new(None));

pub fn init_database() -> Result<()> {
    // 获取用户数据目录
    let app_data_dir = dirs::data_dir()
        .unwrap_or_else(|| std::env::current_dir().unwrap())
        .join("xily");
    
    // 确保目录存在
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| rusqlite::Error::InvalidColumnType(0, format!("Failed to create directory: {}", e), Type::Null))?;
    
    let db_path = app_data_dir.join("xily.db");
    *DB_PATH.lock().unwrap() = Some(db_path.clone());
    
    let conn = Connection::open(&db_path)?;
    
    // 创建表
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS works (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            target_hours INTEGER DEFAULT 0,
            is_archived BOOLEAN DEFAULT FALSE
        );
        
        CREATE TABLE IF NOT EXISTS time_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_id INTEGER,
            mode TEXT NOT NULL,
            duration INTEGER NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            is_completed BOOLEAN DEFAULT FALSE,
            notes TEXT,
            FOREIGN KEY (work_id) REFERENCES works(id)
        );
        
        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS system_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        "
    )?;
    
    *DB_CONN.lock().unwrap() = Some(conn);
    Ok(())
}

pub fn get_connection() -> Result<Connection> {
    let guard = DB_CONN.lock().unwrap();
    guard.as_ref()
        .ok_or_else(|| rusqlite::Error::InvalidColumnType(0, "Database not initialized".into(), Type::Null))?;
    let path_guard = DB_PATH.lock().unwrap();
    let db_path = path_guard.as_ref()
        .ok_or_else(|| rusqlite::Error::InvalidColumnType(0, "Database path not set".into(), Type::Null))?;
    
    Ok(Connection::open(db_path)?)
}