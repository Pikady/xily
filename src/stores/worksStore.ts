import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Work, CreateWorkParams, UpdateWorkParams, WorkStats } from '@/types/work'
import { WorksAPI } from '@/services/api'
import { immer } from 'zustand/middleware/immer'

interface WorksState {
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

      addWork: async (workData: CreateWorkParams) => {
        try {
          set({ loading: true, error: null })
          const newWork = await WorksAPI.createWork(workData)
          
          set((state) => {
            state.works.push(newWork)
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add work', loading: false })
          throw error
        }
      },

      updateWork: async (id: number, workData: Partial<UpdateWorkParams>) => {
        try {
          set({ loading: true, error: null })
          const updatedWork = await WorksAPI.updateWork(id.toString(), workData)
          
          set((state) => {
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex] = updatedWork
            }
            if (state.currentWork?.id === id) {
              state.currentWork = updatedWork
            }
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update work', loading: false })
          throw error
        }
      },

      deleteWork: async (id: number) => {
        try {
          set({ loading: true, error: null })
          await WorksAPI.deleteWork(id.toString())
          
          set((state) => {
            state.works = state.works.filter(w => w.id !== id)
            if (state.currentWork?.id === id) {
              state.currentWork = null
            }
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete work', loading: false })
          throw error
        }
      },

      archiveWork: async (id: number) => {
        try {
          set({ loading: true, error: null })
          await WorksAPI.updateWork(id.toString(), { is_archived: true })
          
          set((state) => {
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex].is_archived = true
            }
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to archive work', loading: false })
          throw error
        }
      },

      unarchiveWork: async (id: number) => {
        try {
          set({ loading: true, error: null })
          await WorksAPI.updateWork(id.toString(), { is_archived: false })
          
          set((state) => {
            const workIndex = state.works.findIndex(w => w.id === id)
            if (workIndex !== -1) {
              state.works[workIndex].is_archived = false
            }
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to unarchive work', loading: false })
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
          set({ loading: true, error: null })
          const works = await WorksAPI.getAllWorks()
          
          set((state) => {
            state.works = works
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch works', loading: false })
          throw error
        }
      },

      fetchWorkStats: async (workId: number) => {
        try {
          set({ loading: true, error: null })
          const stats = await WorksAPI.getWorkStats(workId.toString())
          
          set((state) => {
            state.stats = stats
            state.loading = false
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch work stats', loading: false })
          throw error
        }
      },

      fetchAllWorksStats: async () => {
        try {
          set({ loading: true, error: null })
          const stats = await WorksAPI.getAllWorksStats()
          set({ loading: false })
          return stats
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch works stats', loading: false })
          throw error
        }
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