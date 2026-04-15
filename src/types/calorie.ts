export interface UserProfile {
  age: number;
  height: number;
  weight: number;
  gender: "male" | "female";
}

export interface CalorieRecord {
  id: string;
  description: string;
  type: "food" | "exercise";
  calories: number;
  time: string;
}

export interface WeightRecord {
  date: string;
  weight: number;
}

/* ───── 后端 API 对齐类型 ───── */

export type CalorieType = "intake" | "burn";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type EntrySource = "manual" | "healthkit" | "barcode" | "ai";

export interface NutritionInfo {
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
}

export interface MineralsInfo {
  calcium?: number;
  magnesium?: number;
  potassium?: number;
  sodium?: number;
  phosphorus?: number;
  iron?: number;
  zinc?: number;
  manganese?: number;
  copper?: number;
  selenium?: number;
  iodine?: number;
  chromium?: number;
  fluoride?: number;
}

export interface CalorieEntry {
  _id: string;
  userId: string;
  type: CalorieType;
  calories: number;
  water?: number;
  title: string;
  description?: string;
  images?: string[];
  mealType?: MealType;
  source?: EntrySource;
  externalId?: string;
  nutrition?: NutritionInfo;
  minerals?: MineralsInfo;
  duration?: number; // 运动时长（分钟）
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalorieEntryDto {
  type: CalorieType;
  calories: number;
  water?: number;
  title: string;
  description?: string;
  entryDate: string;
  mealType?: MealType;
  source?: EntrySource;
  externalId?: string;
  nutrition?: NutritionInfo;
  minerals?: MineralsInfo;
  duration?: number; // 运动时长（分钟）
}

export type UpdateCalorieEntryDto = Partial<CreateCalorieEntryDto>;

export interface QueryCalorieEntryParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  type?: CalorieType;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

/* ───── 每日摘要类型 ───── */

export interface DailySummaryItem {
  totalIntake: number;
  totalBurn: number;
}

export type DailySummaryMap = Record<string, DailySummaryItem>;

export interface PresetItem {
  label: string;
  calories: number;
  duration?: number; // 运动时长（分钟）
}

export const foodPresets: PresetItem[] = [
  { label: "米饭(一碗)", calories: 230 },
  { label: "全麦面包(一片)", calories: 120 },
  { label: "鸡蛋(一个)", calories: 78 },
  { label: "牛奶(250ml)", calories: 150 },
  { label: "鸡胸肉(100g)", calories: 165 },
  { label: "苹果(一个)", calories: 95 },
  { label: "香蕉(一根)", calories: 105 },
  { label: "酸奶(一杯)", calories: 120 },
  { label: "番茄炒蛋(一份)", calories: 180 },
  { label: "炒青菜(一份)", calories: 80 },
  { label: "沙拉(一份)", calories: 150 },
  { label: "可乐(330ml)", calories: 140 },
  { label: "奶茶(一杯)", calories: 300 },
  { label: "包子(一个)", calories: 120 },
  { label: "豆浆(一杯)", calories: 80 },
  { label: "面条(一碗)", calories: 280 },
];

export const exercisePresets: PresetItem[] = [
  { label: "跑步", calories: 300, duration: 30 },
  { label: "快走", calories: 150, duration: 30 },
  { label: "游泳", calories: 250, duration: 30 },
  { label: "骑自行车", calories: 200, duration: 30 },
  { label: "瑜伽", calories: 120, duration: 30 },
  { label: "力量训练", calories: 200, duration: 30 },
  { label: "跳绳", calories: 180, duration: 15 },
  { label: "散步", calories: 100, duration: 30 },
  { label: "爬楼梯", calories: 130, duration: 15 },
  { label: "打篮球", calories: 240, duration: 30 },
  { label: "羽毛球", calories: 200, duration: 30 },
];

/* ───── 图片营养分析类型 ───── */

export interface ImageNutritionFood {
  name: string;
  calories: number;
  water: number;
  nutrition: NutritionInfo;
  minerals: MineralsInfo;
  unit: string;
  quantity: number;
}

export interface ImageNutritionResponse {
  foods: ImageNutritionFood[];
  summary: string;
  model: string;
}

/** Mifflin-St Jeor 公式估算基础代谢率 */
export function calculateBMR(profile: UserProfile): number {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  return Math.round(profile.gender === "male" ? base + 5 : base - 161);
}

/** 根据当前时间推断默认餐次 */
export function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snack";
  return "dinner";
}

export const mealTypeLabels: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "零食",
};
