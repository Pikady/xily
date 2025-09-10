import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { AnalyticsFilters, TimerMode } from '@/types/analytics';
import { Work } from '@/types/work';
import { formatDate } from '@/utils/format';

interface DataFilterProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  works: Work[];
  onRefresh?: () => void;
}

export function DataFilter({ filters, onFiltersChange, works, onRefresh }: DataFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AnalyticsFilters>(filters);

  // 快速日期范围选项
  const quickRanges = [
    { label: '今天', days: 0 },
    { label: '昨天', days: 1 },
    { label: '最近7天', days: 7 },
    { label: '最近30天', days: 30 },
    { label: '本月', days: 'month' },
    { label: '上月', days: 'lastMonth' }
  ];

  // 处理快速日期范围选择
  const handleQuickRange = (range: { label: string; days: number | string }) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range.days) {
      case 0: // 今天
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
      case 1: // 昨天
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'month': // 本月
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        break;
      case 'lastMonth': // 上月
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default: // 最近N天
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - range.days + 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
    }

    setLocalFilters({
      ...localFilters,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    });
  };

  // 应用筛选器
  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  // 重置筛选器
  const resetFilters = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    
    const resetFilters: AnalyticsFilters = {
      date_range: {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    };
    
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  // 获取筛选器描述
  const getFilterDescription = () => {
    const parts = [];
    
    if (filters.date_range.start && filters.date_range.end) {
      parts.push(`${formatDate(filters.date_range.start)} - ${formatDate(filters.date_range.end)}`);
    }
    
    if (filters.work_ids && filters.work_ids.length > 0) {
      const selectedWorks = works.filter(w => filters.work_ids?.includes(w.id));
      if (selectedWorks.length === 1) {
        parts.push(selectedWorks[0].name);
      } else if (selectedWorks.length > 1) {
        parts.push(`${selectedWorks.length}个作品`);
      }
    }
    
    if (filters.modes && filters.modes.length > 0) {
      const modeNames = filters.modes.map(mode => mode === 'explore' ? '探索' : '利用');
      parts.push(modeNames.join('、'));
    }
    
    if (filters.completed !== undefined) {
      parts.push(filters.completed ? '已完成' : '未完成');
    }
    
    return parts.length > 0 ? parts.join(' · ') : '所有数据';
  };

  return (
    <div className="flex items-center space-x-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-8">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>数据筛选</DialogTitle>
            <DialogDescription>
              设置筛选条件来查看特定时间段和条件的数据
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 快速日期范围 */}
            <div className="space-y-2">
              <Label>快速选择</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickRanges.map((range) => (
                  <Button
                    key={range.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(range)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 自定义日期范围 */}
            <div className="space-y-2">
              <Label>自定义日期范围</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">开始日期</Label>
                  <Input
                    type="date"
                    value={localFilters.date_range.start}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        date_range: {
                          ...localFilters.date_range,
                          start: e.target.value
                        }
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">结束日期</Label>
                  <Input
                    type="date"
                    value={localFilters.date_range.end}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        date_range: {
                          ...localFilters.date_range,
                          end: e.target.value
                        }
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* 作品筛选 */}
            <div className="space-y-2">
              <Label>作品</Label>
              <Select
                value={localFilters.work_ids?.join(',') || ''}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    work_ids: value ? value.split(',').map(Number) : undefined
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择作品" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有作品</SelectItem>
                  {works.map((work) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      {work.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 模式筛选 */}
            <div className="space-y-2">
              <Label>模式</Label>
              <Select
                value={localFilters.modes?.join(',') || ''}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    modes: value ? value.split(',') as TimerMode[] : undefined
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有模式</SelectItem>
                  <SelectItem value="explore">探索模式</SelectItem>
                  <SelectItem value="utilize">利用模式</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 完成状态筛选 */}
            <div className="space-y-2">
              <Label>完成状态</Label>
              <Select
                value={localFilters.completed === undefined ? '' : localFilters.completed.toString()}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    completed: value === '' ? undefined : value === 'true'
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有状态</SelectItem>
                  <SelectItem value="true">已完成</SelectItem>
                  <SelectItem value="false">未完成</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重置
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button onClick={applyFilters}>
                  应用
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 筛选器描述 */}
      <div className="text-sm text-muted-foreground flex-1 min-w-0">
        <span className="truncate">{getFilterDescription()}</span>
      </div>

      {/* 刷新按钮 */}
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}