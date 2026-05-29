import { useMemo, useState } from 'react'
import PageHeader from '../shared/PageHeader'
import { useCheckinStore } from '../../store/checkinStore'
import { EXERCISES, MUSCLE_EMOJIS, MUSCLE_GROUPS, getExercisesByGroup, type MuscleGroup } from '../../data/exercises'
import { useTodayKey } from '../../hooks/useTodayKey'
const DEFAULT_RECORD = { date: '', completedIds: [] as string[], selectedExerciseIds: [] as string[], exerciseAmounts: {} as Record<string, { sets: number; reps: number }>, note: '' }

// Parse default reps string (e.g. "8-10" → 10, "15" → 15)
function parseReps(repsStr: string): number {
  const parts = repsStr.split('-')
  return parseInt(parts[parts.length - 1], 10) || 10
}

const EQUIPMENT_COLORS: Record<string, string> = {
  杠铃: 'bg-red-100 text-red-700',
  哑铃: 'bg-blue-100 text-blue-700',
  器械: 'bg-purple-100 text-purple-700',
  绳索: 'bg-yellow-100 text-yellow-700',
  自重: 'bg-green-100 text-green-700',
}

export default function CheckinPage() {
  const date = useTodayKey()
  const records = useCheckinStore(state => state.records)
  const record = useMemo(() => records.find(r => r.date === date) ?? DEFAULT_RECORD, [records, date])
  const toggleExercise = useCheckinStore((state) => state.toggleExercise)
  const setDayExercises = useCheckinStore((state) => state.setDayExercises)
  const setExerciseAmount = useCheckinStore((state) => state.setExerciseAmount)
  const [selecting, setSelecting] = useState(record.selectedExerciseIds.length === 0)
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([])
  const [pendingIds, setPendingIds] = useState<string[]>(record.selectedExerciseIds)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const isSelecting = selecting || record.selectedExerciseIds.length === 0

  const toggleGroup = (group: MuscleGroup) => {
    setSelectedGroups((prev) => prev.includes(group) ? prev.filter((item) => item !== group) : [...prev, group])
  }

  const togglePending = (id: string) => {
    setPendingIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const confirmSelection = () => {
    setDayExercises(date, pendingIds)
    setSelecting(false)
    setExpandedId(null)
  }

  const filteredExercises = selectedGroups.length === 0
    ? EXERCISES
    : EXERCISES.filter((exercise) => selectedGroups.includes(exercise.muscleGroup))

  const selectedExercises = EXERCISES.filter((exercise) => record.selectedExerciseIds.includes(exercise.id))
  const done = selectedExercises.filter((exercise) => record.completedIds.includes(exercise.id)).length
  const total = selectedExercises.length

  if (isSelecting) {
    return (
      <div>
        <PageHeader
          title="选择今日训练"
          right={pendingIds.length > 0 ? (
            <button
              onClick={confirmSelection}
              className="text-sm bg-white/20 rounded-full px-3 py-0.5 font-medium"
            >
              确定({pendingIds.length})
            </button>
          ) : null}
        />
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-2">按肌群筛选（不选 = 全部）</p>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => toggleGroup(group)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedGroups.includes(group)
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {MUSCLE_EMOJIS[group]} {group}
                </button>
              ))}
            </div>
          </div>

          {(selectedGroups.length === 0 ? MUSCLE_GROUPS : selectedGroups).map((group) => {
            const groupExercises = getExercisesByGroup(group).filter((exercise) =>
              filteredExercises.some((item) => item.id === exercise.id)
            )
            if (groupExercises.length === 0) return null

            return (
              <div key={group}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  {MUSCLE_EMOJIS[group]} {group}
                </h3>
                <div className="space-y-2">
                  {groupExercises.map((exercise) => {
                    const added = pendingIds.includes(exercise.id)
                    return (
                      <div key={exercise.id} className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-800 text-sm">{exercise.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${EQUIPMENT_COLORS[exercise.equipment] ?? 'bg-gray-100 text-gray-500'}`}>
                              {exercise.equipment}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{exercise.sets}组 × {exercise.reps}</p>
                        </div>
                        <button
                          onClick={() => togglePending(exercise.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            added ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {added ? '✓' : '+'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {pendingIds.length > 0 && (
            <button
              onClick={confirmSelection}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold text-base"
            >
              开始训练（{pendingIds.length}个动作）
            </button>
          )}
        </div>
      </div>
    )
  }

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
        <button
          onClick={() => {
            setPendingIds(record.selectedExerciseIds)
            setSelecting(true)
          }}
          className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm"
        >
          ✏️ 换一批 / 添加动作
        </button>

        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(selectedExercises.map((exercise) => exercise.muscleGroup))).map((group) => (
            <span key={group} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
              {MUSCLE_EMOJIS[group]} {group}
            </span>
          ))}
        </div>

        {selectedExercises.map((exercise) => {
          const isDone = record.completedIds.includes(exercise.id)
          const isExpanded = expandedId === exercise.id
          const override = (record.exerciseAmounts ?? {})[exercise.id]
          const sets = override?.sets ?? exercise.sets
          const reps = override?.reps ?? parseReps(exercise.reps)
          return (
            <div
              key={exercise.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-opacity ${isDone ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center px-4 py-3 gap-3">
                <button
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}
                  onClick={() => toggleExercise(date, exercise.id)}
                >
                  {isDone && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <button
                  className="flex-1 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {exercise.name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${EQUIPMENT_COLORS[exercise.equipment] ?? 'bg-gray-100 text-gray-500'}`}>
                      {exercise.equipment}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 font-semibold mt-0.5">{sets}组 × {reps}次</p>
                </button>
                <span className="text-gray-300 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 border-t border-gray-50">
                  <p className="text-sm text-gray-500 mt-2">💡 {exercise.tip}</p>
                  <div className="flex gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">组数</span>
                      <button
                        onClick={() => setExerciseAmount(date, exercise.id, Math.max(1, sets - 1), reps)}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-base active:bg-gray-200"
                      >−</button>
                      <span className="text-sm font-semibold w-5 text-center">{sets}</span>
                      <button
                        onClick={() => setExerciseAmount(date, exercise.id, sets + 1, reps)}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-base active:bg-gray-200"
                      >+</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">次数</span>
                      <button
                        onClick={() => setExerciseAmount(date, exercise.id, sets, Math.max(1, reps - 1))}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-base active:bg-gray-200"
                      >−</button>
                      <span className="text-sm font-semibold w-5 text-center">{reps}</span>
                      <button
                        onClick={() => setExerciseAmount(date, exercise.id, sets, reps + 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-base active:bg-gray-200"
                      >+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {total === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">🏋️</p>
            <p>还没选今日动作</p>
          </div>
        )}

        {done === total && total > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-600 font-semibold text-lg">🎉 今日训练全部完成！</p>
            <p className="text-green-500 text-sm mt-1">你真棒，休息一下吧</p>
          </div>
        )}
      </div>
    </div>
  )
}
