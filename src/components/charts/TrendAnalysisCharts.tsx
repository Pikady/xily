import React, { useMemo } from 'react';
import { LineChart, AreaChart, ChartContainer } from '@/components/charts';
import { CHART_COLORS } from '@/components/charts/ChartComponents';
import { TrendData } from '@/types/analytics';
import { formatDate, formatDuration } from '@/utils/format';

interface TrendAnalysisChartsProps {
  data: TrendData[];
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
}

export function TrendAnalysisCharts({
  data,
  loading,
  error,
  title = "趋势分析",
  description = "时间投入趋势变化"
}: TrendAnalysisChartsProps) {
  // 准备总时长趋势数据
  const totalTrendData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      value: item.value,
      formattedDate: formatDate(item.date, 'short'),
      name: formatDate(item.date, 'short')
    }));
  }, [data]);

  // 准备模式对比趋势数据
  const modeTrendData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      explore: item.explore_value || 0,
      utilize: item.utilize_value || 0,
      total: item.value,
      formattedDate: formatDate(item.date, 'short'),
      name: formatDate(item.date, 'short')
      ,value: item.explore_value || 0
    }));
  }, [data]);

  // 计算趋势统计
  const trendStats = useMemo(() => {
    if (data.length < 2) return null;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
    
    // 计算平均值
    const avgValue = data.reduce((sum, item) => sum + item.value, 0) / data.length;
    
    // 找出最高和最低点
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const maxDate = data.find(item => item.value === maxValue)?.date;
    const minDate = data.find(item => item.value === minValue)?.date;
    
    return {
      change,
      changePercent,
      avgValue,
      maxValue,
      minValue,
      maxDate,
      minDate
    };
  }, [data]);

  // 自定义格式化函数
  const formatTime = (value: number) => {
    return formatDuration(value);
  };

  return (
    <div className="space-y-6">
      {/* 趋势统计卡片 */}
      {trendStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">总变化</h3>
            <p className={`text-lg font-bold ${trendStats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trendStats.change >= 0 ? '+' : ''}{formatDuration(trendStats.change)}
            </p>
            <p className={`text-xs ${trendStats.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({trendStats.changePercent >= 0 ? '+' : ''}{trendStats.changePercent.toFixed(1)}%)
            </p>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">平均值</h3>
            <p className="text-lg font-bold text-primary">
              {formatDuration(trendStats.avgValue)}
            </p>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">最高值</h3>
            <p className="text-lg font-bold text-green-600">
              {formatDuration(trendStats.maxValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(trendStats.maxDate || '', 'short')}
            </p>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">最低值</h3>
            <p className="text-lg font-bold text-red-600">
              {formatDuration(trendStats.minValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(trendStats.minDate || '', 'short')}
            </p>
          </div>
        </div>
      )}

      {/* 总时长趋势图 */}
      <ChartContainer
        title={title}
        description={description}
        loading={loading}
        error={error}
      >
        <AreaChart
          data={totalTrendData}
          height={300}
          xAxisKey="formattedDate"
          dataKey="value"
          color={CHART_COLORS.primary}
          showGrid={true}
          fillOpacity={0.3}
        />
      </ChartContainer>

      {/* 模式对比趋势图 */}
      {data.some(item => item.explore_value !== undefined || item.utilize_value !== undefined) && (
        <ChartContainer
          title="模式对比趋势"
          description="探索模式与利用模式的时间投入对比"
          loading={loading}
          error={error}
        >
          <LineChart
            data={modeTrendData}
            height={300}
            xAxisKey="formattedDate"
            dataKey="explore"
            color={CHART_COLORS.explore[0]}
            showGrid={true}
            showLegend={true}
            strokeWidth={2}
          />
        </ChartContainer>
      )}
    </div>
  );
}

// 时间范围选择器组件
interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
  customRanges?: Array<{ value: string; label: string; days: number }>;
}

export function TimeRangeSelector({ 
  selectedRange, 
  onRangeChange, 
  customRanges 
}: TimeRangeSelectorProps) {
  const defaultRanges = [
    { value: '7d', label: '最近7天', days: 7 },
    { value: '30d', label: '最近30天', days: 30 },
    { value: '90d', label: '最近90天', days: 90 },
    { value: '6m', label: '最近6个月', days: 180 },
    { value: '1y', label: '最近1年', days: 365 }
  ];

  const ranges = customRanges || defaultRanges;

  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedRange === range.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

// 趋势分析工具函数
export function calculateTrend(data: TrendData[]): {
  slope: number;
  correlation: number;
  direction: 'increasing' | 'decreasing' | 'stable';
} {
  if (data.length < 2) {
    return { slope: 0, correlation: 0, direction: 'stable' };
  }

  const n = data.length;
  const xValues = data.map((_, index) => index);
  const yValues = data.map(item => item.value);

  // 计算平均值
  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;

  // 计算斜率（最小二乘法）
  const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
  const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
  const slope = denominator !== 0 ? numerator / denominator : 0;

  // 计算相关系数
  const xStdDev = Math.sqrt(xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0) / n);
  const yStdDev = Math.sqrt(yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0) / n);
  const correlation = xStdDev !== 0 && yStdDev !== 0 ? numerator / (n * xStdDev * yStdDev) : 0;

  // 判断趋势方向
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(slope) > 0.1) {
    direction = slope > 0 ? 'increasing' : 'decreasing';
  }

  return { slope, correlation, direction };
}