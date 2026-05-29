import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PageHeader from '../shared/PageHeader'
import { useCheckinStore } from '../../store/checkinStore'
import { useMealStore, calcNutrition } from '../../store/mealStore'
import { toLocalDateKey } from '../../utils/date'

const DAYS = 28

function getDateRange() {
  const dates: string[] = []
  const d = new Date()
  for (let i = DAYS - 1; i >= 0; i--) {
    const day = new Date(d)
    day.setDate(d.getDate() - i)
    dates.push(toLocalDateKey(day))
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
          <StatCard label="近7天均摄入" value={`${Math.round(last7Avg)}`} sub="kcal" icon="🍽️" />
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
              const isToday = date === toLocalDateKey()
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
          <h2 className="font-semibold text-gray-700 mb-3">近7天饮食摄入</h2>
          {(() => {
            const BENCHMARK = 2000
            const BAR_H = 100
            const maxCal = Math.max(...last7.map((d) => nutritionByDate[d] ?? 0), BENCHMARK, 100)
            const benchmarkPx = (BENCHMARK / maxCal) * BAR_H
            return (
              <div>
                <div className="relative" style={{ height: `${BAR_H}px` }}>
                  {/* Benchmark dashed line */}
                  <div
                    className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                    style={{ bottom: `${benchmarkPx}px` }}
                  >
                    <div className="flex-1 border-t-2 border-dashed border-orange-300" />
                    <span className="text-[10px] text-orange-400 ml-1 whitespace-nowrap">目标 {BENCHMARK}</span>
                  </div>
                  {/* Bars */}
                  <div className="flex gap-1.5 items-end absolute inset-0 pr-12">
                    {last7.map((date) => {
                      const calories = nutritionByDate[date] ?? 0
                      const barPx = (calories / maxCal) * BAR_H
                      const isOver = calories > BENCHMARK
                      return (
                        <div key={date} className="flex-1 relative h-full">
                          {calories > 0 && (
                            <span
                              className="absolute left-0 right-0 text-center text-[9px] leading-none text-gray-500"
                              style={{ bottom: `${barPx + 3}px` }}
                            >
                              {Math.round(calories)}
                            </span>
                          )}
                          <div
                            className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all ${isOver ? 'bg-orange-400' : 'bg-green-500'}`}
                            style={{ height: calories > 0 ? `${Math.max(barPx, 3)}px` : '0' }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* Date labels */}
                <div className="flex gap-1.5 mt-1 pr-12">
                  {last7.map((date) => (
                    <div key={date} className="flex-1 text-center">
                      <span className="text-xs text-gray-400">{new Date(date).getDate()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
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
