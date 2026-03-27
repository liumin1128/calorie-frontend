import type { CalorieEntry, CalorieType } from "@/types/calorie";

export function sumCalories(
  entries: CalorieEntry[],
  type: CalorieType,
): number {
  return entries
    .filter((e) => e.type === type)
    .reduce((s, e) => s + e.calories, 0);
}

export function formatTime(entryDate: string): string {
  const dt = new Date(entryDate);
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}
