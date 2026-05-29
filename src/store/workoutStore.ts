import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WORKOUT_TEMPLATES, type WorkoutTemplate, type Exercise } from '../data/workouts'

interface WorkoutStore {
  // user's active template id (defaults to first template)
  activeTemplateId: string
  // user-customized templates (overrides built-in if id matches)
  customTemplates: WorkoutTemplate[]
  setActiveTemplate: (id: string) => void
  getActiveTemplate: () => WorkoutTemplate
  updateExercise: (templateId: string, exerciseId: string, patch: Partial<Exercise>) => void
  resetTemplate: (templateId: string) => void
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeTemplateId: WORKOUT_TEMPLATES[0].id,
      customTemplates: [],

      setActiveTemplate: (id) => set({ activeTemplateId: id }),

      getActiveTemplate: () => {
        const { activeTemplateId, customTemplates } = get()
        const custom = customTemplates.find((t) => t.id === activeTemplateId)
        if (custom) return custom
        return WORKOUT_TEMPLATES.find((t) => t.id === activeTemplateId) ?? WORKOUT_TEMPLATES[0]
      },

      updateExercise: (templateId, exerciseId, patch) => {
        set((state) => {
          const base = state.customTemplates.find((t) => t.id === templateId)
            ?? WORKOUT_TEMPLATES.find((t) => t.id === templateId)
          if (!base) return state
          const updated: WorkoutTemplate = {
            ...base,
            exercises: base.exercises.map((e) =>
              e.id === exerciseId ? { ...e, ...patch } : e
            ),
          }
          const customs = state.customTemplates.filter((t) => t.id !== templateId)
          return { customTemplates: [...customs, updated] }
        })
      },

      resetTemplate: (templateId) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== templateId),
        }))
      },
    }),
    { name: 'health-workout' }
  )
)
