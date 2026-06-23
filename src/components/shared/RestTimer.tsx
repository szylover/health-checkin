import { useEffect, useRef, useState } from 'react'
import { TIMER_LABELS } from '../../data/texts'

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    osc.onended = () => ctx.close()
  } catch {
    // Audio not available — silently ignore
  }
}

function format(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function RestTimer({ initialSeconds, onClose }: { initialSeconds: number; onClose: () => void }) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [paused, setPaused] = useState(false)
  const finishedRef = useRef(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [paused])

  useEffect(() => {
    if (remaining === 0 && !finishedRef.current) {
      finishedRef.current = true
      beep()
      navigator.vibrate?.(400)
      const id = setTimeout(onClose, 1200)
      return () => clearTimeout(id)
    }
  }, [remaining, onClose])

  const finished = remaining === 0
  const pct = initialSeconds > 0 ? (remaining / initialSeconds) * 100 : 0

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center pointer-events-none safe-area-bottom">
      <div className="pointer-events-auto w-full max-w-lg m-3 mb-[4.5rem] rounded-2xl bg-gray-900 text-white shadow-xl overflow-hidden">
        <div className="h-1 bg-white/15">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${finished ? 'bg-green-400' : 'bg-green-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-xs text-white/60 w-12">{TIMER_LABELS.rest}</span>
          <span className="text-2xl font-bold tabular-nums flex-1 text-center">
            {finished ? TIMER_LABELS.done : format(remaining)}
          </span>
          {!finished ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRemaining((r) => Math.max(1, r - 15))}
                className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium active:bg-white/20"
              >
                {TIMER_LABELS.sub}
              </button>
              <button
                onClick={() => setRemaining((r) => r + 15)}
                className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium active:bg-white/20"
              >
                {TIMER_LABELS.add}
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium active:bg-white/20"
              >
                {paused ? TIMER_LABELS.resume : TIMER_LABELS.pause}
              </button>
              <button
                onClick={onClose}
                className="px-2 py-1 rounded-lg bg-green-600 text-xs font-medium active:bg-green-700"
              >
                {TIMER_LABELS.skip}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-green-600 text-xs font-medium active:bg-green-700"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
