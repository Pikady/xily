#!/bin/bash

echo "🔍 数据库调试工具"
echo "=================="

DB_PATH="src-tauri/xily.db"

# 1. 检查数据库文件
echo "📂 检查数据库文件..."
if [ -f "$DB_PATH" ]; then
    echo "✅ 数据库文件存在: $DB_PATH"
    file_size=$(du -h "$DB_PATH" | cut -f1)
    echo "📊 文件大小: $file_size"
    echo "🕐 最后修改: $(stat -c %y "$DB_PATH")"
else
    echo "❌ 数据库文件不存在"
    exit 1
fi

# 2. 检查数据库表结构
echo ""
echo "📋 检查数据库表..."
sqlite3 "$DB_PATH" ".tables"

# 3. 检查works表数据
echo ""
echo "📚 检查作品数据..."
sqlite3 "$DB_PATH" "SELECT * FROM works;"

# 4. 检查time_records表数据
echo ""
echo "⏱️  检查时间记录（最近10条）..."
sqlite3 "$DB_PATH" "SELECT id, work_id, mode, duration, start_time, is_completed FROM time_records ORDER BY start_time DESC LIMIT 10;"

# 5. 检查timer_sessions表数据
echo ""
echo "🎯 检查计时会话（最近10条）..."
sqlite3 "$DB_PATH" "SELECT id, work_id, mode, duration, start_time, is_active FROM timer_sessions ORDER BY start_time DESC LIMIT 10;"

# 6. 检查特定作品的时间记录
echo ""
echo "📊 按作品分组统计时间记录..."
sqlite3 "$DB_PATH" "SELECT work_id, COUNT(*) as count, SUM(duration) as total_duration FROM time_records GROUP BY work_id;"

# 7. 测试分析查询
echo ""
echo "🔍 测试分析查询（作品进度）..."
sqlite3 "$DB_PATH" "SELECT w.id, w.name, w.target_hours, COALESCE(SUM(tr.duration), 0) as total_minutes, COALESCE(COUNT(tr.id), 0) as session_count FROM works w LEFT JOIN time_records tr ON w.id = tr.work_id GROUP BY w.id, w.name, w.target_hours;"

echo ""
echo "🎯 调试完成!"