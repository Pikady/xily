import { useState, useEffect } from 'react'
import { WindowAPI } from '@/services/api'

interface Position {
  x: number
  y: number
}

interface FloatWindowManager {
  isVisible: boolean
  position: Position
  showFloatWindow: () => Promise<void>
  hideFloatWindow: () => Promise<void>
  toggleFloatWindow: () => Promise<void>
  expandFloatWindow: () => void
  setFloatWindowPosition: (x: number, y: number) => Promise<void>
}

export const useFloatWindow = (): FloatWindowManager => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 })

  // 初始化悬浮窗状态
  useEffect(() => {
    const initFloatWindow = async () => {
      try {
        const visible = await WindowAPI.isFloatWindowVisible()
        setIsVisible(visible)
        
        const pos = await WindowAPI.getFloatWindowPosition()
        if (pos) {
          setPosition(pos)
        }
      } catch (error) {
        console.error('初始化悬浮窗状态失败:', error)
      }
    }
    
    initFloatWindow()
  }, [])

  // 显示悬浮窗
  const showFloatWindow = async () => {
    try {
      await WindowAPI.showFloatWindow()
      setIsVisible(true)
    } catch (error) {
      console.error('显示悬浮窗失败:', error)
    }
  }

  // 隐藏悬浮窗
  const hideFloatWindow = async () => {
    try {
      await WindowAPI.hideFloatWindow()
      setIsVisible(false)
    } catch (error) {
      console.error('隐藏悬浮窗失败:', error)
    }
  }

  // 切换悬浮窗显示状态
  const toggleFloatWindow = async () => {
    try {
      await WindowAPI.toggleFloatWindow()
      setIsVisible(prev => !prev)
    } catch (error) {
      console.error('切换悬浮窗失败:', error)
    }
  }

  // 设置悬浮窗位置
  const setFloatWindowPosition = async (x: number, y: number) => {
    try {
      await WindowAPI.setFloatWindowPosition(x, y)
      setPosition({ x, y })
    } catch (error) {
      console.error('设置悬浮窗位置失败:', error)
    }
  }

  // 展开悬浮窗（跳转到完整页面）
  const expandFloatWindow = () => {
    // 这里可以添加跳转到计时器页面的逻辑
    window.location.href = '/timer'
  }

  return {
    isVisible,
    position,
    showFloatWindow,
    hideFloatWindow,
    toggleFloatWindow,
    expandFloatWindow,
    setFloatWindowPosition
  }
}

export default useFloatWindow