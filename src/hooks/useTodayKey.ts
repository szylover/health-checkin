import { useEffect, useState } from 'react'
import { toLocalDateKey } from '../utils/date'

export function useTodayKey() {
  const [todayKey, setTodayKey] = useState(() => toLocalDateKey())

  useEffect(() => {
    let timer: number

    const scheduleNextTick = () => {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime() + 50)

      timer = window.setTimeout(() => {
        setTodayKey(toLocalDateKey())
        scheduleNextTick()
      }, delay)
    }

    scheduleNextTick()
    return () => window.clearTimeout(timer)
  }, [])

  return todayKey
}
