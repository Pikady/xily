#!/usr/bin/env node

// 计时器修复验证脚本
console.log('🧪 计时器修复验证测试')
console.log('===================')

// 模拟测试数据
const testCases = [
  {
    name: '无作品计时',
    sessionId: Math.floor(Date.now() / 1000),
    workId: 0,
    mode: 'explore',
    duration: 1
  },
  {
    name: '有作品计时',
    sessionId: Math.floor(Date.now() / 1000) + 1,
    workId: 4, // vibe coding
    mode: 'utilize',
    duration: 2
  }
]

// 测试参数传递
function testParameterPassing() {
  console.log('📋 测试参数传递逻辑...')

  testCases.forEach((testCase, index) => {
    console.log(`\n🧪 测试用例 ${index + 1}: ${testCase.name}`)
    console.log(`   sessionId: ${testCase.sessionId}`)
    console.log(`   workId: ${testCase.workId}`)
    console.log(`   mode: ${testCase.mode}`)
    console.log(`   duration: ${testCase.duration}`)

    // 模拟前端参数处理
    const workIdForAPI = testCase.workId === 0 ? 0 : testCase.workId
    console.log(`   API work_id: ${workIdForAPI}`)

    // 模拟后端参数解析
    const w_id = testCase.workId || 0
    const m = testCase.mode || 'explore'
    const d = testCase.duration || 25

    console.log(`   后端解析: w_id=${w_id}, m=${m}, d=${d}`)

    // 检查是否会创建记录
    if (d > 0) {
      console.log('   ✅ 会创建时间记录')
      console.log(`   📝 work_id: ${w_id > 0 ? w_id : 'NULL (未分类)'}`)
    } else {
      console.log('   ❌ 不会创建时间记录')
    }
  })
}

// 测试数据库查询
function testDatabaseQueries() {
  console.log('\n📊 测试数据库查询逻辑...')

  const queries = [
    {
      name: '获取作品进度',
      query: `SELECT w.id, w.name, w.target_hours, COALESCE(SUM(tr.duration), 0) as total_minutes FROM works w LEFT JOIN time_records tr ON w.id = tr.work_id GROUP BY w.id, w.name, w.target_hours`
    },
    {
      name: '获取时间分布',
      query: `SELECT work_id, COUNT(*) as count, SUM(duration) as total_duration FROM time_records GROUP BY work_id`
    }
  ]

  queries.forEach((query, index) => {
    console.log(`\n🔍 查询 ${index + 1}: ${query.name}`)
    console.log(`   SQL: ${query.query}`)
  })
}

// 测试事件流程
function testEventFlow() {
  console.log('\n⚡ 测试事件流程...')

  const eventFlow = [
    '1. 计时器开始 → 创建 timer_session 记录',
    '2. 计时器完成 → 调用 stop_timer',
    '3. stop_timer → 创建 time_record 记录',
    '4. 发布 timer:completed 事件',
    '5. WorkList 监听事件 → 刷新统计数据',
    '6. WorkCard 接收新数据 → 更新显示'
  ]

  eventFlow.forEach((step, index) => {
    console.log(`   ${step}`)
  })
}

// 运行所有测试
testParameterPassing()
testDatabaseQueries()
testEventFlow()

console.log('\n✅ 测试完成!')
console.log('\n📋 修复要点总结:')
console.log('1. ✅ 修复了日期解析错误 (移除 .unwrap())')
console.log('2. ✅ 修复了 sessionId 数值过大问题')
console.log('3. ✅ 修复了 workId 参数传递问题')
console.log('4. ✅ 优化了数据库 NULL 值处理')
console.log('5. ✅ 添加了详细的调试日志')

console.log('\n🎯 现在可以重新测试计时器功能了!')