import { useState, useEffect } from 'react'

interface FloatWindowManager {
  isVisible: boolean
  showFloatWindow: () => void
  hideFloatWindow: () => void
  toggleFloatWindow: () => void
  expandFloatWindow: () => void
}

export const useFloatWindow = (): FloatWindowManager => {
  const [isVisible, setIsVisible] = useState(false)

  // 从localStorage恢复状态
  useEffect(() => {
    const savedState = localStorage.getItem('float-window-visible')
    if (savedState !== null) {
      setIsVisible(savedState === 'true')
    }
  }, [])

  // 保存状态到localStorage
  useEffect(() => {
    localStorage.setItem('float-window-visible', isVisible.toString())
  }, [isVisible])

  // 显示悬浮窗
  const showFloatWindow = () => {
    setIsVisible(true)
  }

  // 隐藏悬浮窗
  const hideFloatWindow = () => {
    setIsVisible(false)
  }

  // 切换悬浮窗显示状态
  const toggleFloatWindow = () => {
    setIsVisible(prev => !prev)
  }

  // 展开悬浮窗（跳转到完整页面）
  const expandFloatWindow = () => {
    // 这里可以添加跳转到计时器页面的逻辑
    window.location.href = '/timer'
  }

  return {
    isVisible,
    showFloatWindow,
    hideFloatWindow,
    toggleFloatWindow,
    expandFloatWindow
  }
}

export default useFloatWindow