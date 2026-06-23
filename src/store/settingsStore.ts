import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_CALORIE_GOAL = 2000
export const DEFAULT_PROTEIN_GOAL = 120

interface SettingsStore {
  calorieGoal: number
  proteinGoal: number
  setCalorieGoal: (value: number) => void
  setProteinGoal: (value: number) => void
  setGoals: (calorieGoal: number, proteinGoal: number) => void
}

const clampGoal = (value: number, fallback: number) => {
  if (!Number.isFinite(value) || value <= 0) return fallback
  return Math.round(value)
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      calorieGoal: DEFAULT_CALORIE_GOAL,
      proteinGoal: DEFAULT_PROTEIN_GOAL,

      setCalorieGoal: (value) =>
        set({ calorieGoal: clampGoal(value, DEFAULT_CALORIE_GOAL) }),

      setProteinGoal: (value) =>
        set({ proteinGoal: clampGoal(value, DEFAULT_PROTEIN_GOAL) }),

      setGoals: (calorieGoal, proteinGoal) =>
        set({
          calorieGoal: clampGoal(calorieGoal, DEFAULT_CALORIE_GOAL),
          proteinGoal: clampGoal(proteinGoal, DEFAULT_PROTEIN_GOAL),
        }),
    }),
    { name: 'health-settings' }
  )
)
