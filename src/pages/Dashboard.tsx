import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Plus, BarChart3, Clock, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useWorksStore } from '@/stores/worksStore';
import { useTimerStore } from '@/stores/timerStore';
import { 
  TimeStatsCard, 
  SessionStatsCard, 
  WorkStatsCard,
  GoalProgressCard 
} from '@/components/charts/StatCards';
import { TimeDistributionCharts } from '@/components/charts/TimeDistributionCharts';
import { TrendAnalysisCharts } from '@/components/charts/TrendAnalysisCharts';
import { DataFilter } from '@/components/charts/DataFilter';
import { DataStatusIndicator } from '@/components/charts/DataStatusIndicator';
import { formatDuration, getDaysBetween } from '@/utils/format';

export function Dashboard() {
  const {
    timeDistribution,
    dailyStats,
    weeklyStats,
    trendData,
    filters,
    loading: analyticsLoading,
    error: analyticsError,
    setFilters,
    fetchData
  } = useAnalyticsStore();

  const { works: worksRaw } = useWorksStore();
  const works = Array.isArray(worksRaw) ? worksRaw : [];
  const dailyStatsList = Array.isArray(dailyStats) ? dailyStats : [];
  const timeDistributionList = Array.isArray(timeDistribution) ? timeDistribution : [];
  const trendDataList = Array.isArray(trendData) ? trendData : [];

  // 初始化数据和筛选器
  useEffect(() => {
    const initializeFilters = () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
      
      setFilters({
        date_range: {
          start: thirtyDaysAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        }
      });
    };

    initializeFilters();
  }, [setFilters]);

  // 筛选器变化时获取数据
  useEffect(() => {
    if (filters && filters.date_range?.start && filters.date_range?.end) {
      fetchData('all');
    }
  }, [filters, fetchData]);

  
  // 计算统计数据
  const stats = useMemo(() => {
    const totalTime = dailyStatsList.reduce((sum, stat) => sum + stat.total_time, 0);
    const exploreTime = dailyStatsList.reduce((sum, stat) => sum + stat.explore_time, 0);
    const utilizeTime = dailyStatsList.reduce((sum, stat) => sum + stat.utilize_time, 0);
    
    const totalSessions = dailyStatsList.reduce((sum, stat) => sum + stat.session_count, 0);
    const completedSessions = dailyStatsList.reduce((sum, stat) => sum + stat.completed_sessions, 0);
    const averageSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;

    const activeWorks = timeDistributionList.length;
    const topWork = timeDistributionList.length > 0 ? {
      name: timeDistributionList[0].work_name,
      time: timeDistributionList[0].total_time,
      percentage: timeDistributionList[0].percentage
    } : undefined;

    return {
      totalTime,
      exploreTime,
      utilizeTime,
      totalSessions,
      completedSessions,
      averageSessionTime,
      activeWorks,
      topWork
    };
  }, [dailyStatsList, timeDistributionList]);

  // 计算今日统计
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyStatsList.find(stat => stat.date === today);
  }, [dailyStatsList]);

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据分析仪表板</h1>
          <p className="text-muted-foreground mt-1">
            深入了解你的时间投入和效率趋势
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新建作品
          </Button>
          <Button variant="default" className="bg-explore hover:bg-explore/90">
            <Play className="w-4 h-4 mr-2" />
            开始专注
          </Button>
        </div>
      </div>

      {/* 数据筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <DataFilter
              filters={filters}
              onFiltersChange={setFilters}
              works={works}
              onRefresh={() => fetchData('all')}
            />
            <DataStatusIndicator
              loading={analyticsLoading}
              error={analyticsError ?? undefined}
              lastSyncTime={new Date()}
              onRefresh={() => fetchData('all')}
              autoRefresh={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* 核心统计 */}
      <TimeStatsCard
        totalTime={stats.totalTime}
        exploreTime={stats.exploreTime}
        utilizeTime={stats.utilizeTime}
        previousTotalTime={todayStats ? stats.totalTime - todayStats.total_time : undefined}
      />

      <SessionStatsCard
        totalSessions={stats.totalSessions}
        completedSessions={stats.completedSessions}
        averageSessionTime={stats.averageSessionTime}
      />

      <WorkStatsCard
        totalWorks={works.length}
        activeWorks={stats.activeWorks}
        topWork={stats.topWork}
      />

      {/* 图表分析 */}
      <Tabs defaultValue="distribution" className="space-y-6">
        <TabsList>
          <TabsTrigger value="distribution">时间分布</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
          <TabsTrigger value="goals">目标进度</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <TimeDistributionCharts
            data={timeDistributionList}
            loading={analyticsLoading}
            error={analyticsError ?? undefined}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendAnalysisCharts
            data={trendDataList}
            loading={analyticsLoading}
            error={analyticsError ?? undefined}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {works.filter(work => work.target_hours > 0).map(work => {
              const workTime = timeDistribution.find(d => d.work_id === work.id)?.total_time || 0;
              return (
                <GoalProgressCard
                  key={work.id}
                  title={work.name}
                  currentProgress={workTime}
                  targetGoal={work.target_hours * 60} // 转换为分钟
                  timeRemaining={30} // 示例值
                />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速开始</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-explore/10"
            >
              <div className="w-8 h-8 rounded-full bg-explore flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span>探索模式</span>
              <span className="text-xs text-muted-foreground">学习输入阶段</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-utilize/10"
            >
              <div className="w-8 h-8 rounded-full bg-utilize flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span>利用模式</span>
              <span className="text-xs text-muted-foreground">创作输出阶段</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}