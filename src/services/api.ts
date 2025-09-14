import { invoke } from '@tauri-apps/api/core'
import { Work, WorkStats } from '@/types/work'
import { TimerSession, TimerConfig } from '@/types/timer'
import { ExportData, TimeRecord, TimeDistribution, DailyStats, WeeklyStats, MonthlyStats, TrendData, AnalyticsFilters, ExportFormat } from '@/types/analytics'
import { WorkFormData, AnalyticsData } from '@/types/frontend'
import { errorHandler, ErrorCodes, ErrorCategory } from '@/errors/ErrorHandler'

// API响应基础类型
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// API错误类型
export interface APIError {
  code: string
  message: string
  details?: any
}

// API配置
const API_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
}

// Tauri命令调用包装器
async function tauriInvoke<T>(command: string, args?: any): Promise<T> {
  console.log(`🔍 调用 Tauri 命令: ${command}`, args)
  return await errorHandler.withErrorHandling(async () => {
    try {
      const result = await invoke<T>(command, args)
      console.log(`✅ Tauri 命令 ${command} 成功返回`, result)
      return result
    } catch (invokeError) {
      console.error(`❌ Tauri 命令 ${command} 调用失败:`, invokeError)
      console.error(`参数:`, args)
      throw invokeError
    }
  }, {
    code: ErrorCodes.API_ERROR,
    message: `Tauri命令调用失败: ${command}`,
    category: ErrorCategory.API,
    source: 'api.tauriInvoke'
  })
}

// 作品相关API
export class WorksAPI {
  // 获取所有作品
  static async getAllWorks(): Promise<Work[]> {
    return tauriInvoke<Work[]>('get_works')
  }

  // 获取单个作品
  static async getWork(id: string): Promise<Work> {
    return tauriInvoke<Work>('get_work', { id: parseInt(id) })
  }

  // 创建作品
  static async createWork(workData: WorkFormData): Promise<Work> {
    return tauriInvoke<Work>('create_work', { 
      name: workData.name,
      description: workData.description,
      color: workData.color,
      target_hours: workData.target_hours
    })
  }

  // 更新作品
  static async updateWork(id: string, workData: Partial<WorkFormData>): Promise<Work> {
    // 先取现有作品，补全必填字段
    const existingWork = await WorksAPI.getWork(id)

    // 构造与后端 Rust `Work` 结构相匹配的负载（不包含前端专用的 is_deleted 字段）
    const workPayload = {
      id: parseInt(id),
      name: workData.name ?? existingWork.name,
      description: workData.description !== undefined ? workData.description : existingWork.description,
      color: workData.color !== undefined ? workData.color : existingWork.color,
      target_hours: workData.target_hours !== undefined ? workData.target_hours : existingWork.target_hours,
      // 这两个在后端是 Option 类型，传 null 由后端按需维护
      created_at: null,
      updated_at: null,
      is_archived: existingWork.is_archived
    }

    return tauriInvoke<Work>('update_work', { work: workPayload })
  }

  // 删除作品
  static async deleteWork(id: string): Promise<void> {
    return tauriInvoke<void>('delete_work', { id: parseInt(id) })
  }

  // 归档作品
  static async archiveWork(id: string): Promise<void> {
    return tauriInvoke<void>('archive_work', { id: parseInt(id) })
  }

  // 取消归档作品
  static async unarchiveWork(id: string): Promise<void> {
    return tauriInvoke<void>('unarchive_work', { id: parseInt(id) })
  }

  // 获取作品统计
  static async getWorkStats(id: string): Promise<WorkStats> {
    // 使用与 get_work_progress 相同的参数名 workId
    return tauriInvoke<WorkStats>('get_work_stats', { workId: parseInt(id) })
  }

  // 获取所有作品统计
  static async getAllWorksStats(): Promise<WorkStats[]> {
    return tauriInvoke<WorkStats[]>('get_all_works_stats')
  }
}

// 计时器相关API
export class TimerAPI {
  // 开始计时
  static async startTimer(data: {
    mode: 'explore' | 'utilize'
    workId?: number
    duration: number
  }): Promise<TimerSession> {
    // 确保参数格式正确
    const work_id = data.workId !== undefined ? Number(data.workId) : null
    const mode = String(data.mode)
    const duration = Number(data.duration)
    
    const args = { work_id, mode, duration }
    console.log('startTimer args:', args)
    console.log('work_id type:', typeof work_id, 'value:', work_id)
    console.log('mode type:', typeof mode, 'value:', mode)
    console.log('duration type:', typeof duration, 'value:', duration)
    
    return tauriInvoke<TimerSession>('start_timer', args)
  }

  // 暂停计时
  static async pauseTimer(sessionId: number): Promise<boolean> {
    return tauriInvoke<boolean>('pause_timer', { session_id: sessionId })
  }

  // 恢复计时
  static async resumeTimer(sessionId: number): Promise<boolean> {
    return tauriInvoke<boolean>('resume_timer', { session_id: sessionId })
  }

  // 停止计时
  static async stopTimer(sessionId: number, workId?: number, mode?: string, duration?: number): Promise<TimeRecord | null> {
    // 确保参数类型正确，使用后端期望的camelCase参数名
    const params = {
      sessionId: Number(sessionId),
      workId: Number(workId) || 0, // 如果没有workId，使用0
      mode: String(mode || 'explore'),
      duration: Number(duration) || 25
    }

    console.log('stopTimer params:', params)
    console.log('sessionId type:', typeof params.sessionId, 'value:', params.sessionId)
    console.log('workId type:', typeof params.workId, 'value:', params.workId)

    return tauriInvoke<TimeRecord | null>('stop_timer', params)
  }

  // 获取计时器配置
  static async getTimerConfig(): Promise<TimerConfig> {
    return tauriInvoke<TimerConfig>('get_timer_config')
  }

  // 更新计时器配置
  static async updateTimerConfig(config: Partial<TimerConfig>): Promise<TimerConfig> {
    // 构建完整的配置对象，使用后端期望的蛇形命名法
    const completeConfig = {
      focus_duration: config.focusDuration ?? 25,
      short_break: config.shortBreak ?? 5,
      long_break: config.longBreak ?? 15,
      auto_start_breaks: config.autoStartBreaks ?? false,
      auto_start_pomodoros: config.autoStartPomodoros ?? false
    }

    // 后端期望参数被包装在 config 对象中
    return tauriInvoke<TimerConfig>('save_timer_config', { config: completeConfig })
  }

  // 获取计时历史
  static async getTimerHistory(workId?: number): Promise<TimerSession[]> {
    const args = {
      work_id: workId,
      limit: null
    }
    return tauriInvoke<TimerSession[]>('get_timer_sessions', args)
  }
}

// 分析相关API
export class AnalyticsAPI {
  // 获取时间记录
  static async getTimeRecords(filters?: AnalyticsFilters): Promise<TimeRecord[]> {
    // 后端暂未提供 get_time_records 命令，先返回空数组以保证前端稳定
    return Promise.resolve([] as TimeRecord[])
  }

  // 获取时间分布
  static async getTimeDistribution(filters?: AnalyticsFilters): Promise<TimeDistribution[]> {
    // 后端实际提供的是 get_work_time_distribution
    const workId = filters?.work_ids && filters.work_ids.length > 0 ? filters.work_ids[0] : undefined
    const startDate = filters?.date_range?.start
    const endDate = filters?.date_range?.end

    // 直接复用后端统计接口
    const result = await tauriInvoke<any[]>('get_work_time_distribution', {
      workId,
      startDate,
      endDate
    })

    // 尝试映射为 TimeDistribution 结构（若后端字段一致则直接返回）
    return (result || []).map((r: any) => ({
      work_id: r.work_id ?? r.workId ?? r.id,
      work_name: r.work_name ?? r.workName ?? r.name,
      work_color: r.work_color ?? r.workColor ?? r.color,
      explore_time: r.explore_time ?? 0,
      utilize_time: r.utilize_time ?? 0,
      total_time: r.total_time ?? r.totalTime ?? 0,
      percentage: r.percentage ?? 0
    })) as TimeDistribution[]
  }

  // 获取每日统计
  static async getDailyStats(filtersOrDays?: AnalyticsFilters | number): Promise<DailyStats[]> {
    let days = 30
    if (typeof filtersOrDays === 'number') {
      days = filtersOrDays
    } else if (filtersOrDays && filtersOrDays.date_range?.start && filtersOrDays.date_range?.end) {
      const start = new Date(filtersOrDays.date_range.start)
      const end = new Date(filtersOrDays.date_range.end)
      const diff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      days = diff
    }
    return tauriInvoke<DailyStats[]>('get_daily_stats', { days })
  }

  // 目前后端未提供周/月统计命令，这里先返回空数组以保证前端不崩溃
  static async getWeeklyStats(_filters?: AnalyticsFilters): Promise<WeeklyStats[]> {
    return Promise.resolve([] as WeeklyStats[])
  }

  static async getMonthlyStats(_filters?: AnalyticsFilters): Promise<MonthlyStats[]> {
    return Promise.resolve([] as MonthlyStats[])
  }

  // 获取工作时间分布
  static async getWorkTimeDistribution(workId?: number, startDate?: string, endDate?: string): Promise<any[]> {
    return tauriInvoke<any[]>('get_work_time_distribution', { 
      workId: workId, 
      startDate: startDate, 
      endDate: endDate 
    })
  }

  // 获取模式分布
  static async getModeDistribution(startDate?: string, endDate?: string): Promise<any> {
    return tauriInvoke<any>('get_mode_distribution', { 
      startDate: startDate, 
      endDate: endDate 
    })
  }

  // 获取工作进度
  static async getWorkProgress(workId: number): Promise<any> {
    return tauriInvoke<any>('get_work_progress', { workId: workId })
  }

  // 获取生产力趋势
  static async getProductivityTrends(days: number = 30): Promise<any[]> {
    return tauriInvoke<any[]>('get_productivity_trends', { days })
  }

  // 获取趋势数据
  static async getTrendData(filters?: AnalyticsFilters): Promise<TrendData[]> {
    // 后端暂未提供 get_trend_data 命令，先返回空数组以保证前端稳定
    return Promise.resolve([] as TrendData[])
  }

  // 导出数据
  static async exportData(workId?: number, startDate?: string, endDate?: string): Promise<any> {
    return tauriInvoke<any>('export_data', { 
      workId: workId, 
      startDate: startDate, 
      endDate: endDate 
    })
  }

  // 获取分析数据（兼容旧接口）
  static async getAnalytics(params: {
    startDate?: string
    endDate?: string
    workId?: number
    mode?: 'explore' | 'utilize'
  }): Promise<AnalyticsData> {
    // 兼容旧接口：组合已有接口返回结构化数据
    const filters: AnalyticsFilters = {
      date_range: {
        start: params.startDate || '',
        end: params.endDate || ''
      },
      work_ids: params.workId ? [params.workId] : undefined,
      modes: params.mode ? [params.mode] : undefined
    }
    const [distribution, daily] = await Promise.all([
      AnalyticsAPI.getTimeDistribution(filters),
      AnalyticsAPI.getDailyStats(filters)
    ])

    const timeDistribution = distribution.map(d => ({
      workId: d.work_id,
      workName: d.work_name,
      workColor: d.work_color,
      exploreTime: d.explore_time ?? 0,
      utilizeTime: d.utilize_time ?? 0,
      totalTime: d.total_time,
      percentage: d.percentage ?? 0
    }))

    const dailyStats = daily.map(d => ({
      date: d.date,
      totalTime: d.total_time,
      exploreTime: d.explore_time,
      utilizeTime: d.utilize_time,
      sessionCount: d.session_count,
      completedSessions: d.completed_sessions ?? 0
    }))

    const summary = {
      totalTime: dailyStats.reduce((s, x) => s + x.totalTime, 0),
      exploreTime: dailyStats.reduce((s, x) => s + x.exploreTime, 0),
      utilizeTime: dailyStats.reduce((s, x) => s + x.utilizeTime, 0),
      sessionCount: dailyStats.reduce((s, x) => s + x.sessionCount, 0),
      completionRate: 0
    }

    return { timeDistribution, dailyStats, summary }
  }
}

// 兼容命名导出：与 store 中的 `import { analyticsAPI }` 对齐
export const analyticsAPI = AnalyticsAPI;

// 应用设置API
export class SettingsAPI {
  // 获取应用设置
  static async getSettings(): Promise<any> {
    return tauriInvoke<any>('get_settings')
  }

  // 更新应用设置
  static async updateSettings(settings: any): Promise<any> {
    return tauriInvoke<any>('update_settings', { settings })
  }

  // 获取用户偏好
  static async getPreferences(): Promise<any> {
    return tauriInvoke<any>('get_preferences')
  }

  // 更新用户偏好
  static async updatePreferences(preferences: any): Promise<any> {
    return tauriInvoke<any>('update_preferences', { preferences })
  }

  // 备份数据
  static async backupData(): Promise<string> {
    return tauriInvoke<string>('backup_data')
  }

  // 恢复数据
  static async restoreData(backupPath: string): Promise<void> {
    return tauriInvoke<void>('restore_data', { backupPath })
  }
}

// 系统API
export class SystemAPI {
  // 检查更新
  static async checkForUpdates(): Promise<any> {
    return tauriInvoke<any>('check_for_updates')
  }

  // 下载更新
  static async downloadUpdate(): Promise<void> {
    return tauriInvoke<void>('download_update')
  }

  // 安装更新
  static async installUpdate(): Promise<void> {
    return tauriInvoke<void>('install_update')
  }

  // 获取系统信息
  static async getSystemInfo(): Promise<any> {
    return tauriInvoke<any>('get_system_info')
  }

  // 获取应用版本
  static async getAppVersion(): Promise<string> {
    return tauriInvoke<string>('get_app_version')
  }

  // 获取应用名称
  static async getAppName(): Promise<string> {
    return tauriInvoke<string>('get_app_name')
  }

  // 退出应用
  static async quitApp(): Promise<void> {
    return tauriInvoke<void>('quit_app')
  }

  // 显示通知
  static async showNotification(title: string, body: string): Promise<void> {
    return tauriInvoke<void>('show_notification', { title, body })
  }
}

// 窗口管理API
export class WindowAPI {
  // 显示主窗口
  static async showMainWindow(): Promise<void> {
    return tauriInvoke<void>('show_main_window')
  }

  // 隐藏主窗口
  static async hideMainWindow(): Promise<void> {
    return tauriInvoke<void>('hide_main_window')
  }

  // 切换悬浮窗
  static async toggleFloatWindow(): Promise<void> {
    return tauriInvoke<void>('toggle_float_window')
  }

  // 显示悬浮窗
  static async showFloatWindow(): Promise<void> {
    return tauriInvoke<void>('show_float_window')
  }

  // 隐藏悬浮窗
  static async hideFloatWindow(): Promise<void> {
    return tauriInvoke<void>('hide_float_window')
  }

  // 最小化主窗口
  static async minimizeMainWindow(): Promise<void> {
    return tauriInvoke<void>('minimize_main_window')
  }

  // 最大化主窗口
  static async maximizeMainWindow(): Promise<void> {
    return tauriInvoke<void>('maximize_main_window')
  }

  // 设置悬浮窗位置
  static async setFloatWindowPosition(x: number, y: number): Promise<void> {
    return tauriInvoke<void>('set_float_window_position', { x, y })
  }

  // 获取悬浮窗位置
  static async getFloatWindowPosition(): Promise<{ x: number; y: number } | null> {
    return tauriInvoke<{ x: number; y: number } | null>('get_float_window_position')
  }

  // 检查悬浮窗是否可见
  static async isFloatWindowVisible(): Promise<boolean> {
    return tauriInvoke<boolean>('is_float_window_visible')
  }

  // 调整悬浮窗尺寸
  static async resizeFloatWindow(width: number, height: number): Promise<void> {
    return tauriInvoke<void>('resize_float_window', { width, height })
  }

  // 检查主窗口是否可见
  static async isMainWindowVisible(): Promise<boolean> {
    return tauriInvoke<boolean>('is_main_window_visible')
  }
}

// 错误处理
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

