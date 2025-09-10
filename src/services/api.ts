import { invoke } from '@tauri-apps/api/core'
import { Work, WorkStats } from '@/types/work'
import { TimerSession, TimerConfig } from '@/types/timer'
import { ExportData, TimeRecord, TimeDistribution, DailyStats, WeeklyStats, MonthlyStats, TrendData, AnalyticsFilters, ExportFormat } from '@/types/analytics'
import { WorkFormData, AnalyticsData } from '@/types/frontend'

// API响应基础类型
interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// API错误类型
interface ApiError {
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
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    console.error(`Tauri命令调用失败: ${command}`, error)
    throw error
  }
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
    // 首先获取现有作品数据
    const existingWork = await WorksAPI.getWork(id)
    
    // 构造完整的Work对象
    const work: Work = {
      id: parseInt(id),
      name: workData.name || existingWork.name,
      description: workData.description !== undefined ? workData.description : existingWork.description,
      color: workData.color !== undefined ? workData.color : existingWork.color,
      target_hours: workData.targetHours !== undefined ? workData.targetHours : existingWork.target_hours,
      created_at: existingWork.created_at,
      updated_at: new Date(),
      is_archived: existingWork.is_archived
    }
    return tauriInvoke<Work>('update_work', work)
  }

  // 删除作品
  static async deleteWork(id: string): Promise<void> {
    return tauriInvoke<void>('delete_work', { id: parseInt(id) })
  }

  // 获取作品统计
  static async getWorkStats(id: string): Promise<WorkStats> {
    return tauriInvoke<WorkStats>('get_work_stats', { id: parseInt(id) })
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
    return tauriInvoke<TimerSession>('start_timer', { 
      work_id: data.workId, // 现在支持可选的 work_id
      mode: data.mode, 
      duration: data.duration 
    })
  }

  // 暂停计时
  static async pauseTimer(sessionId: number): Promise<boolean> {
    return tauriInvoke<boolean>('pause_timer')
  }

  // 恢复计时
  static async resumeTimer(sessionId: number): Promise<boolean> {
    return tauriInvoke<boolean>('resume_timer')
  }

  // 停止计时
  static async stopTimer(sessionId: number): Promise<TimeRecord | null> {
    return tauriInvoke<TimeRecord | null>('stop_timer')
  }

  // 获取计时器配置
  static async getTimerConfig(): Promise<TimerConfig> {
    return tauriInvoke<TimerConfig>('get_timer_config')
  }

  // 更新计时器配置
  static async updateTimerConfig(config: Partial<TimerConfig>): Promise<TimerConfig> {
    return tauriInvoke<TimerConfig>('save_timer_config', config)
  }

  // 获取计时历史
  static async getTimerHistory(workId?: number): Promise<TimerSession[]> {
    return tauriInvoke<TimerSession[]>('get_timer_sessions', { work_id: workId, limit: None })
  }
}

// 分析相关API
export class AnalyticsAPI {
  // 获取时间记录
  static async getTimeRecords(filters?: AnalyticsFilters): Promise<TimeRecord[]> {
    return tauriInvoke<TimeRecord[]>('get_time_records', { filters })
  }

  // 获取时间分布
  static async getTimeDistribution(filters?: AnalyticsFilters): Promise<TimeDistribution[]> {
    return tauriInvoke<TimeDistribution[]>('get_time_distribution', { filters })
  }

  // 获取每日统计
  static async getDailyStats(filters?: AnalyticsFilters): Promise<DailyStats[]> {
    return tauriInvoke<DailyStats[]>('get_daily_stats', { filters })
  }

  // 获取每周统计
  static async getWeeklyStats(filters?: AnalyticsFilters): Promise<WeeklyStats[]> {
    return tauriInvoke<WeeklyStats[]>('get_weekly_stats', { filters })
  }

  // 获取每月统计
  static async getMonthlyStats(filters?: AnalyticsFilters): Promise<MonthlyStats[]> {
    return tauriInvoke<MonthlyStats[]>('get_monthly_stats', { filters })
  }

  // 获取趋势数据
  static async getTrendData(filters?: AnalyticsFilters): Promise<TrendData[]> {
    return tauriInvoke<TrendData[]>('get_trend_data', { filters })
  }

  // 导出数据
  static async exportData(format: ExportFormat, filters?: AnalyticsFilters): Promise<ExportData> {
    return tauriInvoke<ExportData>('export_data', { format, filters })
  }

  // 获取分析数据（兼容旧接口）
  static async getAnalytics(params: {
    startDate?: string
    endDate?: string
    workId?: number
    mode?: 'explore' | 'utilize'
  }): Promise<AnalyticsData> {
    const filters: AnalyticsFilters = {
      date_range: {
        start: params.startDate || '',
        end: params.endDate || ''
      },
      work_ids: params.workId ? [params.workId] : undefined,
      modes: params.mode ? [params.mode] : undefined
    }
    return tauriInvoke<AnalyticsData>('get_analytics', { filters })
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

