import { useState } from 'react'
import PageHeader from '../shared/PageHeader'
import { useWorkoutStore } from '../../store/workoutStore'
import { WORKOUT_TEMPLATES } from '../../data/workouts'
import { INTENSITY_COLORS, UI } from '../../data/texts'
import type { Exercise } from '../../data/workouts'

function formatExercise(e: Exercise) {
  if (e.duration) {
    const base = `${e.sets}×${e.duration}秒`
    return e.perSide ? `每侧${base}` : base
  }
  const base = `${e.sets}×${e.reps}`
  return e.perSide ? `${base}（每侧）` : base
}

export default function PlanPage() {
  const { activeTemplateId, setActiveTemplate, getActiveTemplate, updateExercise, resetTemplate } = useWorkoutStore()
  const template = getActiveTemplate()
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Exercise>>({})

  function startEdit(ex: Exercise) {
    setEditing(ex.id)
    setEditValues({ sets: ex.sets, reps: ex.reps, duration: ex.duration, tip: ex.tip })
  }

  function saveEdit(exerciseId: string) {
    updateExercise(activeTemplateId, exerciseId, editValues)
    setEditing(null)
  }

  return (
    <div>
      <PageHeader title="训练计划" />
      <div className="p-4 space-y-4">

        {/* Template selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {WORKOUT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTemplateId === t.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Template info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">{template.name}</h2>
            <button
              onClick={() => resetTemplate(activeTemplateId)}
              className="text-xs text-gray-400 active:text-red-400"
            >
              恢复默认
            </button>
          </div>
          <p className="text-sm text-gray-500">{template.description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 ${INTENSITY_COLORS[template.intensity]}`}>
              {template.intensity}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
              {UI.restSeconds(template.restSeconds)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
              💧 练前 {UI.hydration(template.hydrationPre)}
            </span>
          </div>
        </div>

        {/* Exercise list */}
        <h2 className="font-semibold text-gray-700">训练动作 <span className="text-xs text-gray-400 font-normal">点击编辑</span></h2>
        {template.exercises.map((ex) => (
          <div key={ex.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {editing === ex.id ? (
              <div className="p-4 space-y-3">
                <p className="font-medium text-gray-800">{ex.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">组数</span>
                    <input
                      type="number" min={1} max={10}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400"
                      value={editValues.sets ?? ex.sets}
                      onChange={(e) => setEditValues({ ...editValues, sets: Number(e.target.value) })}
                    />
                  </label>
                  {ex.reps !== undefined && (
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">次数</span>
                      <input
                        type="number" min={1} max={100}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400"
                        value={editValues.reps ?? ex.reps}
                        onChange={(e) => setEditValues({ ...editValues, reps: Number(e.target.value) })}
                      />
                    </label>
                  )}
                  {ex.duration !== undefined && (
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">时长(秒)</span>
                      <input
                        type="number" min={5} max={300}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400"
                        value={editValues.duration ?? ex.duration}
                        onChange={(e) => setEditValues({ ...editValues, duration: Number(e.target.value) })}
                      />
                    </label>
                  )}
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">提示</span>
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400"
                    value={editValues.tip ?? ex.tip}
                    onChange={(e) => setEditValues({ ...editValues, tip: e.target.value })}
                  />
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 active:bg-gray-50">取消</button>
                  <button onClick={() => saveEdit(ex.id)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm active:bg-green-700">保存</button>
                </div>
              </div>
            ) : (
              <button
                className="w-full flex items-center px-4 py-3 gap-3 active:bg-gray-50"
                onClick={() => startEdit(ex)}
              >
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800">{ex.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">💡 {ex.tip}</p>
                </div>
                <span className="text-green-600 font-semibold text-sm">{formatExercise(ex)}</span>
                <span className="text-gray-300 text-xs">▶</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
