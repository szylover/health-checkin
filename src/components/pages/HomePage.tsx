import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PageHeader from '../shared/PageHeader'
import { useCheckinStore } from '../../store/checkinStore'
import { useMealStore, calcNutrition } from '../../store/mealStore'
import { UI } from '../../data/texts'
import { useNavigate } from 'react-router-dom'
import { toLocalDateKey } from '../../utils/date'

const todayKey = () => toLocalDateKey()
const DEFAULT_RECORD = { date: '', completedIds: [] as string[], selectedExerciseIds: [] as string[], note: '' }

export default function HomePage() {
  const date = todayKey()
  const checkinRecords = useCheckinStore(state => state.records)
  const mealRecords = useMealStore(state => state.records)
  const customFoods = useMealStore(useShallow(state => state.customFoods))
  const streak = useCheckinStore(state => state.getStreak())
  const navigate = useNavigate()

  const record = useMemo(
    () => checkinRecords.find(r => r.date === date) ?? DEFAULT_RECORD,
    [checkinRecords, date]
  )
  const nutrition = useMemo(() => {
    const entries = mealRecords.filter(r => r.date === date).flatMap(r => r.entries)
    return calcNutrition(entries, customFoods)
  }, [mealRecords, customFoods, date])

  const total = record.selectedExerciseIds.length
  const done = record.completedIds.filter((id) => record.selectedExerciseIds.includes(id)).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <PageHeader title="饮食运动计划" />
      <div className="p-4 space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-sm text-gray-500">连续打卡</p>
            <p className="text-2xl font-bold text-green-600">{streak} 天</p>
          </div>
        </div>

        <div
          className="bg-white rounded-xl p-4 shadow-sm cursor-pointer active:bg-gray-50"
          onClick={() => navigate('/checkin')}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">今日训练</h2>
            <span className="text-sm text-gray-400">{total > 0 ? '自定义清单' : '待选择'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-medium text-green-600">{done}/{total}</span>
          </div>
          {total === 0 ? (
            <p className="text-sm text-gray-400 mt-2">去选择今日训练动作</p>
          ) : done === total ? (
            <p className="text-sm text-green-600 mt-2">{UI.allDone}</p>
          ) : null}
        </div>

        <div
          className="bg-white rounded-xl p-4 shadow-sm cursor-pointer active:bg-gray-50"
          onClick={() => navigate('/calories')}
        >
          <h2 className="font-semibold text-gray-800 mb-3">今日饮食</h2>
          <div className="grid grid-cols-2 gap-3">
            <NutritionCard label="总热量" value={`${Math.round(nutrition.calories)}`} unit="kcal" color="text-orange-500" />
            <NutritionCard label="蛋白质" value={`${Math.round(nutrition.protein)}`} unit="g" color="text-blue-500" />
            <NutritionCard label="碳水" value={`${Math.round(nutrition.carbs)}`} unit="g" color="text-yellow-500" />
            <NutritionCard label="脂肪" value={`${Math.round(nutrition.fat)}`} unit="g" color="text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/checkin')}
            className="bg-green-600 text-white rounded-xl p-4 text-center active:bg-green-700"
          >
            <div className="text-2xl mb-1">✅</div>
            <div className="text-sm font-medium">开始打卡</div>
          </button>
          <button
            onClick={() => navigate('/calories')}
            className="bg-orange-500 text-white rounded-xl p-4 text-center active:bg-orange-600"
          >
            <div className="text-2xl mb-1">🍽️</div>
            <div className="text-sm font-medium">记录饮食</div>
          </button>
        </div>
      </div>
    </div>
  )
}

function NutritionCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${color}`}>
        {value}<span className="text-sm font-normal ml-0.5">{unit}</span>
      </p>
    </div>
  )
}
