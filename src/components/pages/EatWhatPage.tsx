import { useState, useCallback } from 'react'
import PageHeader from '../shared/PageHeader'
import { MENU_DB, type Dish, type MenuCategory } from '../../data/menuData'

const SOURCES = Object.keys(MENU_DB)

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function mergeCategories(sources: string[]) {
  const active = sources.length === 0 ? SOURCES : sources
  const cats: Record<keyof MenuCategory, Dish[]> = { hard: [], fastMeat: [], veg: [], cold: [], soup: [] }
  for (const src of active) {
    const menu = MENU_DB[src]
    if (!menu) continue
    for (const cat of Object.keys(cats) as (keyof MenuCategory)[]) {
      cats[cat].push(...menu[cat].map((d: Dish) => ({ ...d, source: src })))
    }
  }
  return cats
}

function generateDishes(menu: ReturnType<typeof mergeCategories>, dCount: number, lockedDishes: Record<number, Dish>): Dish[] {
  const dishes: Dish[] = []
  const usedNames = new Set<string>()
  for (let i = 0; i < dCount; i++) {
    if (lockedDishes[i]) {
      dishes.push(lockedDishes[i])
      usedNames.add(lockedDishes[i].name)
      continue
    }
    const pool = i === 0 ? [...menu.hard, ...menu.fastMeat] : [...menu.fastMeat, ...menu.veg, ...menu.cold]
    if (pool.length === 0) continue
    let pick = pickRandom(pool)
    let attempts = 0
    while (usedNames.has(pick.name) && attempts < 50) { pick = pickRandom(pool); attempts++ }
    dishes.push(pick)
    usedNames.add(pick.name)
  }
  return dishes
}

function generateSoups(menu: ReturnType<typeof mergeCategories>, sCount: number, lockedSoups: Record<number, Dish>): Dish[] {
  const soups: Dish[] = []
  for (let i = 0; i < sCount; i++) {
    if (lockedSoups[i]) { soups.push(lockedSoups[i]); continue }
    if (menu.soup.length > 0) soups.push(pickRandom(menu.soup))
  }
  return soups
}

export default function EatWhatPage() {
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [dishCount, setDishCount] = useState(3)
  const [soupCount, setSoupCount] = useState(1)
  const [peopleCount, setPeopleCount] = useState(2)
  const [dishes, setDishes] = useState<Dish[]>([])
  const [soups, setSoups] = useState<Dish[]>([])
  const [lockedDishes, setLockedDishes] = useState<Record<number, Dish>>({})
  const [lockedSoups, setLockedSoups] = useState<Record<number, Dish>>({})
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const toggleSource = (src: string) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    )
    setLockedDishes({})
    setLockedSoups({})
    setGenerated(false)
    setAiResult('')
  }

  const generate = useCallback(() => {
    const menu = mergeCategories(selectedSources)
    setDishes(generateDishes(menu, dishCount, lockedDishes))
    setSoups(generateSoups(menu, soupCount, lockedSoups))
    setAiResult('')
    setGenerated(true)
  }, [selectedSources, dishCount, soupCount, lockedDishes, lockedSoups])

  const toggleDishLock = (i: number) => {
    setLockedDishes((prev) => {
      const next = { ...prev }
      if (next[i]) delete next[i]; else next[i] = dishes[i]
      return next
    })
  }

  const toggleSoupLock = (i: number) => {
    setLockedSoups((prev) => {
      const next = { ...prev }
      if (next[i]) delete next[i]; else next[i] = soups[i]
      return next
    })
  }

  const askAI = async () => {
    setAiLoading(true)
    setAiResult('')
    try {
      const resp = await fetch('/api/cooking-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishes: dishes.map((d) => d.name),
          soups: soups.map((d) => d.name),
          people: peopleCount,
          mode: selectedSources.includes('奶茶甜品') && selectedSources.length === 1 ? 'tea' : 'cooking',
        }),
      })
      if (!resp.ok) throw new Error(`请求失败 (${resp.status})`)

      const contentType = resp.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream')) {
        setAiLoading(false)
        const reader = resp.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulated = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                setAiResult(accumulated)
              }
            } catch {}
          }
        }
      } else {
        const data = await resp.json()
        setAiResult(data.plan || 'AI 暂无响应')
        setAiLoading(false)
      }
    } catch (e: unknown) {
      setAiResult(`<div style="color:#ef4444">⚠️ ${(e as Error).message}</div>`)
      setAiLoading(false)
    }
  }

  const allItems = [...dishes, ...soups]
  const maxTime = allItems.length > 0 ? Math.max(...allItems.map((d) => d.time)) : 0
  const sumTime = allItems.reduce((s, d) => s + d.time, 0)
  const showSource = selectedSources.length !== 1

  return (
    <div>
      <PageHeader title="今天吃什么" />
      <div className="p-4 space-y-4">

        {/* Source selector */}
        <div>
          <p className="text-xs text-gray-400 mb-2">菜系来源（不选=全部）</p>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((src) => (
              <button
                key={src}
                onClick={() => toggleSource(src)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedSources.includes(src)
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>

        {/* Count controls */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <CountControl label="🍛 菜数" value={dishCount} min={1} max={8} onChange={setDishCount} />
            <CountControl label="🥣 汤数" value={soupCount} min={0} max={3} onChange={setSoupCount} />
            <CountControl label="👥 人数" value={peopleCount} min={1} max={10} onChange={setPeopleCount} />
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          className="w-full py-3.5 bg-green-600 text-white rounded-xl font-semibold text-base active:bg-green-700 transition-colors"
        >
          {generated ? '🔄 不满意，换菜！' : '🎲 帮我做决定！'}
        </button>

        {/* Results */}
        {generated && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-800">今日菜单</p>
              {allItems.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  ⏱ 串行 ~{sumTime}min / 并行最快 ~{maxTime}min
                </p>
              )}
            </div>

            {dishes.map((d, i) => (
              <DishRow
                key={`d-${i}`}
                dish={d}
                locked={!!lockedDishes[i]}
                showSource={showSource}
                color="border-l-green-500"
                onLock={() => toggleDishLock(i)}
                emoji="🍛"
              />
            ))}
            {soups.map((s, i) => (
              <DishRow
                key={`s-${i}`}
                dish={s}
                locked={!!lockedSoups[i]}
                showSource={showSource}
                color="border-l-blue-400"
                onLock={() => toggleSoupLock(i)}
                emoji="🥣"
              />
            ))}

            {/* AI button */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={askAI}
                disabled={aiLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium disabled:opacity-50 active:bg-purple-700"
              >
                {aiLoading ? '🤖 AI 规划中…' : '🤖 AI 帮我规划出餐'}
              </button>
            </div>

            {/* AI result */}
            {aiResult && (
              <div
                className="px-4 pb-4 prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: aiResult }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DishRow({ dish, locked, showSource, color, onLock, emoji }: {
  dish: Dish; locked: boolean; showSource: boolean
  color: string; onLock: () => void; emoji: string
}) {
  return (
    <div className={`flex items-center px-4 py-3 border-b border-gray-50 border-l-4 ${color}`}>
      <span className="mr-2">{emoji}</span>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-gray-800">{dish.name}</span>
        {showSource && dish.source && (
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{dish.source}</span>
        )}
      </div>
      <span className="text-xs text-gray-400 mr-3">⏱{dish.time}min</span>
      <button
        onClick={onLock}
        className={`text-lg transition-transform active:scale-90 ${locked ? 'grayscale-0' : 'opacity-40'}`}
      >
        {locked ? '🔒' : '🔓'}
      </button>
    </div>
  )
}

function CountControl({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center active:bg-gray-200 font-bold"
        >−</button>
        <span className="w-5 text-center font-semibold text-gray-800">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center active:bg-gray-200 font-bold"
        >+</button>
      </div>
    </div>
  )
}
