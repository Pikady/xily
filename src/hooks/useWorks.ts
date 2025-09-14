import { useCallback, useMemo } from 'react'
import { useWorksStore } from '@/stores/worksStore'
import { Work, CreateWorkParams, UpdateWorkParams } from '@/types/work'

export const useWorks = () => {
  const {
    works,
    currentWork,
    stats,
    loading,
    error,
    addWork,
    updateWork,
    deleteWork,
    archiveWork,
    unarchiveWork,
    setCurrentWork,
    fetchWorks,
    fetchWorkStats,
    fetchAllWorksStats,
    clearWorks,
    setLoading,
    setError
  } = useWorksStore()

  // 兼容持久化/初始化阶段的空值
  const worksList = useMemo(() => {
    const filtered = Array.isArray(works) ? works.filter(work => work !== null && work !== undefined) : []
    console.log('🔍 useWorks worksList updated, length:', filtered.length)
    return filtered
  }, [works])

  // 获取活跃作品（未归档）
  const activeWorks = useMemo(() => {
    return worksList.filter(work => work && !work.is_archived)
  }, [worksList])

  // 获取已归档作品
  const archivedWorks = useMemo(() => {
    return worksList.filter(work => work && work.is_archived)
  }, [worksList])

  // 创建作品
  const createWork = useCallback(async (workData: CreateWorkParams) => {
    await addWork(workData)
  }, [addWork])

  // 更新作品
  const editWork = useCallback(async (id: number, workData: Partial<UpdateWorkParams>) => {
    await updateWork(id, workData)
  }, [updateWork])

  // 删除作品
  const removeWork = useCallback(async (id: number) => {
    await deleteWork(id)
  }, [deleteWork])

  // 归档作品
  const archiveWorkById = useCallback(async (id: number) => {
    await archiveWork(id)
  }, [archiveWork])

  // 取消归档作品
  const unarchiveWorkById = useCallback(async (id: number) => {
    await unarchiveWork(id)
  }, [unarchiveWork])

  // 选择当前作品
  const selectWork = useCallback((work: Work | null) => {
    setCurrentWork(work)
  }, [setCurrentWork])

  // 加载作品列表
  const loadWorks = useCallback(async () => {
    await fetchWorks()
  }, [fetchWorks])

  // 加载作品统计
  const loadWorkStats = useCallback(async (workId: number) => {
    await fetchWorkStats(workId)
  }, [fetchWorkStats])

  // 加载所有作品统计
  const loadAllWorksStats = useCallback(async () => {
    return await fetchAllWorksStats()
  }, [fetchAllWorksStats])

  // 清空作品数据
  const clearAllWorks = useCallback(() => {
    clearWorks()
  }, [clearWorks])

  // 设置加载状态
  const setWorksLoading = useCallback((loading: boolean) => {
    setLoading(loading)
  }, [setLoading])

  // 设置错误状态
  const setWorksError = useCallback((error: string | null) => {
    setError(error)
  }, [setError])

  return {
    // 数据
    works: worksList,
    activeWorks,
    archivedWorks,
    currentWork,
    stats,
    loading,
    error,
    
    // 操作
    createWork,
    editWork,
    removeWork,
    archiveWork: archiveWorkById,
    unarchiveWork: unarchiveWorkById,
    selectWork,
    loadWorks,
    loadWorkStats,
    loadAllWorksStats,
    clearAllWorks,
    setWorksLoading,
    setWorksError
  }
}

export default useWorks