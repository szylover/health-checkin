import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WeightRecord {
  date: string
  weight: number
}

interface WeightStore {
  records: WeightRecord[]
  setWeight: (date: string, weight: number) => void
  removeWeight: (date: string) => void
  getSorted: () => WeightRecord[]
  getLatest: () => WeightRecord | null
}

export const useWeightStore = create<WeightStore>()(
  persist(
    (set, get) => ({
      records: [],

      setWeight: (date, weight) => {
        if (!Number.isFinite(weight) || weight <= 0) return
        const rounded = Math.round(weight * 10) / 10
        set((state) => {
          const others = state.records.filter((r) => r.date !== date)
          return { records: [...others, { date, weight: rounded }] }
        })
      },

      removeWeight: (date) => {
        set((state) => ({ records: state.records.filter((r) => r.date !== date) }))
      },

      getSorted: () => [...get().records].sort((a, b) => a.date.localeCompare(b.date)),

      getLatest: () => {
        const sorted = [...get().records].sort((a, b) => a.date.localeCompare(b.date))
        return sorted.length > 0 ? sorted[sorted.length - 1] : null
      },
    }),
    { name: 'health-weight' }
  )
)
