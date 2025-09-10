import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { AnalyticsFilters, TimeDistribution, DailyStats, WeeklyStats, MonthlyStats, TrendData, ExportData, ExportFormat } from '@/types/analytics';
import { TimeRecord } from '@/types/timer';
import { analyticsAPI } from '@/services/api';

interface AnalyticsState {
  // 数据状态
  timeRecords: TimeRecord[];
  timeDistribution: TimeDistribution[];
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  trendData: TrendData[];
  
  // 筛选器状态
  filters: AnalyticsFilters;
  
  // UI状态
  loading: boolean;
  error: string | null;
  
  // Actions
  setTimeRecords: (records: TimeRecord[]) => void;
  setTimeDistribution: (distribution: TimeDistribution[]) => void;
  setDailyStats: (stats: DailyStats[]) => void;
  setWeeklyStats: (stats: WeeklyStats[]) => void;
  setMonthlyStats: (stats: MonthlyStats[]) => void;
  setTrendData: (data: TrendData[]) => void;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 数据获取
  fetchTimeRecords: (filters?: AnalyticsFilters) => Promise<void>;
  fetchTimeDistribution: (filters?: AnalyticsFilters) => Promise<void>;
  fetchDailyStats: (filters?: AnalyticsFilters) => Promise<void>;
  fetchWeeklyStats: (filters?: AnalyticsFilters) => Promise<void>;
  fetchMonthlyStats: (filters?: AnalyticsFilters) => Promise<void>;
  fetchTrendData: (filters?: AnalyticsFilters) => Promise<void>;
  
  // 数据导出
  exportData: (format: ExportFormat, filters?: AnalyticsFilters) => Promise<ExportData>;
  
  // 数据刷新
  refreshAllData: () => Promise<void>;
  
  // 重置
  reset: () => void;
}

const initialState = {
  timeRecords: [],
  timeDistribution: [],
  dailyStats: [],
  weeklyStats: [],
  monthlyStats: [],
  trendData: [],
  
  filters: {
    date_range: {
      start: '',
      end: ''
    }
  },
  
  loading: false,
  error: null
};

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    immer((set, get) => ({
      ...initialState,
      
      // 基础Actions
      setTimeRecords: (records) => set({ timeRecords: records }),
      setTimeDistribution: (distribution) => set({ timeDistribution: distribution }),
      setDailyStats: (stats) => set({ dailyStats: stats }),
      setWeeklyStats: (stats) => set({ weeklyStats: stats }),
      setMonthlyStats: (stats) => set({ monthlyStats: stats }),
      setTrendData: (data) => set({ trendData: data }),
      
      setFilters: (newFilters) => set((state) => {
        state.filters = { ...state.filters, ...newFilters };
      }),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      // 数据获取Actions
      fetchTimeRecords: async (filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const records = await analyticsAPI.getTimeRecords(currentFilters);
          set({ timeRecords: records, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取时间记录失败', loading: false });
        }
      },
      
      fetchTimeDistribution: async (filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const distribution = await analyticsAPI.getTimeDistribution(currentFilters);
          set({ timeDistribution: distribution, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取时间分布失败', loading: false });
        }
      },
      
      fetchDailyStats: async (filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const stats = await analyticsAPI.getDailyStats(currentFilters);
          set({ dailyStats: stats, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取每日统计失败', loading: false });
        }
      },
      
      fetchWeeklyStats: async (filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const stats = await analyticsAPI.getWeeklyStats(currentFilters);
          set({ weeklyStats: stats, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取每周统计失败', loading: false });
        }
      },
      
      fetchMonthlyStats: async (filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const stats = await analyticsAPI.getMonthlyStats(currentFilters);
          set({ monthlyStats: stats, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取每月统计失败', loading: false });
        }
      },
      
      fetchTrendData: async (filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const data = await analyticsAPI.getTrendData(currentFilters);
          set({ trendData: data, loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '获取趋势数据失败', loading: false });
        }
      },
      
      // 数据导出
      exportData: async (format: ExportFormat, filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          const data = await analyticsAPI.exportData(format, currentFilters);
          set({ loading: false });
          return data;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '导出数据失败', loading: false });
          throw error;
        }
      },
      
      // 数据刷新
      refreshAllData: async () => {
        try {
          set({ loading: true, error: null });
          const filters = get().filters;
          
          await Promise.all([
            get().fetchTimeRecords(filters),
            get().fetchTimeDistribution(filters),
            get().fetchDailyStats(filters),
            get().fetchWeeklyStats(filters),
            get().fetchMonthlyStats(filters),
            get().fetchTrendData(filters)
          ]);
          
          set({ loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : '刷新数据失败', loading: false });
        }
      },
      
      // 重置
      reset: () => set(initialState)
    })),
    {
      name: 'analytics-storage',
      partialize: (state) => ({
        filters: state.filters
      })
    }
  )
);