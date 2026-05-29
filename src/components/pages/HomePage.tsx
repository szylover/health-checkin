import PageHeader from '../shared/PageHeader'
import { useWorkoutStore } from '../../store/workoutStore'
import { useCheckinStore } from '../../store/checkinStore'
import { useMealStore } from '../../store/mealStore'
import { UI } from '../../data/texts'
import { useNavigate } from 'react-router-dom'

const todayKey = () => new Date().toISOString().split('T')[0]

export default function HomePage() {
  const getActive = useWorkoutStore((s) => s.getActiveTemplate)
  const template = getActive()
  const getRecord = useCheckinStore((s) => s.getRecord)
  const record = getRecord(todayKey())
  const getDayNutrition = useMealStore((s) => s.getDayNutrition)
  const nutrition = getDayNutrition(todayKey())
  const streak = useCheckinStore((s) => s.getStreak())
  const navigate = useNavigate()

  const total = template.exercises.length
  const done = record.completedIds.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <PageHeader title="饮食运动计划" />
      <div className="p-4 space-y-4">

        {/* Streak */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-sm text-gray-500">连续打卡</p>
            <p className="text-2xl font-bold text-green-600">{streak} 天</p>
          </div>
        </div>

        {/* Today workout summary */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm cursor-pointer active:bg-gray-50"
          onClick={() => navigate('/checkin')}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">今日训练</h2>
            <span className="text-sm text-gray-400">{template.name}</span>
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
          {done === total && total > 0 && (
            <p className="text-sm text-green-600 mt-2">{UI.allDone}</p>
          )}
        </div>

        {/* Today nutrition summary */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm cursor-pointer active:bg-gray-50"
          onClick={() => navigate('/calories')}
        >
          <h2 className="font-semibold text-gray-800 mb-3">今日热量</h2>
          <div className="grid grid-cols-2 gap-3">
            <NutritionCard label="总热量" value={`${Math.round(nutrition.calories)}`} unit="kcal" color="text-orange-500" />
            <NutritionCard label="蛋白质" value={`${Math.round(nutrition.protein)}`} unit="g" color="text-blue-500" />
            <NutritionCard label="碳水" value={`${Math.round(nutrition.carbs)}`} unit="g" color="text-yellow-500" />
            <NutritionCard label="脂肪" value={`${Math.round(nutrition.fat)}`} unit="g" color="text-gray-500" />
          </div>
        </div>

        {/* Quick actions */}
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
