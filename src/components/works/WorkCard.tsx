import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Work } from '@/types/work'
import { Clock, Target, MoreHorizontal, Edit, Trash2, Archive } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface WorkCardProps {
  work: Work
  stats?: {
    total_time: number
    explore_time: number
    utilize_time: number
    session_count: number
    completion_rate: number
  }
  onEdit?: (work: Work) => void
  onDelete?: (work: Work) => void
  onArchive?: (work: Work) => void
  onSelect?: (work: Work) => void
  isSelected?: boolean
  className?: string
}

export function WorkCard({
  work,
  stats,
  onEdit,
  onDelete,
  onArchive,
  onSelect,
  isSelected = false,
  className = ''
}: WorkCardProps) {
  // 计算完成进度
  const progressPercentage = work.target_hours > 0 
    ? Math.min((stats?.total_time || 0) / (work.target_hours * 60) * 100, 100)
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

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${className}`}
      onClick={() => onSelect?.(work)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {work.color && (
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: work.color }}
              />
            )}
            <CardTitle className="text-lg">{work.name}</CardTitle>
            {work.is_archived && (
              <Badge variant="secondary" className="text-xs">
                已归档
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(work)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onArchive?.(work)
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(work)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {work.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {work.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">进度</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>已完成: {formatTime(stats?.total_time || 0)}</span>
            <span>目标: {work.target_hours}h</span>
          </div>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{stats.session_count}</div>
                <div className="text-xs text-muted-foreground">专注次数</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{stats.completion_rate.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">完成率</div>
              </div>
            </div>
          </div>
        )}

        {/* 模式时间分布 */}
        {stats && (stats.explore_time > 0 || stats.utilize_time > 0) && (
          <div className="flex justify-between text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>探索: {formatTime(stats.explore_time)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>利用: {formatTime(stats.utilize_time)}</span>
            </div>
          </div>
        )}

        {/* 最后活动时间 */}
        <div className="text-xs text-muted-foreground">
          最后活动: {formatLastActivity(work.updated_at)}
        </div>
      </CardContent>
    </Card>
  )
}