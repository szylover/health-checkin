export interface Exercise {
  id: string
  name: string
  sets: number
  reps?: number
  duration?: number    // seconds, used instead of reps
  perSide?: boolean    // e.g. lunges: reps per side
  tip: string
  muscleGroup: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  intensity: '低强度' | '中强度' | '中高强度' | '高强度'
  restSeconds: number
  hydrationPre: number   // ml
  hydrationPost: number  // ml
  exercises: Exercise[]
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'lower-core',
    name: '下肢 + 核心',
    description: 'Phase 2 分化',
    intensity: '中高强度',
    restSeconds: 60,
    hydrationPre: 200,
    hydrationPost: 200,
    exercises: [
      { id: 'squat', name: '深蹲', sets: 3, reps: 15, tip: '手持哑铃增加负重', muscleGroup: '股四头肌' },
      { id: 'lunge', name: '箭步蹲', sets: 3, reps: 12, perSide: true, tip: '手持哑铃', muscleGroup: '股四头肌' },
      { id: 'rdl', name: '罗马尼亚硬拉', sets: 3, reps: 12, tip: '哑铃版，感受腿绳肌拉伸', muscleGroup: '腿绳肌' },
      { id: 'hip-bridge', name: '臀桥', sets: 3, reps: 15, tip: '顶峰挤压臀部2秒', muscleGroup: '臀大肌' },
      { id: 'crunch', name: '卷腹', sets: 3, reps: 15, tip: '慢速，不借力', muscleGroup: '腹直肌' },
      { id: 'side-plank', name: '侧平板', sets: 3, duration: 30, perSide: true, tip: '髋部不要下沉', muscleGroup: '腹斜肌' },
    ],
  },
  {
    id: 'upper-body',
    name: '上肢力量',
    description: '胸背肩手臂',
    intensity: '中高强度',
    restSeconds: 60,
    hydrationPre: 200,
    hydrationPost: 200,
    exercises: [
      { id: 'push-up', name: '俯卧撑', sets: 3, reps: 15, tip: '核心收紧，身体一条线', muscleGroup: '胸大肌' },
      { id: 'db-row', name: '哑铃划船', sets: 3, reps: 12, perSide: true, tip: '肘部向后拉，感受背部发力', muscleGroup: '背阔肌' },
      { id: 'shoulder-press', name: '哑铃肩推', sets: 3, reps: 12, tip: '不要耸肩', muscleGroup: '三角肌' },
      { id: 'lateral-raise', name: '侧平举', sets: 3, reps: 15, tip: '轻重量，控制速度', muscleGroup: '三角肌' },
      { id: 'bicep-curl', name: '弯举', sets: 3, reps: 12, perSide: true, tip: '不要摇晃身体', muscleGroup: '肱二头肌' },
      { id: 'tricep-dip', name: '椅子撑体', sets: 3, reps: 12, tip: '肘部向后不要外张', muscleGroup: '肱三头肌' },
    ],
  },
  {
    id: 'full-body',
    name: '全身有氧力量',
    description: '适合初学者',
    intensity: '中强度',
    restSeconds: 45,
    hydrationPre: 200,
    hydrationPost: 300,
    exercises: [
      { id: 'jumping-jack', name: '开合跳', sets: 3, duration: 30, tip: '热身动作，放松关节', muscleGroup: '全身' },
      { id: 'squat-basic', name: '徒手深蹲', sets: 3, reps: 20, tip: '膝盖不要内扣', muscleGroup: '下肢' },
      { id: 'push-up-basic', name: '俯卧撑', sets: 3, reps: 10, tip: '可以跪姿降低难度', muscleGroup: '上肢' },
      { id: 'plank', name: '平板支撑', sets: 3, duration: 30, tip: '呼吸均匀，腰部不要塌', muscleGroup: '核心' },
      { id: 'mountain-climber', name: '登山跑', sets: 3, duration: 30, tip: '保持核心稳定', muscleGroup: '全身' },
      { id: 'glute-bridge', name: '臀桥', sets: 3, reps: 15, tip: '顶峰保持1秒', muscleGroup: '臀部' },
    ],
  },
]
