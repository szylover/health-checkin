import { useState } from 'react'
import PageHeader from '../shared/PageHeader'
import { useWorkoutStore } from '../../store/workoutStore'
import { useCheckinStore } from '../../store/checkinStore'
import { INTENSITY_COLORS, UI } from '../../data/texts'
import type { Exercise } from '../../data/workouts'

const todayKey = () => new Date().toISOString().split('T')[0]

function formatExercise(e: Exercise) {
  if (e.duration) {
    const label = `${e.sets}×${e.duration}秒`
    return e.perSide ? `每侧${label}` : label
  }
  const label = `${e.sets}×${e.reps}`
  return e.perSide ? `${label}（每侧）` : label
}

export default function CheckinPage() {
  const getActive = useWorkoutStore((s) => s.getActiveTemplate)
  const template = getActive()
  const getRecord = useCheckinStore((s) => s.getRecord)
  const toggle = useCheckinStore((s) => s.toggleExercise)
  const [expanded, setExpanded] = useState<string | null>(null)

  const date = todayKey()
  const record = getRecord(date)

  const done = record.completedIds.length
  const total = template.exercises.length
  const allDone = done === total && total > 0

  return (
    <div>
      <PageHeader
        title="今日打卡"
        right={
          <span className="text-sm bg-white/20 rounded-full px-2 py-0.5">
            {done}/{total}
          </span>
        }
      />
      <div className="p-4 space-y-3">

        {/* Template info */}
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2">
            <span>📋</span>
            <span className="text-sm text-gray-600">内容</span>
            <span className="text-sm font-medium">{template.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💪</span>
            <span className="text-sm text-gray-600">强度</span>
            <span className={`text-sm font-medium ${INTENSITY_COLORS[template.intensity]}`}>
              {template.intensity}，{UI.restSeconds(template.restSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>💧</span>
            <span className="text-sm text-gray-600">补水</span>
            <span className="text-sm font-medium">
              练前{UI.hydration(template.hydrationPre)}，练后立刻喝牛奶{UI.hydration(template.hydrationPost)}
            </span>
          </div>
        </div>

        {/* Exercise list */}
        <h2 className="font-semibold text-gray-700 pt-1">力量训练动作</h2>
        {template.exercises.map((ex) => {
          const isDone = record.completedIds.includes(ex.id)
          const isExpanded = expanded === ex.id
          return (
            <div
              key={ex.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${isDone ? 'opacity-70' : ''}`}
            >
              <button
                className="w-full flex items-center px-4 py-3 gap-3 active:bg-gray-50"
                onClick={() => setExpanded(isExpanded ? null : ex.id)}
              >
                <button
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                  onClick={(e) => { e.stopPropagation(); toggle(date, ex.id) }}
                >
                  {isDone && <span className="text-white text-xs">✓</span>}
                </button>
                <span className={`flex-1 text-left font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {ex.name}
                </span>
                <span className="text-green-600 font-semibold text-sm">{formatExercise(ex)}</span>
                <span className="text-gray-300 text-xs">{isExpanded ? '▲' : '▶'}</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 pt-0">
                  <p className="text-sm text-gray-500">
                    <span className="mr-1">💡</span>{ex.tip}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">肌肉群：{ex.muscleGroup}</p>
                </div>
              )}
            </div>
          )
        })}

        {allDone && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-600 font-semibold">{UI.allDone}</p>
          </div>
        )}
      </div>
    </div>
  )
}
