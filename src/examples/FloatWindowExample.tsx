import React from 'react'
import { Button } from '@/components/ui/button'
import { FloatWindowManager } from '@/components/float'
import { useFloatWindowNew } from '@/hooks/useFloatWindowNew'

export function FloatWindowExample() {
  const {
    isVisible,
    showFloatWindow,
    hideFloatWindow,
    toggleFloatWindow
  } = useFloatWindowNew()

  const handleExpand = () => {
    console.log('展开到主界面')
    // 这里可以跳转到主应用界面
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">悬浮窗示例</h2>

      <div className="space-x-2">
        <Button onClick={showFloatWindow}>
          显示悬浮窗
        </Button>
        <Button onClick={hideFloatWindow} variant="outline">
          隐藏悬浮窗
        </Button>
        <Button onClick={toggleFloatWindow} variant="secondary">
          切换悬浮窗
        </Button>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm">
          当前悬浮窗状态: {isVisible ? '可见' : '隐藏'}
        </p>
      </div>

      {/* 悬浮窗组件 */}
      <FloatWindowManager onExpand={handleExpand} />
    </div>
  )
}