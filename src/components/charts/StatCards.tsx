import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Clock, Target, Calendar, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration, formatPercentage } from '@/utils/format';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    type: 'increase' | 'decrease' | 'stable';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  className
}: StatCardProps) {
  const getVariantColor = () => {
    switch (variant) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'destructive': return 'text-red-600';
      default: return 'text-primary';
    }
  };

  const getTrendIcon = () => {
    switch (trend?.type) {
      case 'increase': return <TrendingUp className="h-4 w-4" />;
      case 'decrease': return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={cn('h-4 w-4', getVariantColor())}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="mt-1">{description}</CardDescription>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-2">
            <span className={cn('text-xs', getTrendColor())}>
              {getTrendIcon()}
            </span>
            <span className={cn('text-xs font-medium', getTrendColor())}>
              {trend.type === 'increase' ? '+' : ''}{formatPercentage(trend.value)}
            </span>
            <span className="text-xs text-muted-foreground">vs 上期</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 时间统计卡片
interface TimeStatsCardProps {
  totalTime: number;
  exploreTime: number;
  utilizeTime: number;
  previousTotalTime?: number;
  className?: string;
}

export function TimeStatsCard({
  totalTime,
  exploreTime,
  utilizeTime,
  previousTotalTime,
  className
}: TimeStatsCardProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return { type: 'stable' as const, value: 0 };
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 1) return { type: 'stable' as const, value: change };
    return {
      type: change > 0 ? ('increase' as const) : ('decrease' as const),
      value: change
    };
  };

  const trend = previousTotalTime ? calculateTrend(totalTime, previousTotalTime) : undefined;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      <StatCard
        title="总时长"
        value={formatDuration(totalTime)}
        description="所有模式的总时间"
        trend={trend}
        icon={<Clock />}
      />
      <StatCard
        title="探索模式"
        value={formatDuration(exploreTime)}
        description={`占总时长 ${formatPercentage(exploreTime / totalTime)}`}
        icon={<Target />}
        variant="default"
      />
      <StatCard
        title="利用模式"
        value={formatDuration(utilizeTime)}
        description={`占总时长 ${formatPercentage(utilizeTime / totalTime)}`}
        icon={<Award />}
        variant="warning"
      />
    </div>
  );
}

// 会话统计卡片
interface SessionStatsCardProps {
  totalSessions: number;
  completedSessions: number;
  averageSessionTime: number;
  previousCompletedSessions?: number;
  className?: string;
}

export function SessionStatsCard({
  totalSessions,
  completedSessions,
  averageSessionTime,
  previousCompletedSessions,
  className
}: SessionStatsCardProps) {
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const trend = previousCompletedSessions ? {
    type: completedSessions > previousCompletedSessions ? 'increase' as const : 'decrease' as const,
    value: ((completedSessions - previousCompletedSessions) / previousCompletedSessions) * 100
  } : undefined;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      <StatCard
        title="总会话数"
        value={totalSessions}
        description="所有计时会话"
        icon={<Calendar />}
      />
      <StatCard
        title="完成率"
        value={`${formatPercentage(completionRate)}`}
        description={`${completedSessions}/${totalSessions} 已完成`}
        trend={trend}
        icon={<Award />}
        variant={completionRate > 80 ? 'success' : completionRate > 60 ? 'warning' : 'destructive'}
      />
      <StatCard
        title="平均时长"
        value={formatDuration(averageSessionTime)}
        description="每个会话的平均时间"
        icon={<Clock />}
      />
    </div>
  );
}

// 作品统计卡片
interface WorkStatsCardProps {
  totalWorks: number;
  activeWorks: number;
  topWork?: {
    name: string;
    time: number;
    percentage: number;
  };
  className?: string;
}

export function WorkStatsCard({
  totalWorks,
  activeWorks,
  topWork,
  className
}: WorkStatsCardProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      <StatCard
        title="作品总数"
        value={totalWorks}
        description="创建的作品数量"
        icon={<Target />}
      />
      <StatCard
        title="活跃作品"
        value={activeWorks}
        description="有时间记录的作品"
        icon={<Award />}
        variant="success"
      />
      <StatCard
        title="最活跃作品"
        value={topWork?.name || '无'}
        description={topWork ? `${formatDuration(topWork.time)} (${formatPercentage(topWork.percentage)})` : '暂无数据'}
        icon={<TrendingUp />}
        variant="default"
      />
    </div>
  );
}

// 目标进度卡片
interface GoalProgressCardProps {
  currentProgress: number;
  targetGoal: number;
  timeRemaining: number;
  title?: string;
  className?: string;
}

export function GoalProgressCard({
  currentProgress,
  targetGoal,
  timeRemaining,
  title = "目标进度",
  className
}: GoalProgressCardProps) {
  const progressPercentage = targetGoal > 0 ? (currentProgress / targetGoal) * 100 : 0;
  const isOverdue = timeRemaining < 0;
  const progressVariant = progressPercentage >= 100 ? 'success' : 
                         progressPercentage >= 75 ? 'warning' : 'default';

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
            {isOverdue ? '已过期' : `${formatDuration(timeRemaining)} 剩余`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">进度</span>
            <span className="text-sm font-medium">{formatPercentage(progressPercentage)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all duration-300', {
                'bg-green-500': progressVariant === 'success',
                'bg-yellow-500': progressVariant === 'warning',
                'bg-primary': progressVariant === 'default'
              })}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{formatDuration(currentProgress)}</span>
            <span className="text-muted-foreground">目标: {formatDuration(targetGoal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}