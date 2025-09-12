import React, { useMemo } from 'react';
import { PieChart, BarChart, ChartContainer } from '@/components/charts';
import { CHART_COLORS } from '@/components/charts/ChartComponents';
import { TimeDistribution } from '@/types/analytics';
import { formatDuration } from '@/utils/format';

interface TimeDistributionChartsProps {
  data: TimeDistribution[];
  loading?: boolean;
  error?: string;
}

export function TimeDistributionCharts({ data, loading, error }: TimeDistributionChartsProps) {
  // 准备饼图数据
  const pieData = useMemo(() => {
    return data.map((item) => ({
      name: item.work_name,
      value: item.total_time,
      color: item.work_color || CHART_COLORS.primary
    }));
  }, [data]);

  // 准备柱状图数据
  const barData = useMemo(() => {
    return data.map((item) => ({
      name: item.work_name,
      explore: item.explore_time,
      utilize: item.utilize_time,
      total: item.total_time,
      value: item.explore_time
    }));
  }, [data]);

  // 自定义格式化函数
  const formatTime = (value: number) => {
    return formatDuration(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 时间分布饼图 */}
      <ChartContainer
        title="时间分布"
        description="各作品时间占比"
        loading={loading}
        error={error}
      >
        <PieChart
          data={pieData}
          height={300}
          outerRadius={100}
          showLabel={true}
        />
      </ChartContainer>

      {/* 模式对比柱状图 */}
      <ChartContainer
        title="探索vs利用模式"
        description="各作品的探索与利用时间对比"
        loading={loading}
        error={error}
      >
        <BarChart
          data={barData}
          height={300}
          xAxisKey="name"
          dataKey="explore"
          color={CHART_COLORS.explore[0]}
          showGrid={true}
          showLegend={true}
        />
      </ChartContainer>
    </div>
  );
}

// 时间分布详情组件
interface TimeDistributionDetailsProps {
  data: TimeDistribution[];
}

export function TimeDistributionDetails({ data }: TimeDistributionDetailsProps) {
  const totalTime = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total_time, 0);
  }, [data]);

  const totalExploreTime = useMemo(() => {
    return data.reduce((sum, item) => sum + item.explore_time, 0);
  }, [data]);

  const totalUtilizeTime = useMemo(() => {
    return data.reduce((sum, item) => sum + item.utilize_time, 0);
  }, [data]);

  return (
    <div className="space-y-4">
      {/* 汇总统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">总时长</h3>
          <p className="text-2xl font-bold text-primary">{formatDuration(totalTime)}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">探索模式</h3>
          <p className="text-2xl font-bold" style={{ color: CHART_COLORS.explore[0] }}>
            {formatDuration(totalExploreTime)}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold">利用模式</h3>
          <p className="text-2xl font-bold" style={{ color: CHART_COLORS.utilize[0] }}>
            {formatDuration(totalUtilizeTime)}
          </p>
        </div>
      </div>

      {/* 详细列表 */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">详细数据</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.work_color || CHART_COLORS.primary }}
                  />
                  <span className="font-medium">{item.work_name}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-muted-foreground">
                    探索: {formatDuration(item.explore_time)}
                  </span>
                  <span className="text-muted-foreground">
                    利用: {formatDuration(item.utilize_time)}
                  </span>
                  <span className="font-semibold">
                    总计: {formatDuration(item.total_time)}
                  </span>
                  <span className="text-muted-foreground">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}