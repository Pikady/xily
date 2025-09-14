import React from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatWindowModeSwitcherProps {
  currentMode: 'explore' | 'utilize'
  onModeChange: (mode: 'explore' | 'utilize') => void
  disabled?: boolean
}

export function FloatWindowModeSwitcher({
  currentMode,
  onModeChange,
  disabled = false
}: FloatWindowModeSwitcherProps) {
  const modes = [
    {
      value: 'explore' as const,
      label: '探索',
      icon: BookOpen,
      color: 'bg-blue-500 hover:bg-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      value: 'utilize' as const,
      label: '利用',
      icon: Zap,
      color: 'bg-orange-500 hover:bg-orange-600',
      borderColor: 'border-orange-200'
    }
  ] as const

  return (
    <div className="flex space-x-1 p-1 bg-muted rounded-lg">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = currentMode === mode.value

        return (
          <Button
            key={mode.value}
            size="sm"
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onModeChange(mode.value)}
            disabled={disabled}
            className={cn(
              'flex-1 h-8 text-xs',
              isActive && mode.color,
              !isActive && 'hover:bg-muted-foreground/10'
            )}
          >
            <Icon className="w-3 h-3 mr-1" />
            {mode.label}
          </Button>
        )
      })}
    </div>
  )
}