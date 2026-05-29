import PageHeader from '../shared/PageHeader'
import { useCheckinStore } from '../../store/checkinStore'
import { useMealStore } from '../../store/mealStore'

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

export default function ProgressPage() {
  const records = useCheckinStore((s) => s.records)
  const streak = useCheckinStore((s) => s.getStreak())
  const getDayNutrition = useMealStore((s) => s.getDayNutrition)

  const dates = getDateRange()
  const checkinMap = new Map(records.map((r) => [r.date, r.completedIds.length]))

  const totalCheckins = records.filter((r) => r.completedIds.length > 0).length
  const last7 = dates.slice(-7)
  const last7Avg = last7.reduce((sum, d) => {
    const n = getDayNutrition(d)
    return sum + n.calories
  }, 0) / 7

  return (
    <div>
      <PageHeader title="我的进度" />
      <div className="p-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="连续打卡" value={`${streak}天`} icon="🔥" />
          <StatCard label="总打卡天数" value={`${totalCheckins}天`} icon="📅" />
          <StatCard label="近7天均热量" value={`${Math.round(last7Avg)}`} sub="kcal" icon="🍽️" />
        </div>

        {/* Calendar heatmap */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">打卡日历（近28天）</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {['日','一','二','三','四','五','六'].map((d) => (
              <div key={d} className="text-center text-xs text-gray-400">{d}</div>
            ))}
            {/* padding for first day of week */}
            {Array.from({ length: new Date(dates[0]).getDay() }).map((_, i) => (
              <div key={`pad-${i}`} />
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

        {/* Last 7 days calories bar chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">近7天热量摄入</h2>
          <div className="flex items-end gap-2 h-24">
            {last7.map((date) => {
              const n = getDayNutrition(date)
              const maxCal = 2500
              const pct = Math.min((n.calories / maxCal) * 100, 100)
              const label = new Date(date).getDate()
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className="w-full bg-green-500 rounded-t-sm transition-all"
                      style={{ height: `${pct}%`, minHeight: n.calories > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>2500 kcal</span>
          </div>
        </div>

        {/* Recent checkins list */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">最近打卡记录</h2>
          {records.length === 0 ? (
            <p className="text-sm text-gray-400">暂无记录</p>
          ) : (
            [...records]
              .filter((r) => r.completedIds.length > 0)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map((r) => (
                <div key={r.date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{r.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">{r.completedIds.length} 个动作</span>
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
