import { useRef, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import PageHeader from '../shared/PageHeader'
import { useMealStore, calcNutrition, type CustomFood, type MealEntry, type MealType } from '../../store/mealStore'
import { FOODS, type Food } from '../../data/foods'
import { MEAL_LABELS, MEAL_TIMES, SETTINGS_LABELS } from '../../data/texts'
import { useSettingsStore } from '../../store/settingsStore'
import { useTodayKey } from '../../hooks/useTodayKey'

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

interface VisionFood {
  name: string
  amount: string
  grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

function getEntrySummary(entry: MealEntry, customFoods: CustomFood[]) {
  const food = FOODS.find((item) => item.id === entry.foodId)
  if (food) {
    const factor = food.unit === '克' || food.unit === '毫升' ? entry.amount / 100 : entry.amount
    return {
      name: food.name,
      unit: food.unit,
      calories: food.calories * factor,
      protein: food.protein * factor,
    }
  }

  const customFood = customFoods.find((item) => item.id === entry.foodId)
  if (!customFood) return null

  const factor = entry.amount / 100
  return {
    name: customFood.name,
    unit: customFood.unit,
    calories: customFood.caloriesPer100g * factor,
    protein: customFood.proteinPer100g * factor,
  }
}

export default function CaloriesPage() {
  const date = useTodayKey()
  const allRecords = useMealStore(state => state.records)
  const customFoods = useMealStore(useShallow(state => state.customFoods))
  const addRecord = useMealStore((state) => state.addRecord)
  const removeEntry = useMealStore((state) => state.removeEntry)
  const updateEntry = useMealStore((state) => state.updateEntry)
  const addCustomFood = useMealStore((state) => state.addCustomFood)

  const records = useMemo(() => allRecords.filter(r => r.date === date), [allRecords, date])
  const nutrition = useMemo(() => {
    const entries = records.flatMap(r => r.entries)
    return calcNutrition(entries, customFoods)
  }, [records, customFoods])

  const calorieGoal = useSettingsStore((state) => state.calorieGoal)
  const proteinGoal = useSettingsStore((state) => state.proteinGoal)
  const setGoals = useSettingsStore((state) => state.setGoals)

  const [editingGoals, setEditingGoals] = useState(false)
  const [goalDraft, setGoalDraft] = useState({ calorie: String(calorieGoal), protein: String(proteinGoal) })

  const [adding, setAdding] = useState<MealType | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ food: Food; amount: number } | null>(null)
  const [aiAdvice, setAiAdvice] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMeal, setAiMeal] = useState<MealType>('dinner')
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoFoods, setPhotoFoods] = useState<VisionFood[]>([])
  const [photoMeal, setPhotoMeal] = useState<MealType>('lunch')
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number[]>([])
  const [collapsedMeals, setCollapsedMeals] = useState<Set<MealType>>(new Set())
  const [photoGrams, setPhotoGrams] = useState<Record<number, number>>({})
  const [editingEntry, setEditingEntry] = useState<{ recordId: string; foodId: string; amount: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileMealRef = useRef<MealType>('lunch')

  const toggleMealCollapse = (meal: MealType) => {
    setCollapsedMeals(prev => {
      const next = new Set(prev)
      if (next.has(meal)) next.delete(meal)
      else next.add(meal)
      return next
    })
  }

  const filteredFoods = FOODS.filter((food) =>
    food.name.includes(search) || food.id.includes(search.toLowerCase())
  )

  function handleAddFood() {
    if (!adding || !selected) return
    const entry: MealEntry = { foodId: selected.food.id, amount: selected.amount }
    addRecord(date, adding, [entry])
    setAdding(null)
    setSearch('')
    setSelected(null)
  }

  async function askAIDietAdvice() {
    setAiLoading(true)
    setAiAdvice('')
    try {
      const resp = await fetch('/api/diet-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          calorieGoal,
          proteinGoal,
          meal: aiMeal,
        }),
      })
      if (!resp.ok) throw new Error(`请求失败 (${resp.status})`)
      const data = await resp.json()
      setAiAdvice(data.advice || 'AI 暂无响应')
    } catch (error: unknown) {
      setAiAdvice(`<span style="color:#ef4444">⚠️ ${(error as Error).message}</span>`)
    } finally {
      setAiLoading(false)
    }
  }

  async function handlePhotoUpload(file: File, meal: MealType) {
    setPhotoMeal(meal)
    setPhotoLoading(true)
    setPhotoFoods([])

    try {
      const base64 = await compressImage(file)
      const resp = await fetch('/api/food-vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(import.meta.env.VITE_API_SECRET ? { 'X-API-Secret': import.meta.env.VITE_API_SECRET } : {}),
        },
        body: JSON.stringify({ image: base64 }),
      })
      if (!resp.ok) throw new Error('识别失败')
      const data = await resp.json()
      const foods = data.foods || []
      if (foods.length === 0) {
        alert('未识别到食物，请换一张更清晰的照片重试')
      }
      setPhotoFoods(foods)
      setSelectedPhotoIdx(foods.map((_: VisionFood, index: number) => index))
      const initGrams: Record<number, number> = {}
      foods.forEach((f: VisionFood, i: number) => { initGrams[i] = f.grams || 100 })
      setPhotoGrams(initGrams)
    } catch {
      alert('识别失败，请重试')
    } finally {
      setPhotoLoading(false)
    }
  }

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 800
          let { width, height } = img
          if (width > MAX || height > MAX) {
            if (width > height) {
              height = Math.round(height * MAX / width)
              width = MAX
            } else {
              width = Math.round(width * MAX / height)
              height = MAX
            }
          }
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const openPhotoPicker = (meal: MealType) => {
    fileMealRef.current = meal
    setPhotoMeal(meal)
    fileInputRef.current?.click()
  }

  const handlePhotoInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await handlePhotoUpload(file, fileMealRef.current)
  }

  const togglePhotoSelection = (index: number) => {
    setSelectedPhotoIdx((prev) => prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index])
  }

  const closePhotoModal = () => {
    setPhotoFoods([])
    setSelectedPhotoIdx([])
    setPhotoGrams({})
  }

  const confirmPhotoFoods = () => {
    selectedPhotoIdx.forEach((index) => {
      const food = photoFoods[index]
      const normalizedName = food.name.trim()
      const grams = photoGrams[index] || food.grams || 100

      // Cache hit: reuse existing customFood by name
      const existing = customFoods.find((item) => item.name === normalizedName)
      const foodId = existing ? existing.id : `ai-${normalizedName.replace(/[\s/]/g, '-')}`

      if (!existing) {
        addCustomFood({
          id: foodId,
          name: normalizedName,
          caloriesPer100g: food.grams > 0 ? Math.round(food.calories * 100 / food.grams) : food.calories,
          proteinPer100g: food.grams > 0 ? Math.round(food.protein * 1000 / food.grams) / 10 : food.protein,
          carbsPer100g: food.grams > 0 ? Math.round(food.carbs * 1000 / food.grams) / 10 : food.carbs,
          fatPer100g: food.grams > 0 ? Math.round(food.fat * 1000 / food.grams) / 10 : food.fat,
          unit: '克',
        })
      }

      // Each food gets its own record so it can be deleted independently
      addRecord(date, photoMeal, [{ foodId, amount: grams }])
    })
    closePhotoModal()
  }

  const saveGoals = () => {
    setGoals(Number(goalDraft.calorie), Number(goalDraft.protein))
    setEditingGoals(false)
  }

  const openGoalEditor = () => {
    setGoalDraft({ calorie: String(calorieGoal), protein: String(proteinGoal) })
    setEditingGoals(true)
  }

  return (
    <div>
      <PageHeader title="今日饮食" />
      <div className="p-4 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoInput}
        />

        <div className="bg-green-600 text-white rounded-xl p-4">
          <div className="text-center mb-3">
            <p className="text-3xl font-bold">{Math.round(nutrition.calories)}</p>
            <p className="text-sm opacity-80">kcal</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="font-semibold">{Math.round(nutrition.protein)}g</p>
              <p className="opacity-75 text-xs">蛋白质</p>
            </div>
            <div>
              <p className="font-semibold">{Math.round(nutrition.carbs)}g</p>
              <p className="opacity-75 text-xs">碳水</p>
            </div>
            <div>
              <p className="font-semibold">{Math.round(nutrition.fat)}g</p>
              <p className="opacity-75 text-xs">脂肪</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20">
            {editingGoals ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs opacity-80 w-16">{SETTINGS_LABELS.calorieGoal}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={goalDraft.calorie}
                    onChange={(e) => setGoalDraft((d) => ({ ...d, calorie: e.target.value }))}
                    className="flex-1 px-2 py-1 rounded text-gray-800 text-sm"
                  />
                  <span className="text-xs opacity-80">{SETTINGS_LABELS.kcalUnit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs opacity-80 w-16">{SETTINGS_LABELS.proteinGoal}</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={goalDraft.protein}
                    onChange={(e) => setGoalDraft((d) => ({ ...d, protein: e.target.value }))}
                    className="flex-1 px-2 py-1 rounded text-gray-800 text-sm"
                  />
                  <span className="text-xs opacity-80">{SETTINGS_LABELS.gramUnit}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveGoals}
                    className="flex-1 py-1.5 bg-white text-green-700 rounded-lg text-sm font-medium active:bg-green-50"
                  >
                    {SETTINGS_LABELS.save}
                  </button>
                  <button
                    onClick={() => setEditingGoals(false)}
                    className="flex-1 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium active:bg-white/30"
                  >
                    {SETTINGS_LABELS.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-80">{SETTINGS_LABELS.goalTitle}</span>
                  <button onClick={openGoalEditor} className="text-xs opacity-90 underline active:opacity-70">
                    {SETTINGS_LABELS.edit}
                  </button>
                </div>
                <GoalBar
                  label={SETTINGS_LABELS.calorieGoal}
                  current={nutrition.calories}
                  goal={calorieGoal}
                  unit={SETTINGS_LABELS.kcalUnit}
                />
                <GoalBar
                  label={SETTINGS_LABELS.proteinGoal}
                  current={nutrition.protein}
                  goal={proteinGoal}
                  unit={SETTINGS_LABELS.gramUnit}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <span className="font-semibold text-gray-800">AI 饮食建议</span>
            <div className="ml-auto flex gap-1">
              {MEALS.map((meal) => (
                <button
                  key={meal}
                  onClick={() => setAiMeal(meal)}
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                    aiMeal === meal ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {MEAL_LABELS[meal]}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={askAIDietAdvice}
            disabled={aiLoading}
            className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 active:bg-purple-700"
          >
            {aiLoading ? '🤖 AI 分析中…' : `根据今日摄入，推荐${MEAL_LABELS[aiMeal]}吃什么`}
          </button>
          {aiAdvice && (
            <div
              className="mt-3 text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: aiAdvice }}
            />
          )}
        </div>

        {MEALS.map((meal) => {
          const mealRecords = records.filter((record) => record.meal === meal)
          const isUploadingThisMeal = photoLoading && photoMeal === meal
          const isCollapsed = collapsedMeals.has(meal)
          const mealCalories = mealRecords.flatMap(r => r.entries).reduce((sum, entry) => {
            const s = getEntrySummary(entry, customFoods)
            return sum + (s?.calories ?? 0)
          }, 0)
          return (
            <div key={meal} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <button
                  className="flex items-center gap-2 text-left flex-1"
                  onClick={() => toggleMealCollapse(meal)}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${isCollapsed ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                    {isCollapsed ? '+' : '−'}
                  </span>
                  <span className="font-semibold text-gray-800">{MEAL_LABELS[meal]}</span>
                  <span className="text-xs text-gray-400">{MEAL_TIMES[meal]}</span>
                  {mealCalories > 0 && (
                    <span className="text-xs text-orange-500 ml-1">{Math.round(mealCalories)} kcal</span>
                  )}
                </button>
                {!isCollapsed && (
                  <button
                    onClick={() => openPhotoPicker(meal)}
                    disabled={photoLoading}
                    className="text-purple-600 text-sm font-medium disabled:opacity-40 active:opacity-70 flex-shrink-0"
                  >
                    {isUploadingThisMeal ? '识图中…' : '📷 AI识图'}
                  </button>
                )}
              </div>
              {!isCollapsed && (
                <div className="border-t border-gray-100">
                  {mealRecords.length === 0 ? (
                    <p className="text-sm text-gray-400 px-4 py-3">暂未记录，点 AI识图 拍照添加</p>
                  ) : (
                    mealRecords.map((record) =>
                      record.entries.map((entry) => {
                        const summary = getEntrySummary(entry, customFoods)
                        if (!summary) return null
                        const isEditing = editingEntry?.recordId === record.id && editingEntry?.foodId === entry.foodId
                        return (
                          <div key={`${record.id}-${entry.foodId}`} className="border-b border-gray-50 last:border-0">
                            <div
                              className="flex items-center justify-between px-4 py-2 active:bg-gray-50 cursor-pointer"
                              onClick={() => setEditingEntry(isEditing ? null : { recordId: record.id, foodId: entry.foodId, amount: entry.amount })}
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-700">{summary.name}</p>
                                <p className="text-xs text-gray-400">{entry.amount}{summary.unit}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="text-sm text-orange-500 font-medium">{Math.round(summary.calories)} kcal</span>
                                  <span className="text-xs text-blue-400 ml-2">{Math.round(summary.protein)}g 蛋白</span>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeEntry(record.id, entry.foodId) }}
                                  className="text-gray-300 active:text-red-400 p-1"
                                >✕</button>
                              </div>
                            </div>
                            {isEditing && (
                              <div className="px-4 pb-3 flex items-center gap-2 bg-gray-50">
                                <span className="text-xs text-gray-500">{summary.unit === '克' || summary.unit === '毫升' ? '克数' : '数量'}</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-green-400"
                                  value={editingEntry!.amount}
                                  onChange={(e) => setEditingEntry({ ...editingEntry!, amount: Number(e.target.value) })}
                                />
                                <button
                                  onClick={() => {
                                    if (editingEntry!.amount > 0) {
                                      updateEntry(editingEntry!.recordId, editingEntry!.foodId, editingEntry!.amount)
                                    }
                                    setEditingEntry(null)
                                  }}
                                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg active:bg-green-600"
                                >确认</button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {adding && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={() => setAdding(null)}>
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-4 max-h-[80vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-3">添加{MEAL_LABELS[adding]}食物</h3>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-green-400"
              placeholder="搜索食物..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
            {selected ? (
              <div className="mb-3 bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{selected.food.name}</span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 text-sm">更换</button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="border border-gray-200 rounded px-2 py-1 w-20 text-sm outline-none focus:border-green-400"
                    value={selected.amount}
                    onChange={(event) => setSelected({ ...selected, amount: Number(event.target.value) })}
                    min={1}
                  />
                  <span className="text-sm text-gray-500">{selected.food.unit}</span>
                  <span className="text-xs text-orange-500 ml-auto">
                    {Math.round(selected.food.calories * (
                      selected.food.unit === '克' || selected.food.unit === '毫升'
                        ? selected.amount / 100 : selected.amount
                    ))} kcal
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-1 mb-3">
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                    onClick={() => setSelected({ food, amount: food.defaultAmount })}
                  >
                    <span className="text-sm font-medium text-gray-700">{food.name}</span>
                    <span className="text-xs text-gray-400">{food.calories} kcal/{food.unit === '克' ? '100g' : food.unit}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              disabled={!selected}
              onClick={handleAddFood}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-medium disabled:opacity-40 active:bg-green-700"
            >
              确认添加
            </button>
          </div>
        </div>
      )}

      {(photoLoading || photoFoods.length > 0) && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={() => !photoLoading && closePhotoModal()}>
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-4 max-h-[80vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-3">识图结果 · {MEAL_LABELS[photoMeal]}</h3>
            {photoLoading ? (
              <div className="py-10 text-center text-gray-500">
                <p className="text-3xl mb-3">📷</p>
                <p>AI 正在识别图片中的食物…</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {photoFoods.map((food, index) => {
                    const checked = selectedPhotoIdx.includes(index)
                    const isCached = customFoods.some((item) => item.name === food.name.trim())
                    const grams = photoGrams[index] ?? food.grams ?? 100
                    const factor = food.grams > 0 ? grams / food.grams : 1
                    const displayCal = Math.round(food.calories * factor)
                    return (
                      <div
                        key={`${food.name}-${index}`}
                        className={`rounded-xl border px-4 py-3 transition-colors ${
                          checked ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                              checked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'
                            }`}
                            onClick={() => togglePhotoSelection(index)}
                          >✓</button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-gray-800">{food.name}</span>
                                {isCached && (
                                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">已缓存</span>
                                )}
                              </div>
                              <span className="text-sm text-orange-500 font-medium">{displayCal} kcal</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <input
                                type="number"
                                min={1}
                                value={grams}
                                onChange={(e) => setPhotoGrams(prev => ({ ...prev, [index]: Number(e.target.value) || 1 }))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-16 border border-gray-200 rounded px-2 py-0.5 text-sm text-center outline-none focus:border-green-400"
                              />
                              <span className="text-sm text-gray-400">克</span>
                              <span className="text-xs text-gray-400 ml-1">蛋白 {(food.protein * factor).toFixed(1)}g · 碳水 {(food.carbs * factor).toFixed(1)}g</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={closePhotoModal}
                    className="py-3 border border-gray-200 rounded-xl text-gray-600 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmPhotoFoods}
                    disabled={selectedPhotoIdx.length === 0}
                    className="py-3 bg-green-600 text-white rounded-xl font-medium disabled:opacity-40"
                  >
                    添加所选（{selectedPhotoIdx.length}）
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
function GoalBar({ label, current, goal, unit }: { label: string; current: number; goal: number; unit: string }) {
  const cur = Math.round(current)
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  const over = current > goal
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="opacity-80">{label}</span>
        <span className="opacity-90">
          {cur} / {goal} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-orange-300' : 'bg-white'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
