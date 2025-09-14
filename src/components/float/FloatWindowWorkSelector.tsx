import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WorksAPI } from '@/services/api'
import { Work } from '@/types/work'
import { ChevronDown } from 'lucide-react'

interface FloatWindowWorkSelectorProps {
  currentWorkId?: number
  onWorkChange: (workId: number) => void
  disabled?: boolean
  works?: Work[]
}

export function FloatWindowWorkSelector({
  currentWorkId,
  onWorkChange,
  disabled = false,
  works: externalWorks = []
}: FloatWindowWorkSelectorProps) {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)

  // 加载作品列表 - 如果有外部传入的作品，优先使用
  useEffect(() => {
    if (externalWorks.length > 0) {
      setWorks(externalWorks)
      return
    }

    const loadWorks = async () => {
      setLoading(true)
      try {
        const worksList = await WorksAPI.getAllWorks()
        setWorks(worksList)
      } catch (error) {
        console.error('加载作品列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorks()
  }, [externalWorks])

  const currentWork = works.find(w => w.id === currentWorkId)

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (works.length === 0) {
    return (
      <div className="text-center p-2 border border-dashed border-muted rounded">
        <span className="text-xs text-muted-foreground">
          暂无作品，请先创建作品
        </span>
      </div>
    )
  }

  return (
    <Select
      value={currentWorkId?.toString()}
      onValueChange={(value) => onWorkChange(parseInt(value))}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 text-sm">
        <div className="flex items-center space-x-2 flex-1">
          {currentWork?.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentWork.color }}
            />
          )}
          <SelectValue placeholder="选择作品" />
        </div>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </SelectTrigger>
      <SelectContent>
        {works.map((work) => (
          <SelectItem key={work.id} value={work.id?.toString() || ''}>
            <div className="flex items-center space-x-2">
              {work.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: work.color }}
                />
              )}
              <span>{work.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}