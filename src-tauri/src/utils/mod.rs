use chrono::{DateTime, Utc, Duration, Datelike};
use serde_json::Value;
use std::fs;
use std::path::Path;
use uuid::Uuid;

pub mod time_utils {
    use chrono::{DateTime, Utc, Duration ,Datelike, Timelike};
    
    pub fn format_duration(minutes: i32) -> String {
        let hours = minutes / 60;
        let mins = minutes % 60;
        
        if hours > 0 {
            format!("{}小时{}分钟", hours, mins)
        } else {
            format!("{}分钟", mins)
        }
    }
    
    pub fn format_time_ago(datetime: DateTime<Utc>) -> String {
        let now = Utc::now();
        let duration = now.signed_duration_since(datetime);
        
        if duration.num_days() > 0 {
            format!("{}天前", duration.num_days())
        } else if duration.num_hours() > 0 {
            format!("{}小时前", duration.num_hours())
        } else if duration.num_minutes() > 0 {
            format!("{}分钟前", duration.num_minutes())
        } else {
            "刚刚".to_string()
        }
    }
    
    pub fn get_start_of_day(date: DateTime<Utc>) -> DateTime<Utc> {
        date.date_naive().and_hms_opt(0, 0, 0).unwrap().and_utc()
    }
    
    pub fn get_end_of_day(date: DateTime<Utc>) -> DateTime<Utc> {
        date.date_naive().and_hms_opt(23, 59, 59).unwrap().and_utc()
    }
    
    pub fn get_start_of_week(date: DateTime<Utc>) -> DateTime<Utc> {
        let days_since_monday = date.weekday().num_days_from_monday();
        date - Duration::days(days_since_monday as i64)
    }
    
    pub fn get_start_of_month(date: DateTime<Utc>) -> DateTime<Utc> {
        date.with_day(1).unwrap()
            .with_hour(0).unwrap()
            .with_minute(0).unwrap()
            .with_second(0).unwrap()
            .with_nanosecond(0).unwrap()
    }
}

pub mod validation_utils {
    use regex::Regex;
    
    pub fn is_valid_work_name(name: &str) -> bool {
        !name.trim().is_empty() && name.len() <= 100
    }
    
    pub fn is_valid_color(color: &str) -> bool {
        let hex_regex = Regex::new(r"^#[0-9A-Fa-f]{6}$").unwrap();
        hex_regex.is_match(color) || color.is_empty()
    }
    
    pub fn is_valid_duration(duration: i32) -> bool {
        duration > 0 && duration <= 480 // 最大8小时
    }
    
    pub fn is_valid_target_hours(hours: i32) -> bool {
        hours >= 0 && hours <= 10000
    }
}

pub mod string_utils {
    pub fn truncate_string(s: &str, max_length: usize) -> String {
        if s.len() <= max_length {
            s.to_string()
        } else {
            format!("{}...", &s[..max_length])
        }
    }
    
    pub fn generate_id() -> String {
        uuid::Uuid::new_v4().to_string()
    }
    
    pub fn normalize_string(s: &str) -> String {
        s.trim().to_string()
    }
}

pub mod file_utils {
    use std::fs;
    use std::path::Path;
    
    pub fn ensure_directory_exists(path: &Path) -> Result<(), String> {
        if !path.exists() {
            fs::create_dir_all(path).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
    
    pub fn write_file_with_backup(path: &Path, content: &str) -> Result<(), String> {
        if path.exists() {
            let backup_path = path.with_extension("bak");
            fs::copy(path, backup_path).map_err(|e| e.to_string())?;
        }
        
        fs::write(path, content).map_err(|e| e.to_string())?;
        Ok(())
    }
    
    pub fn read_file_or_default(path: &Path, default: &str) -> String {
        if path.exists() {
            fs::read_to_string(path).unwrap_or_else(|_| default.to_string())
        } else {
            default.to_string()
        }
    }
}

pub mod math_utils {
    pub fn calculate_percentage(value: f64, total: f64) -> f64 {
        if total == 0.0 {
            0.0
        } else {
            (value / total) * 100.0
        }
    }
    
    pub fn calculate_average(values: &[f64]) -> f64 {
        if values.is_empty() {
            0.0
        } else {
            values.iter().sum::<f64>() / values.len() as f64
        }
    }
    
    pub fn round_to_decimal(value: f64, decimal_places: u32) -> f64 {
        let multiplier = 10f64.powi(decimal_places as i32);
        (value * multiplier).round() / multiplier
    }
}

pub mod json_utils {
    use serde_json::{Value, json};
    
    pub fn safe_get_string(obj: &Value, key: &str) -> Option<String> {
        obj.get(key).and_then(|v| v.as_str()).map(|s| s.to_string())
    }
    
    pub fn safe_get_number(obj: &Value, key: &str) -> Option<f64> {
        obj.get(key).and_then(|v| v.as_f64())
    }
    
    pub fn safe_get_bool(obj: &Value, key: &str) -> Option<bool> {
        obj.get(key).and_then(|v| v.as_bool())
    }
    
    pub fn merge_json(a: &Value, b: &Value) -> Value {
        if let (Some(a_obj), Some(b_obj)) = (a.as_object(), b.as_object()) {
            let mut result = a_obj.clone();
            for (key, value) in b_obj {
                result.insert(key.clone(), value.clone());
            }
            Value::Object(result)
        } else {
            b.clone()
        }
    }
}

pub mod logging_utils {
    use chrono::{DateTime, Utc};
    use std::fs::OpenOptions;
    use std::io::Write;
    
    pub fn log_message(level: &str, message: &str) {
        let timestamp = Utc::now().format("%Y-%m-%d %H:%M:%S UTC");
        let log_entry = format!("[{}] {}: {}\n", timestamp, level, message);
        
        // 这里可以根据需要写入文件或控制台
        println!("{}", log_entry);
    }
    
    pub fn log_info(message: &str) {
        log_message("INFO", message);
    }
    
    pub fn log_error(message: &str) {
        log_message("ERROR", message);
    }
    
    pub fn log_debug(message: &str) {
        log_message("DEBUG", message);
    }
}

pub mod config_utils {
    use std::collections::HashMap;
    use serde_json::{Value, json};
    
    pub fn get_default_config() -> Value {
        json!({
            "timer": {
                "focus_duration": 25,
                "short_break": 5,
                "long_break": 15,
                "auto_start_breaks": true,
                "auto_start_pomodoros": true
            },
            "window": {
                "always_on_top": true,
                "float_window_size": {"width": 200, "height": 200},
                "remember_position": true
            },
            "notifications": {
                "enabled": true,
                "sound": true,
                "break_reminder": true,
                "session_complete": true
            },
            "data": {
                "auto_backup": true,
                "backup_interval_days": 7,
                "keep_backups_count": 10
            }
        })
    }
    
    pub fn validate_config(config: &Value) -> Result<(), String> {
        // 验证配置的基本结构
        if !config.is_object() {
            return Err("配置必须是JSON对象".to_string());
        }
        
        // 验证计时器配置
        if let Some(timer) = config.get("timer") {
            if let Some(focus_duration) = timer.get("focus_duration") {
                if let Some(duration) = focus_duration.as_i64() {
                    if duration <= 0 || duration > 480 {
                        return Err("专注时长必须在1-480分钟之间".to_string());
                    }
                }
            }
        }
        
        Ok(())
    }
    
    pub fn merge_with_defaults(config: &Value) -> Value {
        let defaults = get_default_config();
        merge_json_objects(&defaults, config)
    }
    
    fn merge_json_objects(a: &Value, b: &Value) -> Value {
        match (a, b) {
            (Value::Object(a_map), Value::Object(b_map)) => {
                let mut result = a_map.clone();
                for (key, value) in b_map {
                    result.insert(key.clone(), merge_json_objects(a_map.get(key).unwrap_or(&Value::Null), value));
                }
                Value::Object(result)
            }
            (_, b_val) => b_val.clone(),
        }
    }
}