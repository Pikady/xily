import { z } from 'zod'
import { CreateWorkParams, UpdateWorkParams } from '@/types/work'

// 创建作品的验证schema
export const createWorkSchema = z.object({
  name: z.string()
    .min(1, '作品名称不能为空')
    .max(100, '作品名称不能超过100个字符'),
  description: z.string()
    .max(500, '作品描述不能超过500个字符')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '颜色格式不正确')
    .optional(),
  target_hours: z.number()
    .min(0.5, '目标时间至少为0.5小时')
    .max(1000, '目标时间不能超过1000小时')
    .default(8)
})

// 更新作品的验证schema
export const updateWorkSchema = createWorkSchema.partial().extend({
  id: z.number().positive('作品ID必须为正数')
})

// 表单数据类型
export type WorkFormData = z.infer<typeof createWorkSchema>
export type UpdateWorkFormData = z.infer<typeof updateWorkSchema>

// 颜色选项
export const COLOR_OPTIONS = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '黄色', value: '#f59e0b' },
  { name: '红色', value: '#ef4444' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '粉色', value: '#ec4899' },
  { name: '青色', value: '#06b6d4' },
  { name: '橙色', value: '#f97316' },
  { name: '灰色', value: '#6b7280' },
  { name: '靛蓝色', value: '#6366f1' }
]

// 默认目标时间选项
export const TARGET_HOUR_OPTIONS = [
  { label: '1小时', value: 1 },
  { label: '2小时', value: 2 },
  { label: '4小时', value: 4 },
  { label: '8小时', value: 8 },
  { label: '16小时', value: 16 },
  { label: '24小时', value: 24 },
  { label: '40小时', value: 40 },
  { label: '80小时', value: 80 },
  { label: '160小时', value: 160 }
]

// 验证函数
export const validateWorkForm = (data: unknown): WorkFormData => {
  return createWorkSchema.parse(data)
}

export const validateUpdateWorkForm = (data: unknown): UpdateWorkFormData => {
  return updateWorkSchema.parse(data)
}