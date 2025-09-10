import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WorkForm } from './WorkForm'
import { Work, CreateWorkParams, UpdateWorkParams } from '@/types/work'
import { useWorks } from '@/hooks/useWorks'

interface WorkFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  work?: Work
  onSuccess?: () => void
}

export function WorkFormModal({ open, onOpenChange, work, onSuccess }: WorkFormModalProps) {
  const [loading, setLoading] = useState(false)
  const { createWork, editWork } = useWorks()

  const handleSubmit = async (data: CreateWorkParams | UpdateWorkParams) => {
    setLoading(true)
    try {
      if (work) {
        // 编辑模式
        await editWork(work.id, data as UpdateWorkParams)
      } else {
        // 创建模式
        await createWork(data as CreateWorkParams)
      }
      
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('保存作品失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {work ? '编辑作品' : '创建新作品'}
          </DialogTitle>
        </DialogHeader>
        
        <WorkForm
          work={work}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}