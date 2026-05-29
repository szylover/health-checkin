import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PageHeader from '../shared/PageHeader'
import { useCheckinStore } from '../../store/checkinStore'
import { useMealStore, calcNutrition } from '../../store/mealStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useWeightStore } from '../../store/weightStore'
import { WEIGHT_LABELS } from '../../data/texts'
import { useTodayKey } from '../../hooks/useTodayKey'
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
  const today = useTodayKey()
  const records = useCheckinStore((state) => state.records)
  const streak = useCheckinStore((state) => state.getStreak())
  const mealRecords = useMealStore((state) => state.records)
  const customFoods = useMealStore(useShallow((state) => state.customFoods))
  const calorieGoal = useSettingsStore((state) => state.calorieGoal)

  const dates = getDateRange()
  const checkinMap = new Map(records.map((record) => [record.date, getWorkoutCount(record)]))
  const totalCheckins = records.filter((record) => getWorkoutCount(record) > 0).length

  const last7 = dates.slice(-7)
  const last7Key = last7.join()
  const nutritionByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const date of last7) {
      const entries = mealRecords.filter(r => r.date === date).flatMap(r => r.entries)
      map[date] = calcNutrition(entries, customFoods).calories
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealRecords, customFoods, last7Key])

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
              const isToday = date === today
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
            const BENCHMARK = calorieGoal
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

        <WeightCard />

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

function WeightCard() {
  const records = useWeightStore((state) => state.records)
  const setWeight = useWeightStore((state) => state.setWeight)
  const removeWeight = useWeightStore((state) => state.removeWeight)
  const [input, setInput] = useState('')

  const sorted = useMemo(
    () => [...records].sort((a, b) => a.date.localeCompare(b.date)),
    [records]
  )

  const today = toLocalDateKey()
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null
  const change = latest && prev ? Math.round((latest.weight - prev.weight) * 10) / 10 : null

  const recent = sorted.slice(-7)
  const weights = recent.map((r) => r.weight)
  const min = weights.length ? Math.min(...weights) : 0
  const max = weights.length ? Math.max(...weights) : 0
  const span = max - min || 1
  const BAR_H = 80

  const handleRecord = () => {
    const value = Number(input)
    if (!Number.isFinite(value) || value <= 0) return
    setWeight(today, value)
    setInput('')
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700">{WEIGHT_LABELS.title}</h2>
        {latest && (
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-800">
              {latest.weight}
              <span className="text-xs font-normal text-gray-400 ml-0.5">{WEIGHT_LABELS.unit}</span>
            </span>
            {change !== null && change !== 0 && (
              <span className={`text-xs font-medium ${change > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                {change > 0 ? '▲' : '▼'} {Math.abs(change)}
              </span>
            )}
          </div>
        )}
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-gray-400 mb-3">{WEIGHT_LABELS.empty}</p>
      ) : (
        <div className="mb-3">
          <div className="flex gap-1.5 items-end" style={{ height: `${BAR_H}px` }}>
            {recent.map((r) => {
              const barPx = 12 + ((r.weight - min) / span) * (BAR_H - 12)
              const isToday = r.date === today
              return (
                <button
                  key={r.date}
                  title={`${r.date} · ${r.weight}${WEIGHT_LABELS.unit}（点击删除）`}
                  onClick={() => removeWeight(r.date)}
                  className="flex-1 relative h-full flex flex-col justify-end"
                >
                  <span className="text-[9px] leading-none text-gray-500 text-center mb-0.5">{r.weight}</span>
                  <div
                    className={`rounded-t-sm ${isToday ? 'bg-green-500' : 'bg-green-300'}`}
                    style={{ height: `${barPx}px` }}
                  />
                </button>
              )
            })}
          </div>
          <div className="flex gap-1.5 mt-1">
            {recent.map((r) => (
              <div key={r.date} className="flex-1 text-center">
                <span className="text-[10px] text-gray-400">{Number(r.date.split('-')[2])}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={WEIGHT_LABELS.placeholder}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
        />
        <button
          onClick={handleRecord}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium active:bg-green-700"
        >
          {WEIGHT_LABELS.record}
        </button>
      </div>
    </div>
  )
}
