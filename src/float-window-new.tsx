import React from 'react'
import { createRoot } from 'react-dom/client'
import { FloatWindowManager } from './components/float'
import './styles/globals.css'

// 悬浮窗应用入口
const FloatWindowApp = () => {
  const handleExpand = () => {
    // 跳转到主应用界面
    window.location.href = '/'
  }

  return (
    <FloatWindowManager onExpand={handleExpand} />
  )
}

// 初始化悬浮窗
const container = document.getElementById('float-root')
if (container) {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <FloatWindowApp />
    </React.StrictMode>
  )
} else {
  console.error('找不到悬浮窗根元素 #float-root')
}