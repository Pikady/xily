import React from 'react'
import { createRoot } from 'react-dom/client'
import { FloatWindowApp } from './components/float/FloatWindowApp'
import './styles/globals.css'

// 初始化悬浮窗应用
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