export const TAB_LABELS = {
  home: '首页',
  checkin: '打卡',
  calories: '饮食',
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

export const INSTALL_LABELS = {
  title: '把健康打卡添加到主屏幕',
  step1: '点击 Safari 底部的「分享」',
  step2: '，选择「添加到主屏幕」即可像 App 一样使用。',
  dismiss: '关闭',
} as const

export const TIMER_LABELS = {
  rest: '组间休息',
  presets: [60, 90, 120] as const,
  seconds: (s: number) => `${s}秒`,
  add: '+15',
  sub: '-15',
  pause: '暂停',
  resume: '继续',
  skip: '跳过',
  done: '休息结束 💪',
} as const

export const SETTINGS_LABELS = {
  goalTitle: '每日目标',
  edit: '编辑',
  save: '保存',
  cancel: '取消',
  calorieGoal: '热量目标',
  proteinGoal: '蛋白质目标',
  kcalUnit: 'kcal',
  gramUnit: 'g',
  remaining: (n: number) => (n >= 0 ? `还差 ${n}` : `超出 ${Math.abs(n)}`),
} as const

export const WEIGHT_LABELS = {
  title: '体重趋势',
  current: '当前体重',
  change: '较上次',
  placeholder: '输入今日体重 (kg)',
  record: '记录',
  empty: '记录体重，查看变化趋势',
  unit: 'kg',
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
