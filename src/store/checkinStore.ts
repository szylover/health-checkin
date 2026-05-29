import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CheckinRecord {
  date: string
  completedIds: string[]
  selectedExerciseIds: string[]
  exerciseAmounts: Record<string, { sets: number; reps: number }>
  note: string
}

interface CheckinStore {
  records: CheckinRecord[]
  getRecord: (date: string) => CheckinRecord
  toggleExercise: (date: string, exerciseId: string) => void
  setDayExercises: (date: string, ids: string[]) => void
  setExerciseAmount: (date: string, exerciseId: string, sets: number, reps: number) => void
  setNote: (date: string, note: string) => void
  getStreak: () => number
}

const today = () => new Date().toISOString().split('T')[0]

export const useCheckinStore = create<CheckinStore>()(
  persist(
    (set, get) => ({
      records: [],

      getRecord: (date) => {
        return get().records.find((r) => r.date === date) ?? { date, completedIds: [], selectedExerciseIds: [], exerciseAmounts: {}, note: '' }
      },

      toggleExercise: (date, exerciseId) => {
        set((state) => {
          const existing = state.records.find((r) => r.date === date)
          if (!existing) {
            return { records: [...state.records, { date, completedIds: [exerciseId], selectedExerciseIds: [], exerciseAmounts: {}, note: '' }] }
          }
          const alreadyDone = existing.completedIds.includes(exerciseId)
          const completedIds = alreadyDone
            ? existing.completedIds.filter((id) => id !== exerciseId)
            : [...existing.completedIds, exerciseId]
          return {
            records: state.records.map((r) => r.date === date ? { ...r, completedIds } : r),
          }
        })
      },

      setDayExercises: (date, ids) => {
        set((state) => {
          const existing = state.records.find((r) => r.date === date)
          if (!existing) {
            return { records: [...state.records, { date, completedIds: [], selectedExerciseIds: ids, exerciseAmounts: {}, note: '' }] }
          }
          return {
            records: state.records.map((r) => r.date === date ? { ...r, selectedExerciseIds: ids } : r),
          }
        })
      },

      setExerciseAmount: (date, exerciseId, sets, reps) => {
        set((state) => {
          const existing = state.records.find((r) => r.date === date)
          if (!existing) {
            return { records: [...state.records, { date, completedIds: [], selectedExerciseIds: [], exerciseAmounts: { [exerciseId]: { sets, reps } }, note: '' }] }
          }
          return {
            records: state.records.map((r) => r.date === date
              ? { ...r, exerciseAmounts: { ...(r.exerciseAmounts ?? {}), [exerciseId]: { sets, reps } } }
              : r),
          }
        })
      },

      setNote: (date, note) => {
        set((state) => {
          const existing = state.records.find((r) => r.date === date)
          if (!existing) {
            return { records: [...state.records, { date, completedIds: [], selectedExerciseIds: [], exerciseAmounts: {}, note }] }
          }
          return { records: state.records.map((r) => r.date === date ? { ...r, note } : r) }
        })
      },

      getStreak: () => {
        const { records } = get()
        let streak = 0
        const d = new Date()
        while (true) {
          const key = d.toISOString().split('T')[0]
          const rec = records.find((r) => r.date === key)
          if (!rec || (rec.completedIds.length === 0 && rec.selectedExerciseIds.length === 0)) {
            if (key === today() && streak === 0) {
              d.setDate(d.getDate() - 1)
              continue
            }
            break
          }
          streak++
          d.setDate(d.getDate() - 1)
        }
        return streak
      },
    }),
    { name: 'health-checkin' }
  )
)
