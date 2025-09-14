import { create } from 'zustand'
import { FloatWindowState, FloatWindowConfig } from './FloatWindowTypes'

interface FloatWindowStore extends FloatWindowState {
  // Actions
  setVisible: (visible: boolean) => void
  setMinimized: (minimized: boolean) => void
  setPosition: (x: number, y: number) => void
  setSize: (size: FloatWindowState['size']) => void
  reset: () => void
}

const defaultConfig: FloatWindowConfig = {
  defaultPosition: { x: 100, y: 100 },
  defaultSize: 'standard',
  autoSavePosition: true,
  dragEnabled: true,
  minimizeEnabled: true
}

const initialState: FloatWindowState = {
  isVisible: false,
  isMinimized: false,
  position: defaultConfig.defaultPosition,
  size: defaultConfig.defaultSize
}

export const useFloatWindowStore = create<FloatWindowStore>((set) => ({
  ...initialState,

  setVisible: (visible) => set({ isVisible: visible }),

  setMinimized: (minimized) => set({ isMinimized: minimized }),

  setPosition: (x, y) => set({ position: { x, y } }),

  setSize: (size) => set({ size }),

  reset: () => set(initialState)
}))