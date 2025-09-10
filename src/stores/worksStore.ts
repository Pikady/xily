import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Work, WorkFormData, WorkStats } from '@/types/work'
import { immer } from 'zustand/middleware/immer'

interface WorksState {
  works: Work[]
  currentWork: Work | null
  stats: WorkStats | null
  
  // Actions
  addWork: (workData: WorkFormData) => Promise<void>
  updateWork: (id: string, workData: Partial<WorkFormData>) => Promise<void>
  deleteWork: (id: string) => Promise<void>
  setCurrentWork: (work: Work | null) => void
  fetchWorks: () => Promise<void>
  fetchWorkStats: (workId?: string) => Promise<void>
  clearWorks: () => void
}

export const useWorksStore = create<WorksState>()(
  persist(
    immer((set, get) => ({
      works: [],
      currentWork: null,
      stats: null,

      addWork: async (workData: WorkFormData) => {
        try {
          // TODO: 调用API创建作品
          const newWork: Work = {
            id: Date.now().toString(),
            ...workData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            timeRecords: []
          }
          
          set((state) => {
            state.works.push(newWork)
          })
        } catch (error) {
          console.error('Failed to add work:', error)
          throw error
        }
      },

      updateWork: async (id: string, workData: Partial<WorkFormData>) => {
        try {
          // TODO: 调用API更新作品
          set((state) => {
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex] = {
                ...state.works[workIndex],
                ...workData,
                updatedAt: new Date().toISOString()
              }
            }
          })
        } catch (error) {
          console.error('Failed to update work:', error)
          throw error
        }
      },

      deleteWork: async (id: string) => {
        try {
          // TODO: 调用API删除作品
          set((state) => {
            state.works = state.works.filter(w => w.id !== id)
            if (state.currentWork?.id === id) {
              state.currentWork = null
            }
          })
        } catch (error) {
          console.error('Failed to delete work:', error)
          throw error
        }
      },

      setCurrentWork: (work: Work | null) => {
        set((state) => {
          state.currentWork = work
        })
      },

      fetchWorks: async () => {
        try {
          // TODO: 调用API获取作品列表
          // const response = await api.get('/works')
          // set({ works: response.data })
        } catch (error) {
          console.error('Failed to fetch works:', error)
          throw error
        }
      },

      fetchWorkStats: async (workId?: string) => {
        try {
          // TODO: 调用API获取作品统计
          // const response = await api.get(`/works/${workId}/stats`)
          // set({ stats: response.data })
        } catch (error) {
          console.error('Failed to fetch work stats:', error)
          throw error
        }
      },

      clearWorks: () => {
        set((state) => {
          state.works = []
          state.currentWork = null
          state.stats = null
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