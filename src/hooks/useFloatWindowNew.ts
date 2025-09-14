import { useState, useEffect, useCallback } from 'react'
import { WindowAPI } from '@/services/api'
import { useFloatWindowStore } from '@/components/float/FloatWindowStore'

interface Position {
  x: number
  y: number
}

interface FloatWindowManager {
  isVisible: boolean
  position: Position
  isMinimized: boolean
  showFloatWindow: () => Promise<void>
  hideFloatWindow: () => Promise<void>
  toggleFloatWindow: () => Promise<void>
  expandFloatWindow: () => void
  setFloatWindowPosition: (x: number, y: number) => Promise<void>
  minimizeFloatWindow: () => void
  maximizeFloatWindow: () => void
}

export const useFloatWindowNew = (): FloatWindowManager => {
  const {
    isVisible,
    isMinimized,
    position,
    setVisible,
    setMinimized,
    setPosition
  } = useFloatWindowStore()

  // 初始化悬浮窗状态
  useEffect(() => {
    const initFloatWindow = async () => {
      try {
        const visible = await WindowAPI.isFloatWindowVisible()
        setVisible(visible)

        const savedPosition = await WindowAPI.getFloatWindowPosition()
        if (savedPosition) {
          setPosition(savedPosition.x, savedPosition.y)
        }
      } catch (error) {
        console.error('初始化悬浮窗状态失败:', error)
      }
    }

    initFloatWindow()
  }, [setVisible, setPosition])

  // 显示悬浮窗
  const showFloatWindow = useCallback(async () => {
    try {
      await WindowAPI.showFloatWindow()
      setVisible(true)
    } catch (error) {
      console.error('显示悬浮窗失败:', error)
    }
  }, [setVisible])

  // 隐藏悬浮窗
  const hideFloatWindow = useCallback(async () => {
    try {
      await WindowAPI.hideFloatWindow()
      setVisible(false)
    } catch (error) {
      console.error('隐藏悬浮窗失败:', error)
    }
  }, [setVisible])

  // 切换悬浮窗显示状态
  const toggleFloatWindow = useCallback(async () => {
    try {
      await WindowAPI.toggleFloatWindow()
      const visible = await WindowAPI.isFloatWindowVisible()
      setVisible(visible)
    } catch (error) {
      console.error('切换悬浮窗失败:', error)
    }
  }, [setVisible])

  // 设置悬浮窗位置
  const setFloatWindowPosition = useCallback(async (x: number, y: number) => {
    try {
      await WindowAPI.setFloatWindowPosition(x, y)
      setPosition(x, y)
    } catch (error) {
      console.error('设置悬浮窗位置失败:', error)
    }
  }, [setPosition])

  // 最小化悬浮窗
  const minimizeFloatWindow = useCallback(() => {
    setMinimized(true)
  }, [setMinimized])

  // 最大化悬浮窗
  const maximizeFloatWindow = useCallback(() => {
    setMinimized(false)
  }, [setMinimized])

  // 展开悬浮窗（跳转到完整页面）
  const expandFloatWindow = useCallback(() => {
    // 这里可以添加跳转到计时器页面的逻辑
    window.location.href = '/timer'
  }, [])

  return {
    isVisible,
    position,
    isMinimized,
    showFloatWindow,
    hideFloatWindow,
    toggleFloatWindow,
    expandFloatWindow,
    setFloatWindowPosition,
    minimizeFloatWindow,
    maximizeFloatWindow
  }
}

export default useFloatWindowNew