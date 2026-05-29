import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FOODS } from '../data/foods'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealEntry {
  foodId: string
  amount: number  // in unit of the food
}

export interface MealRecord {
  id: string
  date: string
  meal: MealType
  entries: MealEntry[]
  time: string  // 'HH:MM'
}

interface MealStore {
  records: MealRecord[]
  getDayRecords: (date: string) => MealRecord[]
  addRecord: (date: string, meal: MealType, entries: MealEntry[], time?: string) => void
  removeRecord: (id: string) => void
  updateRecord: (id: string, entries: MealEntry[]) => void
  getDayNutrition: (date: string) => { calories: number; protein: number; carbs: number; fat: number }
}

function calcNutrition(entries: MealEntry[]) {
  let calories = 0, protein = 0, carbs = 0, fat = 0
  for (const entry of entries) {
    const food = FOODS.find((f) => f.id === entry.foodId)
    if (!food) continue
    // amount is in food.unit; calories etc are per unit/100g
    const factor = food.unit === '克' || food.unit === '毫升' ? entry.amount / 100 : entry.amount
    calories += food.calories * factor
    protein += food.protein * factor
    carbs += food.carbs * factor
    fat += food.fat * factor
  }
  return { calories, protein, carbs, fat }
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      records: [],

      getDayRecords: (date) => get().records.filter((r) => r.date === date),

      addRecord: (date, meal, entries, time) => {
        const id = `${date}-${meal}-${Date.now()}`
        const now = new Date()
        const defaultTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
        set((state) => ({
          records: [...state.records, { id, date, meal, entries, time: time ?? defaultTime }],
        }))
      },

      removeRecord: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
      },

      updateRecord: (id, entries) => {
        set((state) => ({
          records: state.records.map((r) => r.id === id ? { ...r, entries } : r),
        }))
      },

      getDayNutrition: (date) => {
        const dayRecords = get().records.filter((r) => r.date === date)
        const allEntries = dayRecords.flatMap((r) => r.entries)
        return calcNutrition(allEntries)
      },
    }),
    { name: 'health-meals' }
  )
)
