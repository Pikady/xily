import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/format';

interface DataStatusIndicatorProps {
  loading: boolean;
  error?: string | null;
  lastSyncTime?: Date;
  onRefresh?: () => void;
  autoRefresh?: boolean;
  className?: string;
}

export function DataStatusIndicator({
  loading,
  error,
  lastSyncTime,
  onRefresh,
  autoRefresh = true,
  className
}: DataStatusIndicatorProps) {
  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-3 w-3" />;
    if (loading) return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <Wifi className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (error) return '同步失败';
    if (loading) return '同步中...';
    return '已同步';
  };

  const getStatusVariant = () => {
    if (error) return 'destructive';
    if (loading) return 'secondary';
    return 'default';
  };

  const getTimeAgo = () => {
    if (!lastSyncTime) return '从未同步';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>
      
      {lastSyncTime && !loading && !error && (
        <span className="text-xs text-muted-foreground">
          <Clock className="h-3 w-3 inline mr-1" />
          {getTimeAgo()}
        </span>
      )}
      
      {autoRefresh && (
        <span className="text-xs text-muted-foreground">
          自动更新: 开启
        </span>
      )}
      
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
        </Button>
      )}
    </div>
  );
}

// 数据加载状态组件
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = '正在加载数据...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 space-y-4', className)}>
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

// 错误状态组件
interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 space-y-4', className)}>
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-muted-foreground text-center max-w-md">
        {error}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      )}
    </div>
  );
}

// 空状态组件
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 space-y-4', className)}>
      <div className="text-6xl">📊</div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-center max-w-md">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// 数据质量指示器
interface DataQualityIndicatorProps {
  completeness: number; // 0-100
  accuracy?: number; // 0-100
  freshness?: number; // 0-100
  className?: string;
}

export function DataQualityIndicator({
  completeness,
  accuracy = 100,
  freshness = 100,
  className
}: DataQualityIndicatorProps) {
  const overallScore = Math.round((completeness + accuracy + freshness) / 3);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '需改进';
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium">数据质量:</span>
        <span className={cn('text-sm font-bold', getScoreColor(overallScore))}>
          {overallScore}%
        </span>
        <span className={cn('text-xs', getScoreColor(overallScore))}>
          ({getScoreText(overallScore)})
        </span>
      </div>
      
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-green-500" title={`完整性: ${completeness}%`} />
        <div className="w-2 h-2 rounded-full bg-blue-500" title={`准确性: ${accuracy}%`} />
        <div className="w-2 h-2 rounded-full bg-purple-500" title={`新鲜度: ${freshness}%`} />
      </div>
    </div>
  );
}