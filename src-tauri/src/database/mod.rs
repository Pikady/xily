use rusqlite::{Connection, Result};
use std::sync::Mutex;
use once_cell::sync::Lazy;

static DB_CONN: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

pub fn init_database() -> Result<()> {
    let conn = Connection::open("xily.db")?;
    
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
    DB_CONN.lock().unwrap().as_ref().cloned()
        .ok_or_else(|| rusqlite::Error::InvalidColumnType(0, "Database not initialized".into(), rusqlite::Type::Null))
}