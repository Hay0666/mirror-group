import { create } from 'zustand'
import type { SimulationStatus, SimulationRun, FrictionEvent } from '@/types'

interface SimulationStore {
  status: SimulationStatus
  currentRun: SimulationRun | null
  liveEvents: FrictionEvent[]
  progress: number // 0-100
  showFrictionMatrix: boolean

  setStatus: (status: SimulationStatus) => void
  setCurrentRun: (run: SimulationRun | null) => void
  addLiveEvent: (event: FrictionEvent) => void
  setProgress: (progress: number) => void
  setShowFrictionMatrix: (show: boolean) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  status: 'IDLE',
  currentRun: null,
  liveEvents: [],
  progress: 0,
  showFrictionMatrix: false,

  setStatus: (status) => set({ status }),
  setCurrentRun: (run) => set({ currentRun: run }),
  addLiveEvent: (event) => set((s) => ({ liveEvents: [...s.liveEvents, event] })),
  setProgress: (progress) => set({ progress }),
  setShowFrictionMatrix: (show) => set({ showFrictionMatrix: show }),
  reset: () => set({ status: 'IDLE', currentRun: null, liveEvents: [], progress: 0, showFrictionMatrix: false }),
}))
