use crate::models::Work;
use crate::database::get_connection;
use rusqlite::{Result, params};
use chrono::Utc;

pub struct WorksService;

impl WorksService {
    pub fn create_work(work: &Work) -> Result<i64> {
        let conn = get_connection()?;
        conn.execute(
            "INSERT INTO works (name, description, color, target_hours, is_archived) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                work.name,
                work.description,
                work.color,
                work.target_hours,
                work.is_archived
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_work(id: i64) -> Result<Option<Work>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, color, created_at, updated_at, target_hours, is_archived FROM works WHERE id = ?1"
        )?;
        let mut rows = stmt.query(params![id])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(Work {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                target_hours: row.get(6)?,
                is_archived: row.get(7)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_all_works() -> Result<Vec<Work>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, color, created_at, updated_at, target_hours, is_archived FROM works WHERE is_archived = FALSE ORDER BY created_at DESC"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(Work {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
                target_hours: row.get(6)?,
                is_archived: row.get(7)?,
            })
        })?;
        
        let mut works = Vec::new();
        for work in rows {
            works.push(work?);
        }
        Ok(works)
    }

    pub fn update_work(work: &Work) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE works SET name = ?1, description = ?2, color = ?3, target_hours = ?4, is_archived = ?5, updated_at = CURRENT_TIMESTAMP WHERE id = ?6",
            params![
                work.name,
                work.description,
                work.color,
                work.target_hours,
                work.is_archived,
                work.id
            ],
        )?;
        Ok(())
    }

    pub fn delete_work(id: i64) -> Result<()> {
        let conn = get_connection()?;
        conn.execute("DELETE FROM works WHERE id = ?1", params![id])?;
        conn.execute("DELETE FROM time_records WHERE work_id = ?1", params![id])?;
        Ok(())
    }

    pub fn archive_work(id: i64) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE works SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    pub fn unarchive_work(id: i64) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE works SET is_archived = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }
}