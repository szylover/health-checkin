export type MuscleGroup = '胸' | '背' | '肩' | '手臂' | '腿' | '核心'

export interface GymExercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  sets: number
  reps: string
  tip: string
}

export const MUSCLE_GROUPS: MuscleGroup[] = ['胸', '背', '肩', '手臂', '腿', '核心']

export const MUSCLE_EMOJIS: Record<MuscleGroup, string> = {
  '胸': '💪', '背': '🏋️', '肩': '🔝', '手臂': '💪', '腿': '🦵', '核心': '🎯',
}

export const EXERCISES: GymExercise[] = [
  { id: 'chest-01', name: '杠铃平板卧推', muscleGroup: '胸', equipment: '杠铃', sets: 4, reps: '8-10', tip: '肩胛骨收紧，背部微拱，脚踩地，杠铃触胸后发力' },
  { id: 'chest-02', name: '哑铃上斜卧推', muscleGroup: '胸', equipment: '哑铃', sets: 3, reps: '10-12', tip: '30-45度斜板，感受上胸挤压，不要弹动' },
  { id: 'chest-03', name: '哑铃平板飞鸟', muscleGroup: '胸', equipment: '哑铃', sets: 3, reps: '12-15', tip: '微屈肘，弧线运动，感受胸肌充分拉伸' },
  { id: 'chest-04', name: '绳索夹胸', muscleGroup: '胸', equipment: '绳索', sets: 3, reps: '12-15', tip: '双手在胸前交叉，顶峰收缩1-2秒' },
  { id: 'chest-05', name: '器械蝴蝶机', muscleGroup: '胸', equipment: '器械', sets: 3, reps: '12-15', tip: '控制离心阶段，避免肩关节过度外展' },
  { id: 'chest-06', name: '俯卧撑', muscleGroup: '胸', equipment: '自重', sets: 3, reps: '15-20', tip: '手宽于肩，核心收紧，胸部触地' },
  { id: 'chest-07', name: '双杠臂屈伸（胸式）', muscleGroup: '胸', equipment: '自重', sets: 3, reps: '10-12', tip: '身体前倾45度，感受下胸发力' },
  { id: 'chest-08', name: '哑铃下斜卧推', muscleGroup: '胸', equipment: '哑铃', sets: 3, reps: '10-12', tip: '头低脚高，感受下胸挤压，控制重量' },
  { id: 'chest-09', name: '上斜绳索飞鸟', muscleGroup: '胸', equipment: '绳索', sets: 3, reps: '12-15', tip: '滑轮在低位，向上斜方向夹，感受上胸' },
  { id: 'chest-10', name: '宽距俯卧撑', muscleGroup: '胸', equipment: '自重', sets: 3, reps: '12-15', tip: '手距更宽，着重胸肌外侧，节奏要慢' },
  { id: 'back-01', name: '引体向上', muscleGroup: '背', equipment: '自重', sets: 4, reps: '6-10', tip: '肩胛骨下沉，拉到下巴过杠，全程控制' },
  { id: 'back-02', name: '杠铃硬拉', muscleGroup: '背', equipment: '杠铃', sets: 4, reps: '5-8', tip: '中立脊柱，杠铃贴腿，臀腿同步发力' },
  { id: 'back-03', name: '高位下拉', muscleGroup: '背', equipment: '器械', sets: 4, reps: '10-12', tip: '略后仰15度，肘下沉感受背阔肌收缩' },
  { id: 'back-04', name: '坐姿划船', muscleGroup: '背', equipment: '器械', sets: 3, reps: '10-12', tip: '肩胛骨后缩，肘部拉到腰侧，不要耸肩' },
  { id: 'back-05', name: '单臂哑铃划船', muscleGroup: '背', equipment: '哑铃', sets: 3, reps: '10-12', tip: '膝撑凳上，肘部高过背部，感受背部收缩' },
  { id: 'back-06', name: '俯身杠铃划船', muscleGroup: '背', equipment: '杠铃', sets: 4, reps: '8-10', tip: '上体45-60度，肘紧贴身体，肩胛后缩' },
  { id: 'back-07', name: '面拉', muscleGroup: '背', equipment: '绳索', sets: 3, reps: '15-20', tip: '拇指朝上，肩外旋，训练后三角和肩袖' },
  { id: 'back-08', name: '直腿硬拉', muscleGroup: '背', equipment: '杠铃', sets: 3, reps: '8-10', tip: '感受腘绳肌和下背部充分拉伸，膝微屈' },
  { id: 'back-09', name: '绳索直臂下压', muscleGroup: '背', equipment: '绳索', sets: 3, reps: '12-15', tip: '手臂伸直，以肩为轴向下压，感受背阔肌' },
  { id: 'back-10', name: 'T杠划船', muscleGroup: '背', equipment: '器械', sets: 3, reps: '10-12', tip: '胸贴板，大重量训练背部厚度' },
  { id: 'shoulder-01', name: '哑铃推肩', muscleGroup: '肩', equipment: '哑铃', sets: 4, reps: '10-12', tip: '哑铃与耳同高起始，不要锁肘，保护肩关节' },
  { id: 'shoulder-02', name: '杠铃推肩（坐姿）', muscleGroup: '肩', equipment: '杠铃', sets: 4, reps: '8-10', tip: '杠铃在颈前，感受前束和中束同时发力' },
  { id: 'shoulder-03', name: '哑铃侧平举', muscleGroup: '肩', equipment: '哑铃', sets: 4, reps: '12-15', tip: '小拇指朝上倒水姿势，手肘微屈，不借力' },
  { id: 'shoulder-04', name: '哑铃前平举', muscleGroup: '肩', equipment: '哑铃', sets: 3, reps: '12-15', tip: '交替进行，手心朝下，不要超过肩高' },
  { id: 'shoulder-05', name: '俯身哑铃飞鸟', muscleGroup: '肩', equipment: '哑铃', sets: 3, reps: '12-15', tip: '上体俯90度，手肘微屈，感受后三角发力' },
  { id: 'shoulder-06', name: '绳索侧平举', muscleGroup: '肩', equipment: '绳索', sets: 3, reps: '15-20', tip: '单臂，绳索从身体对侧穿过，弧线稳定' },
  { id: 'shoulder-07', name: '阿诺德推举', muscleGroup: '肩', equipment: '哑铃', sets: 3, reps: '10-12', tip: '旋转动作训练三角肌全头，重量适中' },
  { id: 'shoulder-08', name: '器械推肩', muscleGroup: '肩', equipment: '器械', sets: 3, reps: '10-12', tip: '稳定性强，适合大重量，注意下放幅度' },
  { id: 'shoulder-09', name: '直立划船', muscleGroup: '肩', equipment: '杠铃', sets: 3, reps: '12-15', tip: '肘部高于手，感受中束和斜方肌，不要过高' },
  { id: 'arm-01', name: '杠铃弯举', muscleGroup: '手臂', equipment: '杠铃', sets: 4, reps: '8-10', tip: '肘部固定在体侧，顶峰收缩1秒，控制下放' },
  { id: 'arm-02', name: '哑铃交替弯举', muscleGroup: '手臂', equipment: '哑铃', sets: 3, reps: '10-12', tip: '前臂旋外（手心朝上），感受二头峰收缩' },
  { id: 'arm-03', name: '锤式弯举', muscleGroup: '手臂', equipment: '哑铃', sets: 3, reps: '10-12', tip: '中立握，训练肱肌和前臂，增加手臂围度' },
  { id: 'arm-04', name: '绳索弯举', muscleGroup: '手臂', equipment: '绳索', sets: 3, reps: '12-15', tip: '持续张力，全程收缩，感受肌肉泵感' },
  { id: 'arm-05', name: '集中弯举', muscleGroup: '手臂', equipment: '哑铃', sets: 3, reps: '12-15', tip: '肘抵膝内侧固定，孤立二头，慢速全程' },
  { id: 'arm-06', name: '窄距卧推', muscleGroup: '手臂', equipment: '杠铃', sets: 4, reps: '8-10', tip: '手距与肩同宽，肘贴体侧，感受三头长头' },
  { id: 'arm-07', name: '绳索下压', muscleGroup: '手臂', equipment: '绳索', sets: 4, reps: '12-15', tip: 'V型杆，肘部固定，下压到最低顶峰收缩' },
  { id: 'arm-08', name: '哑铃过头臂屈伸', muscleGroup: '手臂', equipment: '哑铃', sets: 3, reps: '12-15', tip: '肘在耳旁，全程运动，感受三头长头拉伸' },
  { id: 'arm-09', name: '仰卧臂屈伸（法式推）', muscleGroup: '手臂', equipment: '杠铃', sets: 3, reps: '10-12', tip: '肘不外展，EZ杠更护腕，感受长头' },
  { id: 'arm-10', name: '双杠臂屈伸（三头式）', muscleGroup: '手臂', equipment: '自重', sets: 3, reps: '10-15', tip: '身体竖直，感受三头收缩，区别于胸式' },
  { id: 'leg-01', name: '杠铃深蹲', muscleGroup: '腿', equipment: '杠铃', sets: 4, reps: '8-10', tip: '蹲到大腿平行，膝盖不内扣，核心收紧' },
  { id: 'leg-02', name: '腿举', muscleGroup: '腿', equipment: '器械', sets: 4, reps: '10-12', tip: '脚距中等，全程不锁膝，可训练腿部整体' },
  { id: 'leg-03', name: '腿屈伸', muscleGroup: '腿', equipment: '器械', sets: 3, reps: '12-15', tip: '顶峰收缩2秒，孤立股四头肌，注意膝关节' },
  { id: 'leg-04', name: '坐姿腿弯举', muscleGroup: '腿', equipment: '器械', sets: 3, reps: '12-15', tip: '感受腘绳肌全程收缩，不要靠力量甩' },
  { id: 'leg-05', name: '罗马尼亚硬拉', muscleGroup: '腿', equipment: '杠铃', sets: 3, reps: '10-12', tip: '杠铃沿腿下滑，感受腘绳肌和臀部拉伸' },
  { id: 'leg-06', name: '哑铃弓步蹲', muscleGroup: '腿', equipment: '哑铃', sets: 3, reps: '12/侧', tip: '步幅大，前膝不超脚尖，感受前腿发力' },
  { id: 'leg-07', name: '保加利亚分腿蹲', muscleGroup: '腿', equipment: '哑铃', sets: 3, reps: '10/侧', tip: '后脚架于凳上，感受髋屈肌拉伸，注意平衡' },
  { id: 'leg-08', name: '小腿提踵', muscleGroup: '腿', equipment: '器械', sets: 4, reps: '15-20', tip: '全幅度，顶峰收缩2秒，感受小腿充血' },
  { id: 'leg-09', name: '臀推', muscleGroup: '腿', equipment: '杠铃', sets: 4, reps: '10-12', tip: '上背靠凳，臀部顶峰挤压，不要过度伸腰' },
  { id: 'leg-10', name: '哑铃相扑深蹲', muscleGroup: '腿', equipment: '哑铃', sets: 3, reps: '12-15', tip: '宽站距脚外开，感受内收肌和臀部发力' },
  { id: 'core-01', name: '卷腹', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '15-20', tip: '只抬肩胛骨，下背保持贴地，腹肌主导' },
  { id: 'core-02', name: '平板支撑', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '30-60秒', tip: '臀部不翘不塌，肩胛骨展开，均匀呼吸' },
  { id: 'core-03', name: '悬挂举腿', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '10-15', tip: '腰背贴杠铃，腿后侧感受，控制下放不甩' },
  { id: 'core-04', name: '俄罗斯转体', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '20次', tip: '脚离地增加难度，感受侧腹收缩' },
  { id: 'core-05', name: '山地跑', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '30秒', tip: '快节奏交替，保持腰部稳定，不要拱背' },
  { id: 'core-06', name: '仰卧蹬车', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '20次', tip: '对侧肘膝，放慢感受腹斜肌，不要颈部发力' },
  { id: 'core-07', name: '死虫', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '10次', tip: '下背紧贴地面，对侧肢体缓慢伸展，稳定核心' },
  { id: 'core-08', name: '侧平板支撑', muscleGroup: '核心', equipment: '自重', sets: 3, reps: '30秒/侧', tip: '腰不塌，髋部不前后转，感受侧腹发力' },
  { id: 'core-09', name: '绳索卷腹', muscleGroup: '核心', equipment: '绳索', sets: 3, reps: '12-15', tip: '跪姿，以肚脐为轴弯曲，感受腹直肌收缩' },
  { id: 'core-10', name: '腹轮滚动', muscleGroup: '核心', equipment: '器械', sets: 3, reps: '8-10', tip: '膝盖跪地入门，核心绷紧，腰不要塌' },
]

export function getExercisesByGroup(group: MuscleGroup): GymExercise[] {
  return EXERCISES.filter((exercise) => exercise.muscleGroup === group)
}
