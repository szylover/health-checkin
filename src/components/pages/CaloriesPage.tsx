import { useState } from 'react'
import PageHeader from '../shared/PageHeader'
import { useMealStore, type MealType, type MealEntry } from '../../store/mealStore'
import { FOODS, type Food } from '../../data/foods'
import { MEAL_LABELS, MEAL_TIMES } from '../../data/texts'

const todayKey = () => new Date().toISOString().split('T')[0]
const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export default function CaloriesPage() {
  const date = todayKey()
  const getDayRecords = useMealStore((s) => s.getDayRecords)
  const getDayNutrition = useMealStore((s) => s.getDayNutrition)
  const addRecord = useMealStore((s) => s.addRecord)
  const removeRecord = useMealStore((s) => s.removeRecord)

  const records = getDayRecords(date)
  const nutrition = getDayNutrition(date)

  const [adding, setAdding] = useState<MealType | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<{ food: Food; amount: number } | null>(null)

  const filteredFoods = FOODS.filter((f) =>
    f.name.includes(search) || f.id.includes(search.toLowerCase())
  )

  function handleAddFood() {
    if (!adding || !selected) return
    const entry: MealEntry = { foodId: selected.food.id, amount: selected.amount }
    addRecord(date, adding, [entry])
    setAdding(null)
    setSearch('')
    setSelected(null)
  }

  return (
    <div>
      <PageHeader title="今日热量" />
      <div className="p-4 space-y-4">

        {/* Day nutrition summary */}
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
        </div>

        {/* Meals */}
        {MEALS.map((meal) => {
          const mealRecords = records.filter((r) => r.meal === meal)
          return (
            <div key={meal} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <span className="font-semibold text-gray-800">{MEAL_LABELS[meal]}</span>
                  <span className="text-xs text-gray-400 ml-2">{MEAL_TIMES[meal]}</span>
                </div>
                <button
                  onClick={() => setAdding(meal)}
                  className="text-green-600 text-sm font-medium active:opacity-70"
                >
                  + 添加
                </button>
              </div>
              {mealRecords.length === 0 ? (
                <p className="text-sm text-gray-400 px-4 py-3">暂未记录</p>
              ) : (
                mealRecords.map((rec) =>
                  rec.entries.map((entry) => {
                    const food = FOODS.find((f) => f.id === entry.foodId)
                    if (!food) return null
                    const factor = food.unit === '克' || food.unit === '毫升' ? entry.amount / 100 : entry.amount
                    return (
                      <div key={`${rec.id}-${entry.foodId}`} className="flex items-center justify-between px-4 py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{food.name}</p>
                          <p className="text-xs text-gray-400">{entry.amount}{food.unit}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm text-orange-500 font-medium">{Math.round(food.calories * factor)} kcal</span>
                            <span className="text-xs text-blue-400 ml-2">{Math.round(food.protein * factor)}g 蛋白</span>
                          </div>
                          <button onClick={() => removeRecord(rec.id)} className="text-gray-300 active:text-red-400">✕</button>
                        </div>
                      </div>
                    )
                  })
                )
              )}
            </div>
          )
        })}
      </div>

      {/* Add food modal */}
      {adding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setAdding(null)}>
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-3">
              添加{MEAL_LABELS[adding]}食物
            </h3>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-green-400"
              placeholder="搜索食物..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                    onChange={(e) => setSelected({ ...selected, amount: Number(e.target.value) })}
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
    </div>
  )
}
