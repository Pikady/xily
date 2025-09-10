import { useState, useEffect } from 'react'
import { WorkList } from '@/components/works/WorkList'
import { WorkFormModal } from '@/components/works/WorkFormModal'
import { Work } from '@/types/work'
import { useWorks } from '@/hooks/useWorks'
import { toast } from 'sonner'

export function WorksManager() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState<Work | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { loadWorks, error } = useWorks()

  // 加载作品列表
  useEffect(() => {
    loadWorks()
  }, [loadWorks, refreshKey])

  // 处理错误
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // 创建新作品
  const handleCreateWork = () => {
    setEditingWork(undefined)
    setIsFormModalOpen(true)
  }

  // 编辑作品
  const handleEditWork = (work: Work) => {
    setEditingWork(work)
    setIsFormModalOpen(true)
  }

  // 表单提交成功
  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    toast.success(editingWork ? '作品更新成功' : '作品创建成功')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">作品管理</h1>
          <p className="text-muted-foreground mt-2">
            管理你的学习创作作品，追踪进度和时间投入
          </p>
        </div>
      </div>

      {/* 作品列表 */}
      <WorkList
        onCreateWork={handleCreateWork}
        onEditWork={handleEditWork}
      />

      {/* 作品表单模态框 */}
      <WorkFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        work={editingWork}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}