import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FOODS } from '../data/foods'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface MealEntry {
  foodId: string
  amount: number
}

export interface CustomFood {
  id: string
  name: string
  caloriesPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  unit: string
}

export interface MealRecord {
  id: string
  date: string
  meal: MealType
  entries: MealEntry[]
  time: string
}

interface MealStore {
  records: MealRecord[]
  customFoods: CustomFood[]
  getDayRecords: (date: string) => MealRecord[]
  addRecord: (date: string, meal: MealType, entries: MealEntry[], time?: string) => void
  removeRecord: (id: string) => void
  removeEntry: (recordId: string, foodId: string) => void
  updateEntry: (recordId: string, foodId: string, newAmount: number) => void
  updateRecord: (id: string, entries: MealEntry[]) => void
  addCustomFood: (food: CustomFood) => void
  getDayNutrition: (date: string) => { calories: number; protein: number; carbs: number; fat: number }
}

export function calcNutrition(entries: MealEntry[], customFoods: CustomFood[]) {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  for (const entry of entries) {
    const food = FOODS.find((item) => item.id === entry.foodId)
    if (food) {
      const factor = food.unit === '克' || food.unit === '毫升' ? entry.amount / 100 : entry.amount
      calories += food.calories * factor
      protein += food.protein * factor
      carbs += food.carbs * factor
      fat += food.fat * factor
      continue
    }

    const customFood = customFoods.find((item) => item.id === entry.foodId)
    if (!customFood) continue

    const factor = entry.amount / 100
    calories += customFood.caloriesPer100g * factor
    protein += customFood.proteinPer100g * factor
    carbs += customFood.carbsPer100g * factor
    fat += customFood.fatPer100g * factor
  }

  return { calories, protein, carbs, fat }
}

export const DEFAULT_CHECKIN_RECORD = { date: '', completedIds: [] as string[], selectedExerciseIds: [] as string[], note: '' }

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      records: [],
      customFoods: [],

      getDayRecords: (date) => get().records.filter((r) => r.date === date),

      addRecord: (date, meal, entries, time) => {
        const id = `${date}-${meal}-${Date.now()}`
        const now = new Date()
        const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        set((state) => ({
          records: [...state.records, { id, date, meal, entries, time: time ?? defaultTime }],
        }))
      },

      removeRecord: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }))
      },

      removeEntry: (recordId, foodId) => {
        set((state) => ({
          records: state.records
            .map((r) => r.id !== recordId ? r : { ...r, entries: r.entries.filter((e) => e.foodId !== foodId) })
            .filter((r) => r.entries.length > 0),
        }))
      },

      updateEntry: (recordId, foodId, newAmount) => {
        set((state) => ({
          records: state.records.map((r) => r.id !== recordId ? r : {
            ...r,
            entries: r.entries.map((e) => e.foodId === foodId ? { ...e, amount: newAmount } : e),
          }),
        }))
      },

      updateRecord: (id, entries) => {
        set((state) => ({
          records: state.records.map((r) => r.id === id ? { ...r, entries } : r),
        }))
      },

      addCustomFood: (food) => {
        set((state) => ({
          customFoods: [...state.customFoods.filter((item) => item.id !== food.id), food],
        }))
      },

      getDayNutrition: (date) => {
        const { records, customFoods } = get()
        const dayRecords = records.filter((r) => r.date === date)
        const allEntries = dayRecords.flatMap((r) => r.entries)
        return calcNutrition(allEntries, customFoods)
      },
    }),
    { name: 'health-meals' }
  )
)
