import React from 'react'
import { Button } from '@/components/ui/button'
import { GripVertical, Minimize2, Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatWindowHeaderProps {
  title: string
  mode: 'explore' | 'utilize'
  isMinimized: boolean
  onMinimize: () => void
  onMaximize: () => void
  onClose: () => void
  showControls?: boolean
}

export function FloatWindowHeader({
  title,
  mode,
  isMinimized,
  onMinimize,
  onMaximize,
  onClose,
  showControls = true
}: FloatWindowHeaderProps) {
  const getModeColor = (mode: 'explore' | 'utilize') => {
    return mode === 'explore' ? 'bg-blue-500' : 'bg-orange-500'
  }

  return (
    <div className="flex items-center justify-between p-2 border-b bg-muted/50 cursor-move">
      <div className="flex items-center space-x-2">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center space-x-1">
          <div className={cn(
            'w-2 h-2 rounded-full',
            getModeColor(mode)
          )} />
          <span className="text-sm font-medium">
            {title}
          </span>
        </div>
      </div>

      {showControls && (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMaximize}
            className="h-6 w-6 p-0"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}