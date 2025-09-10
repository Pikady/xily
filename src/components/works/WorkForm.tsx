import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Work, CreateWorkParams, UpdateWorkParams } from '@/types/work'
import { createWorkSchema, updateWorkSchema, COLOR_OPTIONS, TARGET_HOUR_OPTIONS } from '@/validations/workValidation'
import { Palette, Target, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkFormProps {
  work?: Work
  onSubmit: (data: CreateWorkParams | UpdateWorkParams) => Promise<void>
  onCancel: () => void
  loading?: boolean
  className?: string
}

export function WorkForm({ work, onSubmit, onCancel, loading = false, className = '' }: WorkFormProps) {
  const [selectedColor, setSelectedColor] = useState(work?.color || COLOR_OPTIONS[0].value)
  
  const isEdit = !!work
  
  const form = useForm<CreateWorkParams | UpdateWorkParams>({
    resolver: zodResolver(isEdit ? updateWorkSchema : createWorkSchema),
    defaultValues: {
      ...(isEdit && { id: work.id }),
      name: work?.name || '',
      description: work?.description || '',
      color: work?.color || COLOR_OPTIONS[0].value,
      target_hours: work?.target_hours || 8
    }
  })

  const handleSubmit = async (data: CreateWorkParams | UpdateWorkParams) => {
    const formData = {
      ...data,
      color: selectedColor
    }
    await onSubmit(formData)
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    form.setValue('color', color)
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEdit ? '编辑作品' : '创建新作品'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>作品名称 *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="输入作品名称..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>作品描述</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="描述这个作品的目标和内容..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 颜色选择 */}
            <div className="space-y-3">
              <FormLabel className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                作品颜色
              </FormLabel>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorSelect(color.value)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      selectedColor === color.value
                        ? 'border-primary scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              {selectedColor && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {COLOR_OPTIONS.find(c => c.value === selectedColor)?.name}
                  </span>
                </div>
              )}
            </div>

            {/* 目标时间 */}
            <FormField
              control={form.control}
              name="target_hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    目标时间（小时）*
                  </FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseFloat(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择目标时间" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_HOUR_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 预览 */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-3">预览</h4>
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <div className="font-medium">
                    {form.watch('name') || '作品名称'}
                  </div>
                  {form.watch('description') && (
                    <div className="text-sm text-muted-foreground">
                      {form.watch('description')}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      目标: {form.watch('target_hours') || 8}小时
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? '更新中...' : '创建中...'}
                  </>
                ) : (
                  isEdit ? '更新作品' : '创建作品'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}