export interface Food {
  id: string
  name: string
  calories: number   // kcal per 100g (or per unit if unitBased)
  protein: number    // g
  carbs: number      // g
  fat: number        // g
  unit: string       // '克' | '个' | '片' | '杯' | '碗'
  defaultAmount: number
}

export const FOODS: Food[] = [
  // 蛋类
  { id: 'egg', name: '鸡蛋', calories: 72, protein: 6, carbs: 0.4, fat: 5, unit: '个', defaultAmount: 1 },
  { id: 'egg-white', name: '蛋白', calories: 17, protein: 3.6, carbs: 0.2, fat: 0, unit: '个', defaultAmount: 1 },
  // 乳制品
  { id: 'milk', name: '牛奶', calories: 54, protein: 2.9, carbs: 5, fat: 3.2, unit: '毫升', defaultAmount: 200 },
  { id: 'yogurt', name: '酸奶（无糖）', calories: 60, protein: 3.5, carbs: 4.5, fat: 3, unit: '克', defaultAmount: 150 },
  { id: 'cheese', name: '奶酪', calories: 98, protein: 6, carbs: 1, fat: 8, unit: '克', defaultAmount: 30 },
  // 主食
  { id: 'whole-wheat-bread', name: '全麦面包', calories: 86, protein: 4, carbs: 15, fat: 1.5, unit: '片', defaultAmount: 2 },
  { id: 'white-rice', name: '白米饭', calories: 116, protein: 2.5, carbs: 25, fat: 0.3, unit: '克', defaultAmount: 150 },
  { id: 'oats', name: '燕麦片', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, unit: '克', defaultAmount: 50 },
  { id: 'sweet-potato', name: '红薯', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: '克', defaultAmount: 200 },
  { id: 'pasta', name: '意面（熟）', calories: 131, protein: 5, carbs: 25, fat: 1.1, unit: '克', defaultAmount: 150 },
  { id: 'corn', name: '玉米', calories: 86, protein: 3.2, carbs: 19, fat: 1, unit: '根', defaultAmount: 1 },
  // 蛋白质
  { id: 'chicken-breast', name: '鸡胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '克', defaultAmount: 100 },
  { id: 'beef', name: '牛肉（瘦）', calories: 250, protein: 26, carbs: 0, fat: 15, unit: '克', defaultAmount: 100 },
  { id: 'pork-lean', name: '猪肉（瘦）', calories: 143, protein: 20, carbs: 0, fat: 7, unit: '克', defaultAmount: 100 },
  { id: 'salmon', name: '三文鱼', calories: 208, protein: 20, carbs: 0, fat: 13, unit: '克', defaultAmount: 100 },
  { id: 'tuna', name: '金枪鱼（水浸）', calories: 116, protein: 26, carbs: 0, fat: 1, unit: '克', defaultAmount: 100 },
  { id: 'shrimp', name: '虾', calories: 99, protein: 24, carbs: 0, fat: 0.3, unit: '克', defaultAmount: 100 },
  { id: 'tofu', name: '豆腐', calories: 76, protein: 8, carbs: 1.9, fat: 4.2, unit: '克', defaultAmount: 150 },
  // 蔬菜
  { id: 'broccoli', name: '西兰花', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: '克', defaultAmount: 100 },
  { id: 'spinach', name: '菠菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: '克', defaultAmount: 100 },
  { id: 'tomato', name: '番茄', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: '个', defaultAmount: 1 },
  { id: 'cucumber', name: '黄瓜', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, unit: '根', defaultAmount: 1 },
  { id: 'carrot', name: '胡萝卜', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, unit: '根', defaultAmount: 1 },
  { id: 'cabbage', name: '卷心菜', calories: 25, protein: 1.3, carbs: 6, fat: 0.1, unit: '克', defaultAmount: 100 },
  // 水果
  { id: 'banana', name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: '根', defaultAmount: 1 },
  { id: 'apple', name: '苹果', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: '个', defaultAmount: 1 },
  { id: 'orange', name: '橙子', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: '个', defaultAmount: 1 },
  { id: 'blueberry', name: '蓝莓', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, unit: '克', defaultAmount: 80 },
  // 坚果 & 油脂
  { id: 'almond', name: '杏仁', calories: 579, protein: 21, carbs: 22, fat: 50, unit: '克', defaultAmount: 30 },
  { id: 'peanut-butter', name: '花生酱', calories: 588, protein: 25, carbs: 20, fat: 50, unit: '克', defaultAmount: 15 },
  { id: 'olive-oil', name: '橄榄油', calories: 884, protein: 0, carbs: 0, fat: 100, unit: '克', defaultAmount: 10 },
  // 饮品
  { id: 'protein-shake', name: '蛋白粉（1勺）', calories: 120, protein: 25, carbs: 3, fat: 1.5, unit: '勺', defaultAmount: 1 },
  { id: 'green-tea', name: '绿茶（无糖）', calories: 2, protein: 0, carbs: 0.5, fat: 0, unit: '杯', defaultAmount: 1 },
]

export const FOOD_CATEGORIES = {
  egg: '蛋类',
  milk: '乳制品',
  yogurt: '乳制品',
  cheese: '乳制品',
  'whole-wheat-bread': '主食',
  'white-rice': '主食',
  oats: '主食',
  'sweet-potato': '主食',
  pasta: '主食',
  corn: '主食',
  'chicken-breast': '蛋白质',
  beef: '蛋白质',
  'pork-lean': '蛋白质',
  salmon: '蛋白质',
  tuna: '蛋白质',
  shrimp: '蛋白质',
  tofu: '蛋白质',
  broccoli: '蔬菜',
  spinach: '蔬菜',
  tomato: '蔬菜',
  cucumber: '蔬菜',
  carrot: '蔬菜',
  cabbage: '蔬菜',
  banana: '水果',
  apple: '水果',
  orange: '水果',
  blueberry: '水果',
  almond: '坚果',
  'peanut-butter': '坚果',
  'olive-oil': '油脂',
  'protein-shake': '饮品',
  'green-tea': '饮品',
  'egg-white': '蛋类',
} as const
