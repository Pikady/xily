import React, { useState, useEffect, useCallback } from 'react'
import { WorksAPI, TimerAPI, WindowAPI } from '@/services/api'
import { Work } from '@/types/work'
import { TimerSession } from '@/types/timer'

// 完整功能的悬浮窗组件
export function SimpleFloatWindow() {
  // 计时器状态
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25分钟
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'explore' | 'utilize'>('explore')
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null)

  // 作品状态
  const [works, setWorks] = useState<Work[]>([])
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingWorks, setLoadingWorks] = useState(true)

  // 加载作品列表
  useEffect(() => {
    const loadWorks = async () => {
      try {
        setLoadingWorks(true)
        const worksList = await WorksAPI.getAllWorks()
        setWorks(worksList)

        // 如果有作品，选择第一个
        if (worksList.length > 0) {
          setSelectedWorkId(worksList[0].id)
        }
      } catch (error) {
        console.error('加载作品列表失败:', error)
      } finally {
        setLoadingWorks(false)
      }
    }

    loadWorks()
  }, [])

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 时间到了，自动完成计时
            setIsRunning(false)
            handleCompleteTimer()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  // 格式化时间显示
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // 开始计时器
  const handleStartTimer = async () => {
    if (!selectedWorkId) {
      alert('请先选择一个作品')
      return
    }

    try {
      setLoading(true)

      // 调用后端API开始计时
      const session = await TimerAPI.startTimer({
        mode,
        workId: selectedWorkId,
        duration: 25 // 25分钟
      })

      setCurrentSession(session)
      setIsRunning(true)
      setTimeLeft(25 * 60)

      console.log('计时器已启动:', session)
    } catch (error) {
      console.error('启动计时器失败:', error)
      alert('启动计时器失败')
    } finally {
      setLoading(false)
    }
  }

  // 暂停计时器
  const handlePauseTimer = async () => {
    if (!currentSession) return

    try {
      setLoading(true)
      await TimerAPI.pauseTimer(currentSession.id)
      setIsRunning(false)
      console.log('计时器已暂停')
    } catch (error) {
      console.error('暂停计时器失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 恢复计时器
  const handleResumeTimer = async () => {
    if (!currentSession) return

    try {
      setLoading(true)
      await TimerAPI.resumeTimer(currentSession.id)
      setIsRunning(true)
      console.log('计时器已恢复')
    } catch (error) {
      console.error('恢复计时器失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 完成计时器
  const handleCompleteTimer = async () => {
    if (!currentSession) return

    try {
      setLoading(true)

      // 计算实际持续时间（分钟）
      const actualDuration = 25 - Math.floor(timeLeft / 60)

      // 调用后端API停止计时并保存记录
      const timeRecord = await TimerAPI.stopTimer(
        currentSession.id,
        selectedWorkId || 0,
        mode,
        actualDuration
      )

      console.log('计时记录已保存:', timeRecord)

      // 重置状态
      setCurrentSession(null)
      setTimeLeft(25 * 60)

      // 显示完成提示
      alert(`🎉 计时完成！已记录 ${actualDuration} 分钟到作品`)

    } catch (error) {
      console.error('保存计时记录失败:', error)
      alert('保存计时记录失败')
    } finally {
      setLoading(false)
    }
  }

  // 停止计时器
  const handleStopTimer = async () => {
    if (!currentSession) return

    try {
      setLoading(true)

      // 计算实际持续时间
      const actualDuration = 25 - Math.floor(timeLeft / 60)

      // 保存计时记录
      await TimerAPI.stopTimer(
        currentSession.id,
        selectedWorkId || 0,
        mode,
        actualDuration
      )

      // 重置状态
      setCurrentSession(null)
      setIsRunning(false)
      setTimeLeft(25 * 60)

      console.log('计时器已停止并保存')
    } catch (error) {
      console.error('停止计时器失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 切换模式
  const switchMode = () => {
    if (isRunning) {
      alert('请先停止计时器再切换模式')
      return
    }
    setMode(mode === 'explore' ? 'utilize' : 'explore')
  }

  // 关闭悬浮窗
  const handleCloseWindow = async () => {
    try {
      await WindowAPI.hideFloatWindow()
    } catch (error) {
      console.error('关闭悬浮窗失败:', error)
    }
  }

  // 计算进度百分比
  const progressPercentage = ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <div className="w-80 h-[480px] bg-white rounded-lg shadow-lg border-2 overflow-hidden">
      {/* 标题栏 */}
      <div
        className={`p-3 cursor-move flex items-center justify-between text-white font-medium`}
        style={{ backgroundColor: mode === 'explore' ? '#3b82f6' : '#f97316' }}
      >
        <span>{mode === 'explore' ? '探索模式' : '利用模式'}</span>
        <div className="flex gap-2">
          <button
            onClick={switchMode}
            disabled={isRunning || loading}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded disabled:opacity-50"
          >
            切换
          </button>
          <button
            onClick={handleCloseWindow}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 作品选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">选择作品：</label>
          {loadingWorks ? (
            <div className="w-full p-2 border rounded-lg bg-gray-50">加载中...</div>
          ) : (
            <select
              value={selectedWorkId || ''}
              onChange={(e) => setSelectedWorkId(Number(e.target.value))}
              disabled={isRunning || loading}
              className="w-full p-2 border rounded-lg disabled:opacity-50"
            >
              {works.length === 0 ? (
                <option value="">暂无作品</option>
              ) : (
                works.map(work => (
                  <option key={work.id} value={work.id}>
                    {work.name}
                  </option>
                ))
              )}
            </select>
          )}
        </div>

        {/* 计时器显示 */}
        <div className="text-center">
          <div className="text-5xl font-mono font-bold mb-4">
            {formatTime(timeLeft)}
          </div>

          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* 控制按钮 */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                disabled={!selectedWorkId || loading}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? '启动中...' : '开始'}
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseTimer}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  暂停
                </button>
                <button
                  onClick={handleStopTimer}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  停止
                </button>
              </>
            )}
          </div>
        </div>

        {/* 状态信息 */}
        <div className="text-xs text-gray-500 text-center">
          {currentSession ? (
            <div>
              计时中：{mode === 'explore' ? '探索模式' : '利用模式'}
            </div>
          ) : selectedWorkId ? (
            <div>
              已选择：{works.find(w => w.id === selectedWorkId)?.name}
            </div>
          ) : (
            <div>请选择作品开始计时</div>
          )}
        </div>
      </div>
    </div>
  )
}