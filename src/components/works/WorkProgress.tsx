import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Work, WorkStats } from '@/types/work'
import { 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Timer,
  BarChart3,
  Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface WorkProgressProps {
  work: Work
  stats?: WorkStats
  className?: string
}

export function WorkProgress({ work, stats, className = '' }: WorkProgressProps) {
  // 计算完成进度
  const progressPercentage = work.target_hours > 0 
    ? Math.min((stats?.total_minutes || 0) / (work.target_hours * 60) * 100, 100)
    : 0

  // 格式化时间显示
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // 格式化最后活动时间
  const formatLastActivity = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: zhCN 
      })
    } catch {
      return '未知时间'
    }
  }

  // 计算剩余时间
  const remainingTime = Math.max(work.target_hours * 60 - (stats?.total_minutes || 0), 0)
  
  // 计算平均每次专注时间
  const averageSessionTime = stats?.session_count && stats.session_count > 0 
    ? stats.total_minutes / stats.session_count 
    : 0

  // 计算预估完成时间
  const estimatedCompletionTime = averageSessionTime > 0 && remainingTime > 0
    ? Math.ceil(remainingTime / averageSessionTime)
    : 0

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 基本进度卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            作品进度概览
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 总体进度 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">总体进度</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{progressPercentage.toFixed(1)}%</span>
                {progressPercentage >= 100 && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>已完成: {formatTime(stats?.total_minutes || 0)}</span>
              <span>目标: {work.target_hours}h</span>
              {remainingTime > 0 && (
                <span>剩余: {formatTime(remainingTime)}</span>
              )}
            </div>
          </div>

          {/* 进度状态 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(stats?.explore_time || 0)}
              </div>
              <div className="text-xs text-muted-foreground">探索时间</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatTime(stats?.utilize_time || 0)}
              </div>
              <div className="text-xs text-muted-foreground">利用时间</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats?.session_count || 0}
              </div>
              <div className="text-xs text-muted-foreground">专注次数</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.progress_percentage?.toFixed(0) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">完成率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细统计 */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* 时间分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                时间分布
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">探索模式</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatTime(stats.explore_time)}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total_minutes > 0 ? ((stats.explore_time / stats.total_minutes) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm">利用模式</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatTime(stats.utilize_time)}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total_minutes > 0 ? ((stats.utilize_time / stats.total_minutes) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 效率分析 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                效率分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">平均专注时长</span>
                  </div>
                  <span className="font-medium">{formatTime(averageSessionTime)}</span>
                </div>
                
                {estimatedCompletionTime > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">预计完成次数</span>
                    </div>
                    <span className="font-medium">{estimatedCompletionTime}次</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">最后活动</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatLastActivity(work.updated_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 成就徽章 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              成就徽章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {progressPercentage >= 100 && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  目标达成
                </Badge>
              )}
              
              {progressPercentage >= 75 && progressPercentage < 100 && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  接近目标
                </Badge>
              )}
              
              {stats.session_count >= 10 && (
                <Badge variant="outline" className="border-purple-500 text-purple-700">
                  <Timer className="h-3 w-3 mr-1" />
                  专注达人 ({stats.session_count}次)
                </Badge>
              )}
              
              {stats.progress_percentage >= 80 && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <Target className="h-3 w-3 mr-1" />
                  高效执行 ({stats.progress_percentage.toFixed(0)}%)
                </Badge>
              )}
              
              {stats.total_minutes >= 600 && (
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  <Clock className="h-3 w-3 mr-1" />
                  时间大师 ({formatTime(stats.total_minutes)})
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}