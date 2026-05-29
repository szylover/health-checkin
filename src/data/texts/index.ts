export const TAB_LABELS = {
  home: '首页',
  checkin: '打卡',
  calories: '热量',
  plan: '计划',
  progress: '进度',
} as const

export const MEAL_LABELS = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
} as const

export const MEAL_TIMES = {
  breakfast: '7:00',
  lunch: '12:00',
  dinner: '18:30',
  snack: '15:00',
} as const

export const INTENSITY_COLORS = {
  '低强度': 'text-blue-500',
  '中强度': 'text-yellow-500',
  '中高强度': 'text-orange-500',
  '高强度': 'text-red-500',
} as const

export const UI = {
  sets: (n: number) => `${n}组`,
  reps: (n: number) => `${n}次`,
  duration: (s: number) => `${s}秒`,
  setsReps: (sets: number, reps: number) => `${sets}×${reps}`,
  setsDuration: (sets: number, s: number) => `${sets}×${s}秒`,
  perSide: '（每侧）',
  calories: (n: number) => `${Math.round(n)} kcal`,
  protein: (n: number) => `蛋白质 ${Math.round(n)}g`,
  carbs: (n: number) => `碳水 ${Math.round(n)}g`,
  fat: (n: number) => `脂肪 ${Math.round(n)}g`,
  hydration: (ml: number) => `${ml}ml`,
  restSeconds: (s: number) => `组间休息${s}秒`,
  checkinDone: '已完成',
  checkinPending: '待完成',
  addFood: '添加食物',
  allDone: '今日训练全部完成 🎉',
  noRecord: '暂无记录',
  totalCalories: '总热量',
  totalProtein: '总蛋白质',
  calorieGoal: '热量目标',
  proteinGoal: '蛋白质目标',
} as const
