import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkCard } from './WorkCard'
import { useWorks } from '@/hooks/useWorks'
import { WorksAPI } from '@/services/api'
import { Work, WorkStats } from '@/types/work'
import { Search, Plus, Filter, Grid, List, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { on } from '@/events/EventBus'

interface WorkListProps {
  onCreateWork?: () => void
  onEditWork?: (work: Work) => void
  className?: string
}

export function WorkList({ onCreateWork, onEditWork, className = '' }: WorkListProps) {
  const {
    works,
    activeWorks,
    archivedWorks,
    currentWork,
    loading,
    error,
    loadWorks,
    removeWork,
    archiveWork: archiveWorkById,
    unarchiveWork: unarchiveWorkById,
    selectWork
  } = useWorks()

  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null)
  const [worksStats, setWorksStats] = useState<Record<number, { total_time: number; explore_time: number; utilize_time: number; session_count: number; completion_rate: number; }>>({})
  const lastLoadTime = useRef<number>(0)
  const isLoadingRef = useRef<boolean>(false)

  // 加载作品列表和统计数据
  useEffect(() => {
    loadWorks()
  }, [loadWorks])

  // 加载所有作品的统计数据
  const loadAllWorksStats = useCallback(async () => {
    // 防抖：避免在短时间内重复调用
    const now = Date.now()
    if (isLoadingRef.current || (now - lastLoadTime.current < 1000)) {
      console.log('🔍 loadAllWorksStats 跳过，距离上次调用时间太短或正在加载')
      return
    }

    if (works.length > 0) {
      isLoadingRef.current = true
      lastLoadTime.current = now

      try {
        console.log('🔍 作品列表:', works.map(w => ({ id: w.id, name: w.name })))
        const statsPromises = works.map(async (work) => {
          if (work && work.id) {
            try {
              console.log('🔍 尝试获取作品统计, work.id:', work.id)
              const stats = await WorksAPI.getWorkStats(work.id.toString())
              // 将后端返回的WorkStats格式映射为WorkCard需要的格式
              const mappedStats = {
                total_time: stats.total_minutes || 0,
                explore_time: stats.explore_time || 0,
                utilize_time: stats.utilize_time || 0,
                session_count: stats.session_count || 0,
                completion_rate: stats.progress_percentage || 0
              }
              return { [work.id]: mappedStats }
            } catch (error) {
              console.warn(`获取作品 ${work.id} 统计失败:`, error)
              // 返回默认统计值而不是null，避免前端错误
              return { [work.id]: {
                total_time: 0,
                explore_time: 0,
                utilize_time: 0,
                session_count: 0,
                completion_rate: 0
              } }
            }
          }
          return {}
        })

        const statsResults = await Promise.all(statsPromises)
        const allStats = statsResults.reduce<Record<number, { total_time: number; explore_time: number; utilize_time: number; session_count: number; completion_rate: number; }>>((acc, curr) => ({ ...acc, ...curr }), {})
        setWorksStats(allStats)
      } catch (error) {
        console.error('加载作品统计数据失败:', error)
      } finally {
        isLoadingRef.current = false
      }
    }
  }, [works])

  // 初始加载统计数据
  useEffect(() => {
    console.log('🔍 WorkList useEffect triggered, works.length:', works.length)
    if (works.length > 0) {
      console.log('🔍 开始加载作品统计数据, 作品数量:', works.length)
      loadAllWorksStats()
    } else {
      console.log('🔍 没有作品，跳过统计数据加载')
    }
  }, [works.length]) // 移除 loadAllWorksStats 依赖，避免循环调用

  // 监听计时器完成事件，刷新统计数据
  useEffect(() => {
    const unsubscribe = on('timer:completed', (event) => {
      console.log('WorkList收到计时器完成事件:', event.payload)
      // 统计数据刷新由 StoreEventManager 统一处理，这里不再重复调用
    })

    return () => {
      unsubscribe()
    }
  }, []) // 空依赖数组，只绑定一次

  // 过滤作品
  const filteredWorks = (showArchived ? archivedWorks : activeWorks).filter(work =>
    work.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (work.description && work.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 处理作品选择
  const handleWorkSelect = (work: Work) => {
    setSelectedWorkId(work.id)
    selectWork(work)
  }

  // 处理作品编辑
  const handleWorkEdit = (work: Work) => {
    onEditWork?.(work)
  }

  // 处理作品删除
  const handleWorkDelete = async (work: Work) => {
    if (confirm(`确定要删除作品"${work.name}"吗？此操作不可恢复。`)) {
      try {
        await removeWork(work.id)
      } catch (error) {
        console.error('删除作品失败:', error)
      }
    }
  }

  // 处理作品归档/取消归档
  const handleWorkArchive = async (work: Work) => {
    try {
      if (work.is_archived) {
        await unarchiveWorkById(work.id)
      } else {
        await archiveWorkById(work.id)
      }
    } catch (error) {
      console.error('归档操作失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">加载作品列表...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">加载作品列表失败</p>
          <Button onClick={loadWorks} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索作品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? '显示活跃' : '显示归档'}
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={onCreateWork} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            新建作品
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总作品数</p>
                <p className="text-2xl font-bold">{works.length}</p>
              </div>
              <Badge variant="secondary">{works.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">活跃作品</p>
                <p className="text-2xl font-bold">{activeWorks.length}</p>
              </div>
              <Badge variant="default">{activeWorks.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已归档</p>
                <p className="text-2xl font-bold">{archivedWorks.length}</p>
              </div>
              <Badge variant="outline">{archivedWorks.length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 作品列表 */}
      {filteredWorks.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">
                {showArchived ? '暂无归档作品' : '暂无作品'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showArchived 
                  ? '归档的作品会显示在这里'
                  : searchTerm
                  ? '没有找到匹配的作品'
                  : '开始创建你的第一个作品吧！'
                }
              </p>
              {!showArchived && !searchTerm && (
                <Button onClick={onCreateWork}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建作品
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        }>
          {filteredWorks.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              stats={worksStats[work.id] || {
                total_time: 0,
                explore_time: 0,
                utilize_time: 0,
                session_count: 0,
                completion_rate: 0
              }}
              isSelected={selectedWorkId === work.id}
              onEdit={handleWorkEdit}
              onDelete={handleWorkDelete}
              onArchive={handleWorkArchive}
              onSelect={handleWorkSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}