import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Work, CreateWorkParams, UpdateWorkParams, WorkStats } from '@/types/work'
import { WorksAPI } from '@/services/api'
import { WorkFormData } from '@/types/frontend'
import { immer } from 'zustand/middleware/immer'
import { triggerDataSync } from '@/services/DataSyncManager'
import { emit, on } from '@/events/EventBus'
import { errorHandler, ErrorCodes, ErrorCategory } from '@/errors/ErrorHandler'

export interface WorksState {
  works: Work[]
  currentWork: Work | null
  stats: WorkStats | null
  loading: boolean
  error: string | null
  
  // Actions
  addWork: (workData: CreateWorkParams) => Promise<void>
  updateWork: (id: number, workData: Partial<UpdateWorkParams>) => Promise<void>
  deleteWork: (id: number) => Promise<void>
  archiveWork: (id: number) => Promise<void>
  unarchiveWork: (id: number) => Promise<void>
  setCurrentWork: (work: Work | null) => void
  fetchWorks: () => Promise<void>
  fetchWorkStats: (workId: number) => Promise<void>
  fetchAllWorksStats: () => Promise<WorkStats[]>
  clearWorks: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useWorksStore = create<WorksState>()(
  persist(
    immer((set, get) => ({
      works: [],
      currentWork: null,
      stats: null,
      loading: false,
      error: null,

      addWork: async (workData: WorkFormData) => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          const newWork = await WorksAPI.createWork(workData)
          
          set((state) => {
            if (!state.works) {
              state.works = []
            }
            // 确保newWork不是null再添加
            if (newWork && newWork !== undefined) {
              state.works.push(newWork)
            }
            state.loading = false
          })
          
          // 触发智能数据同步
          triggerDataSync('work_created', { workId: newWork.id })
          
          // 发布作品创建事件
          emit('work:created', {
            work: newWork,
            source: 'worksStore'
          }, 'worksStore')
        }, {
          code: ErrorCodes.INVALID_WORK_DATA,
          message: '创建作品失败',
          category: ErrorCategory.BUSINESS_LOGIC,
          source: 'worksStore.addWork'
        })
      },

      updateWork: async (id: number, workData: Partial<WorkFormData>) => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          const updatedWork = await WorksAPI.updateWork(id.toString(), workData)
          
          set((state) => {
            if (!state.works) {
              state.works = []
            }
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex] = updatedWork
            }
            if (state.currentWork?.id === id) {
              state.currentWork = updatedWork
            }
            state.loading = false
          })
          
          // 触发智能数据同步
          triggerDataSync('work_updated', { workId: id })
          
          // 发布作品更新事件
          emit('work:updated', {
            workId: id,
            workData,
            source: 'worksStore'
          }, 'worksStore')
        }, {
          code: ErrorCodes.INVALID_WORK_DATA,
          message: '更新作品失败',
          category: ErrorCategory.BUSINESS_LOGIC,
          source: 'worksStore.updateWork'
        })
      },

      deleteWork: async (id: number) => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          await WorksAPI.deleteWork(id.toString())
          
          set((state) => {
            if (!state.works) {
              state.works = []
            }
            state.works = state.works.filter(w => w.id !== id)
            if (state.currentWork?.id === id) {
              state.currentWork = null
            }
            state.loading = false
          })
          
          // 触发智能数据同步
          triggerDataSync('work_deleted', { workId: id })
          
          // 发布作品删除事件
          emit('work:deleted', {
            workId: id,
            source: 'worksStore'
          }, 'worksStore')
        }, {
          code: ErrorCodes.WORK_NOT_FOUND,
          message: '删除作品失败',
          category: ErrorCategory.BUSINESS_LOGIC,
          source: 'worksStore.deleteWork'
        })
      },

      archiveWork: async (id: number) => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          await WorksAPI.archiveWork(id.toString())
          
          set((state) => {
            if (!state.works) {
              state.works = []
            }
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex].is_archived = true
            }
            state.loading = false
          })
        }, {
          code: ErrorCodes.WORK_NOT_FOUND,
          message: '归档作品失败',
          category: ErrorCategory.BUSINESS_LOGIC,
          source: 'worksStore.archiveWork'
        })
      },

      unarchiveWork: async (id: number) => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          await WorksAPI.unarchiveWork(id.toString())
          
          set((state) => {
            if (!state.works) {
              state.works = []
            }
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex].is_archived = false
            }
            state.loading = false
          })
        }, {
          code: ErrorCodes.WORK_NOT_FOUND,
          message: '取消归档作品失败',
          category: ErrorCategory.BUSINESS_LOGIC,
          source: 'worksStore.unarchiveWork'
        })
      },

      setCurrentWork: (work: Work | null) => {
        set((state) => {
          const previousWork = state.currentWork
          state.currentWork = work
          
          // 如果作品发生变化，发布选择事件
          if (previousWork?.id !== work?.id) {
            // 在set之外发布事件以避免状态更新问题
            setTimeout(() => {
              emit('work:selected', {
                work,
                previousWork,
                source: 'worksStore'
              }, 'worksStore')
            }, 0)
          }
        })
      },

      fetchWorks: async () => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          const works = await WorksAPI.getAllWorks()
          
          set((state) => {
            // 确保works是一个有效的数组，不包含null值
            state.works = Array.isArray(works) ? works.filter(work => work !== null && work !== undefined) : []
            state.loading = false
          })
        }, {
          code: ErrorCodes.API_ERROR,
          message: '获取作品列表失败',
          category: ErrorCategory.API,
          source: 'worksStore.fetchWorks'
        })
      },

      fetchWorkStats: async (workId: number) => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          const stats = await WorksAPI.getWorkStats(workId.toString())
          
          set((state) => {
            state.stats = stats
            state.loading = false
          })
        }, {
          code: ErrorCodes.API_ERROR,
          message: '获取作品统计失败',
          category: ErrorCategory.API,
          source: 'worksStore.fetchWorkStats'
        })
      },

      fetchAllWorksStats: async () => {
        return await errorHandler.withErrorHandling(async () => {
          set({ loading: true, error: null })
          const stats = await WorksAPI.getAllWorksStats()
          set({ loading: false })
          return stats
        }, {
          code: ErrorCodes.API_ERROR,
          message: '获取所有作品统计失败',
          category: ErrorCategory.API,
          source: 'worksStore.fetchAllWorksStats'
        })
      },

      clearWorks: () => {
        set((state) => {
          state.works = []
          state.currentWork = null
          state.stats = null
          state.error = null
          state.loading = false
        })
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.loading = loading
        })
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error
        })
      }
    })),
    {
      name: 'works-storage',
      partialize: (state) => ({
        works: state.works,
        currentWork: state.currentWork
      })
    }
  )
)