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
  
  // 按需数据获取（手动触发）
  fetchData: (dataType: 'timeRecords' | 'timeDistribution' | 'dailyStats' | 'weeklyStats' | 'monthlyStats' | 'trendData' | 'all', filters?: AnalyticsFilters) => Promise<void>;
  
  // 数据导出
  exportData: (format: ExportFormat, filters?: AnalyticsFilters) => Promise<ExportData>;
  
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
      
      // 统一的数据获取方法
      fetchData: async (dataType, filters) => {
        try {
          set({ loading: true, error: null });
          const currentFilters = filters || get().filters;
          
          if (dataType === 'all') {
            await Promise.all([
              analyticsAPI.getTimeRecords(currentFilters).then(data => set({ timeRecords: data })),
              analyticsAPI.getTimeDistribution(currentFilters).then(data => set({ timeDistribution: data })),
              analyticsAPI.getDailyStats(currentFilters).then(data => set({ dailyStats: data })),
              analyticsAPI.getWeeklyStats(currentFilters).then(data => set({ weeklyStats: data })),
              analyticsAPI.getMonthlyStats(currentFilters).then(data => set({ monthlyStats: data })),
              analyticsAPI.getTrendData(currentFilters).then(data => set({ trendData: data }))
            ]);
          } else {
            switch (dataType) {
              case 'timeRecords':
                const records = await analyticsAPI.getTimeRecords(currentFilters);
                set({ timeRecords: records });
                break;
              case 'timeDistribution':
                const distribution = await analyticsAPI.getTimeDistribution(currentFilters);
                set({ timeDistribution: distribution });
                break;
              case 'dailyStats':
                const daily = await analyticsAPI.getDailyStats(currentFilters);
                set({ dailyStats: daily });
                break;
              case 'weeklyStats':
                const weekly = await analyticsAPI.getWeeklyStats(currentFilters);
                set({ weeklyStats: weekly });
                break;
              case 'monthlyStats':
                const monthly = await analyticsAPI.getMonthlyStats(currentFilters);
                set({ monthlyStats: monthly });
                break;
              case 'trendData':
                const trend = await analyticsAPI.getTrendData(currentFilters);
                set({ trendData: trend });
                break;
            }
          }
          
          set({ loading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : `获取${dataType}数据失败`, loading: false });
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