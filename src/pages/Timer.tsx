import { useState, useEffect } from 'react'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { TimerController } from '@/components/timer/TimerController'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWorks } from '@/hooks/useWorks'
import { useTimer } from '@/hooks/useTimer'
import { on } from '@/events/EventBus'
import {
  Clock,
  Settings,
  Target,
  BookOpen,
  Zap,
  TrendingUp
} from 'lucide-react'

export default function Timer() {
  const { currentWork, activeWorks, selectWork, fetchWorks } = useWorks()
  const { timerConfig, updateTimerConfig } = useTimer()
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(
    currentWork?.id || null
  )

  // 监听计时器完成事件，刷新作品列表
  useEffect(() => {
    const unsubscribe = on('timer:completed', (event) => {
      console.log('Timer page received timer completed event')
      // 刷新作品列表以更新作品时间
      fetchWorks()
    })

    return () => {
      unsubscribe()
    }
  }, [fetchWorks])

  const handleWorkChange = (workId: string) => {
    const id = parseInt(workId)
    setSelectedWorkId(id)
    const work = activeWorks.find(w => w.id === id)
    if (work) {
      selectWork(work)
    }
  }

  const handleConfigChange = async (key: string, value: number) => {
    await updateTimerConfig({ [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* 计时器控制器 - 处理所有逻辑 */}
      <TimerController />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">计时器</h1>
          <p className="text-muted-foreground mt-1">
            专注时光，高效工作
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主计时器区域 */}
        <div className="lg:col-span-2">
          <TimerDisplay />
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 作品选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                当前作品
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedWorkId?.toString()} onValueChange={handleWorkChange}>
                <SelectTrigger>
                  <SelectValue placeholder="选择作品" />
                </SelectTrigger>
                <SelectContent>
                  {activeWorks.map((work) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      <div className="flex items-center gap-2">
                        {work.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: work.color }}
                          />
                        )}
                        {work.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {currentWork && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {currentWork.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentWork.color }}
                      />
                    )}
                    <span className="font-medium">{currentWork.name}</span>
                  </div>
                  {currentWork.description && (
                    <p className="text-sm text-muted-foreground">
                      {currentWork.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    目标: {currentWork.target_hours}小时
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 快速设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                快速设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">专注时长</label>
                <Select 
                  value={timerConfig.focusDuration.toString()} 
                  onValueChange={(value) => handleConfigChange('focusDuration', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1分钟 (测试)</SelectItem>
                    <SelectItem value="15">15分钟</SelectItem>
                    <SelectItem value="25">25分钟</SelectItem>
                    <SelectItem value="30">30分钟</SelectItem>
                    <SelectItem value="45">45分钟</SelectItem>
                    <SelectItem value="60">60分钟</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">短休息</label>
                <Select 
                  value={timerConfig.shortBreak.toString()} 
                  onValueChange={(value) => handleConfigChange('shortBreak', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3分钟</SelectItem>
                    <SelectItem value="5">5分钟</SelectItem>
                    <SelectItem value="10">10分钟</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">长休息</label>
                <Select 
                  value={timerConfig.longBreak.toString()} 
                  onValueChange={(value) => handleConfigChange('longBreak', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15分钟</SelectItem>
                    <SelectItem value="20">20分钟</SelectItem>
                    <SelectItem value="30">30分钟</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 模式说明 */}
          <Card>
            <CardHeader>
              <CardTitle>模式说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">探索模式</div>
                  <div className="text-sm text-muted-foreground">
                    知识学习、信息输入阶段，适合阅读、学习、研究
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">利用模式</div>
                  <div className="text-sm text-muted-foreground">
                    创作输出阶段，适合写作、编程、设计、创作
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export { Timer }