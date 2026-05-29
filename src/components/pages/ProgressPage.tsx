import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PageHeader from '../shared/PageHeader'
import { useCheckinStore } from '../../store/checkinStore'
import { useMealStore, calcNutrition } from '../../store/mealStore'

const DAYS = 28

function getDateRange() {
  const dates: string[] = []
  const d = new Date()
  for (let i = DAYS - 1; i >= 0; i--) {
    const day = new Date(d)
    day.setDate(d.getDate() - i)
    dates.push(day.toISOString().split('T')[0])
  }
  return dates
}

function getWorkoutCount(record: { completedIds: string[]; selectedExerciseIds: string[] }) {
  return Math.max(record.completedIds.length, record.selectedExerciseIds.length)
}

export default function ProgressPage() {
  const records = useCheckinStore((state) => state.records)
  const streak = useCheckinStore((state) => state.getStreak())
  const mealRecords = useMealStore((state) => state.records)
  const customFoods = useMealStore(useShallow((state) => state.customFoods))

  const dates = getDateRange()
  const checkinMap = new Map(records.map((record) => [record.date, getWorkoutCount(record)]))
  const totalCheckins = records.filter((record) => getWorkoutCount(record) > 0).length

  const last7 = dates.slice(-7)
  const nutritionByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const date of last7) {
      const entries = mealRecords.filter(r => r.date === date).flatMap(r => r.entries)
      map[date] = calcNutrition(entries, customFoods).calories
    }
    return map
  }, [mealRecords, customFoods, last7.join()])

  const last7Avg = last7.reduce((sum, date) => sum + (nutritionByDate[date] ?? 0), 0) / 7

  return (
    <div>
      <PageHeader title="我的进度" />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="连续打卡" value={`${streak}天`} icon="🔥" />
          <StatCard label="总打卡天数" value={`${totalCheckins}天`} icon="📅" />
          <StatCard label="近7天均热量" value={`${Math.round(last7Avg)}`} sub="kcal" icon="🍽️" />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">打卡日历（近28天）</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-400">{day}</div>
            ))}
            {Array.from({ length: new Date(dates[0]).getDay() }).map((_, index) => (
              <div key={`pad-${index}`} />
            ))}
            {dates.map((date) => {
              const count = checkinMap.get(date) ?? 0
              const isToday = date === new Date().toISOString().split('T')[0]
              return (
                <div
                  key={date}
                  title={date}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium
                    ${count > 0 ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}
                    ${isToday ? 'ring-2 ring-green-600 ring-offset-1' : ''}
                  `}
                >
                  {new Date(date).getDate()}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">近7天热量摄入</h2>
          <div className="flex items-end gap-2 h-24">
            {(() => {
              const maxCal = Math.max(...last7.map((d) => nutritionByDate[d] ?? 0), 100)
              return last7.map((date) => {
                const calories = nutritionByDate[date] ?? 0
                const pct = Math.min((calories / maxCal) * 100, 100)
                const label = new Date(date).getDate()
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-green-500 rounded-t-sm transition-all"
                        style={{ height: `${pct}%`, minHeight: calories > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{label}</span>
                  </div>
                )
              })
            })()}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>{Math.max(...last7.map((d) => nutritionByDate[d] ?? 0), 0) > 0
              ? `${Math.round(Math.max(...last7.map((d) => nutritionByDate[d] ?? 0)))} kcal`
              : '暂无数据'
            }</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">最近打卡记录</h2>
          {records.length === 0 ? (
            <p className="text-sm text-gray-400">暂无记录</p>
          ) : (
            [...records]
              .filter((record) => getWorkoutCount(record) > 0)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map((record) => (
                <div key={record.date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{record.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">
                      {record.completedIds.length}/{Math.max(record.selectedExerciseIds.length, record.completedIds.length)} 个动作
                    </span>
                    <span className="text-green-500">✅</span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm text-center">
      <div className="text-xl mb-1">{icon}</div>
      <p className="font-bold text-gray-800 text-lg leading-none">
        {value}
        {sub && <span className="text-xs font-normal text-gray-400 ml-0.5">{sub}</span>}
      </p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}
