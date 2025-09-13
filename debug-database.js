#!/usr/bin/env node

// 数据库调试工具
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

console.log('🔍 数据库调试工具')
console.log('==================')

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`)
    exec(command, { cwd: path.join(process.cwd(), 'src-tauri') }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 错误:', error.message)
        reject(error)
        return
      }
      if (stderr) {
        console.log('⚠️  警告:', stderr)
      }
      console.log('✅ 结果:')
      console.log(stdout)
      resolve(stdout)
    })
  })
}

async function debugDatabase() {
  try {
    // 1. 检查数据库文件
    console.log('📂 检查数据库文件...')
    const fs = require('fs')
    const dbPath = path.join(__dirname, 'src-tauri', 'xily.db')

    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath)
      console.log(`✅ 数据库文件存在: ${dbPath}`)
      console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)} KB`)
      console.log(`🕐 最后修改: ${stats.mtime.toLocaleString()}`)
    } else {
      console.log('❌ 数据库文件不存在')
      return
    }

    // 2. 检查数据库表结构
    await runCommand('sqlite3 xily.db ".tables"', '检查数据库表')

    // 3. 检查works表数据
    await runCommand('sqlite3 xily.db "SELECT * FROM works;"', '检查作品数据')

    // 4. 检查time_records表数据
    await runCommand('sqlite3 xily.db "SELECT * FROM time_records ORDER BY start_time DESC LIMIT 10;"', '检查时间记录')

    // 5. 检查timer_sessions表数据
    await runCommand('sqlite3 xily.db "SELECT * FROM timer_sessions ORDER BY start_time DESC LIMIT 10;"', '检查计时会话')

    // 6. 检查特定作品的时间记录
    await runCommand('sqlite3 xily.db "SELECT work_id, COUNT(*) as count, SUM(duration) as total_duration FROM time_records GROUP BY work_id;"', '按作品分组统计时间记录')

    // 7. 测试分析查询
    await runCommand('sqlite3 xily.db "SELECT w.id, w.name, w.target_hours, COALESCE(SUM(tr.duration), 0) as total_minutes, COALESCE(COUNT(tr.id), 0) as session_count FROM works w LEFT JOIN time_records tr ON w.id = tr.work_id GROUP BY w.id, w.name, w.target_hours;"', '测试分析查询')

    console.log('\n🎯 调试完成!')

  } catch (error) {
    console.error('❌ 调试失败:', error)
  }
}

debugDatabase()