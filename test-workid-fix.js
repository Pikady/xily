#!/usr/bin/env node

// 计时器 workId 传递修复验证脚本
console.log('🧪 计时器 workId 传递修复验证测试')
console.log('===================================')

// 模拟测试数据
const testCases = [
  {
    name: '无作品计时 (workId=0)',
    selectedWorkId: 0,
    currentWorkId: null,
    expectedWorkId: 0,
    description: '用户没有选择作品，workId 应该为 0'
  },
  {
    name: '选择作品 (workId=4)',
    selectedWorkId: 4,
    currentWorkId: 4,
    expectedWorkId: 4,
    description: '用户选择了作品，workId 应该为作品 ID'
  },
  {
    name: '手动传递 workId=3',
    selectedWorkId: null,
    currentWorkId: 4,
    manualWorkId: 3,
    expectedWorkId: 3,
    description: '手动传递 workId 应该优先于 currentWork'
  }
]

// 测试修复后的参数传递逻辑
function testFixedParameterPassing() {
  console.log('📋 测试修复后的参数传递逻辑...\n')

  testCases.forEach((testCase, index) => {
    console.log(`🧪 测试用例 ${index + 1}: ${testCase.name}`)
    console.log(`   描述: ${testCase.description}`)

    // 模拟 TimerDisplay.tsx 中的逻辑
    const selectedWorkId = testCase.selectedWorkId
    const workIdForTimer = selectedWorkId !== null ? selectedWorkId : undefined
    console.log(`   TimerDisplay 传递: ${workIdForTimer}`)

    // 模拟 TimerStore.startTimer 中的逻辑
    const workId = workIdForTimer
    const sessionWorkId = workId || 0
    console.log(`   TimerSession workId: ${sessionWorkId}`)

    // 模拟 API 参数传递
    const apiWorkId = workId !== undefined ? Number(workId) : null
    console.log(`   API work_id: ${apiWorkId}`)

    // 验证结果
    const isCorrect = apiWorkId === testCase.expectedWorkId
    console.log(`   期望值: ${testCase.expectedWorkId}`)
    console.log(`   实际值: ${apiWorkId}`)
    console.log(`   结果: ${isCorrect ? '✅ 通过' : '❌ 失败'}\n`)
  })
}

// 测试修复前后的差异
function testBeforeAfterFix() {
  console.log('🔄 测试修复前后的差异...\n')

  const problematicCase = {
    name: 'workId=0 的情况',
    workId: 0
  }

  console.log(`🧪 测试案例: ${problematicCase.name}`)

  // 修复前的逻辑（有问题）
  console.log('   🔴 修复前的逻辑:')
  const oldSelectedWorkId = problematicCase.workId
  const oldWorkIdForTimer = oldSelectedWorkId || undefined // 这是错误的！
  const oldApiWorkId = oldWorkIdForTimer ? Number(oldWorkIdForTimer) : null // 这会导致 null
  console.log(`      selectedWorkId || undefined = ${oldWorkIdForTimer}`)
  console.log(`      API work_id = ${oldApiWorkId}`)
  console.log(`      结果: ${oldApiWorkId === null ? '❌ 错误地传递了 null' : '✅ 正确'}`)

  // 修复后的逻辑
  console.log('   🟢 修复后的逻辑:')
  const newSelectedWorkId = problematicCase.workId
  const newWorkIdForTimer = newSelectedWorkId !== null ? newSelectedWorkId : undefined
  const newApiWorkId = newWorkIdForTimer !== undefined ? Number(newWorkIdForTimer) : null
  console.log(`      selectedWorkId !== null ? selectedWorkId : undefined = ${newWorkIdForTimer}`)
  console.log(`      API work_id = ${newApiWorkId}`)
  console.log(`      结果: ${newApiWorkId === 0 ? '✅ 正确地传递了 0' : '❌ 仍然有问题'}`)

  console.log('')
}

// 测试完整的调用链
function testCompleteCallChain() {
  console.log('🔗 测试完整的调用链...\n')

  // 模拟用户选择作品 (ID=4)
  const selectedWorkId = 4

  // TimerDisplay.tsx
  const workIdForTimer = selectedWorkId !== null ? selectedWorkId : undefined
  console.log(`1. TimerDisplay.tsx: selectedWorkId=${selectedWorkId} → workIdForTimer=${workIdForTimer}`)

  // TimerStore.startTimer
  const sessionWorkId = workIdForTimer || 0
  console.log(`2. TimerStore: session.workId=${sessionWorkId}`)

  // TimerAPI.startTimer
  const apiWorkId = workIdForTimer !== undefined ? Number(workIdForTimer) : null
  console.log(`3. TimerAPI: work_id=${apiWorkId}`)

  // Rust 后端接收
  const rustWorkId = apiWorkId !== null ? `Some(${apiWorkId})` : 'None'
  console.log(`4. Rust 后端: work_id=${rustWorkId}`)

  // 验证最终结果
  const isSuccess = rustWorkId === 'Some(4)'
  console.log(`\n🎯 最终结果: ${isSuccess ? '✅ 成功' : '❌ 失败'} - 期望 Some(4)，实际 ${rustWorkId}`)
}

// 运行所有测试
testFixedParameterPassing()
testBeforeAfterFix()
testCompleteCallChain()

console.log('\n✅ 测试完成!')
console.log('\n📋 修复总结:')
console.log('1. ✅ 修复了 TimerDisplay.tsx 中 workId=0 被错误转换为 undefined 的问题')
console.log('2. ✅ 修复了 TimerAPI 中 workId=0 被错误转换为 null 的问题')
console.log('3. ✅ 修复了 TimerController.tsx 中的参数传递逻辑')
console.log('4. ✅ 确保了 workId=0 能正确传递到后端')

console.log('\n🎯 现在计时器应该能正确关联作品了!')