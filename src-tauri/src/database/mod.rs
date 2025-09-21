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
            is_archived BOOLEAN DEFAULT FALSE,
            ai_created BOOLEAN DEFAULT FALSE,
            ai_session_id TEXT,
            motivation_summary TEXT
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

        CREATE TABLE IF NOT EXISTS ai_conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
            content TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT -- JSON格式存储元数据
        );

        CREATE TABLE IF NOT EXISTS ai_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            user_id TEXT,
            current_stage TEXT NOT NULL DEFAULT 'greeting',
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
            context TEXT, -- JSON格式存储上下文
            message_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS motivation_commitments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            work_id INTEGER NOT NULL,
            wish TEXT,
            outcome TEXT,
            obstacle TEXT,
            plan TEXT,
            implementation_intention TEXT,
            commitment_statement TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
        );

        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_ai_sessions_session_id ON ai_sessions(session_id);
        CREATE INDEX IF NOT EXISTS idx_ai_sessions_status ON ai_sessions(status);
        CREATE INDEX IF NOT EXISTS idx_motivation_commitments_work_id ON motivation_commitments(work_id);
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