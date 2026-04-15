import type { CalorieEntry, CalorieType, MineralsInfo } from "@/types/calorie";

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

/* ───── 矿物质中文标签映射 ───── */

export const mineralLabels: Record<
  keyof MineralsInfo,
  { name: string; unit: string }
> = {
  calcium: { name: "钙", unit: "mg" },
  magnesium: { name: "镁", unit: "mg" },
  potassium: { name: "钾", unit: "mg" },
  sodium: { name: "钠", unit: "mg" },
  phosphorus: { name: "磷", unit: "mg" },
  iron: { name: "铁", unit: "mg" },
  zinc: { name: "锌", unit: "mg" },
  manganese: { name: "锰", unit: "mg" },
  copper: { name: "铜", unit: "mg" },
  selenium: { name: "硒", unit: "μg" },
  iodine: { name: "碘", unit: "μg" },
  chromium: { name: "铬", unit: "μg" },
  fluoride: { name: "氟", unit: "mg" },
};
