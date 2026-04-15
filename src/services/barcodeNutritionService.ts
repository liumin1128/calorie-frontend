import { request } from "@/lib/api";
import type {
  BarcodeFoodResponse,
  BarcodeNutritionPreview,
  MineralsInfo,
  NutritionInfo,
} from "@/types/calorie";

function normalizeBarcode(code: string) {
  const normalized = code.replace(/\D/g, "");
  if (!/^\d{4,14}$/.test(normalized)) {
    throw new Error("条形码格式无效，请输入 4-14 位数字");
  }
  return normalized;
}

function compactNutrition(
  nutrition:
    | BarcodeFoodResponse["nutrition"]
    | BarcodeFoodResponse["totalNutrition"]
    | null
    | undefined,
): NutritionInfo | undefined {
  if (!nutrition) return undefined;

  const next: NutritionInfo = {};

  if (nutrition.protein != null) next.protein = nutrition.protein;
  if (nutrition.carbohydrates != null) {
    next.carbohydrates = nutrition.carbohydrates;
  }
  if (nutrition.fat != null) next.fat = nutrition.fat;
  if (nutrition.fiber != null) next.fiber = nutrition.fiber;

  return Object.keys(next).length > 0 ? next : undefined;
}

function inferCalories(nutrition: NutritionInfo | undefined) {
  if (!nutrition) return undefined;

  const protein = nutrition.protein ?? 0;
  const carbohydrates = nutrition.carbohydrates ?? 0;
  const fat = nutrition.fat ?? 0;
  const inferred = protein * 4 + carbohydrates * 4 + fat * 9;

  if (inferred <= 0) return undefined;
  return Math.round(inferred * 10) / 10;
}

function roundTo(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseNutritionBase(nutritionDataPer: string | undefined) {
  if (!nutritionDataPer) return undefined;

  const match = nutritionDataPer
    .trim()
    .toLowerCase()
    .match(/^(\d+(?:\.\d+)?)\s*(ml|g)$/i);
  if (!match) return undefined;

  return {
    amount: Number(match[1]),
    unit: match[2].toLowerCase(),
  };
}

function normalizeQuantityUnit(unit: string | null | undefined) {
  if (!unit) return undefined;

  const normalized = unit.trim().toLowerCase();
  if (["ml", "毫升"].includes(normalized)) return "ml";
  if (["g", "克", "gram", "grams"].includes(normalized)) return "g";
  return undefined;
}

function resolveQuantityFactor(response: BarcodeFoodResponse) {
  const base = parseNutritionBase(response.nutritionDataPer ?? undefined);
  const quantity = response.productQuantity ?? undefined;
  const productUnit = normalizeQuantityUnit(response.productQuantityUnit);

  if (!base || quantity == null || quantity <= 0 || !productUnit) {
    return undefined;
  }

  if (base.unit !== productUnit || base.amount <= 0) {
    return undefined;
  }

  return quantity / base.amount;
}

function compactMinerals(
  minerals:
    | BarcodeFoodResponse["minerals"]
    | BarcodeFoodResponse["totalMinerals"]
    | null
    | undefined,
): MineralsInfo | undefined {
  if (!minerals) return undefined;

  const next: MineralsInfo = {};

  if (minerals.calcium != null) next.calcium = minerals.calcium;
  if (minerals.magnesium != null) next.magnesium = minerals.magnesium;
  if (minerals.potassium != null) next.potassium = minerals.potassium;
  if (minerals.sodium != null) next.sodium = minerals.sodium;
  if (minerals.phosphorus != null) next.phosphorus = minerals.phosphorus;
  if (minerals.iron != null) next.iron = minerals.iron;
  if (minerals.zinc != null) next.zinc = minerals.zinc;
  if (minerals.manganese != null) next.manganese = minerals.manganese;
  if (minerals.copper != null) next.copper = minerals.copper;
  if (minerals.selenium != null) next.selenium = minerals.selenium;
  if (minerals.iodine != null) next.iodine = minerals.iodine;
  if (minerals.chromium != null) next.chromium = minerals.chromium;
  if (minerals.fluoride != null) next.fluoride = minerals.fluoride;

  return Object.keys(next).length > 0 ? next : undefined;
}

function scaleNutritionInfo(
  nutrition: NutritionInfo | undefined,
  factor: number | undefined,
): NutritionInfo | undefined {
  if (!nutrition || factor == null) return nutrition;

  const next: NutritionInfo = {};
  if (nutrition.protein != null)
    next.protein = roundTo(nutrition.protein * factor);
  if (nutrition.carbohydrates != null) {
    next.carbohydrates = roundTo(nutrition.carbohydrates * factor);
  }
  if (nutrition.fat != null) next.fat = roundTo(nutrition.fat * factor);
  if (nutrition.fiber != null) next.fiber = roundTo(nutrition.fiber * factor);

  return Object.keys(next).length > 0 ? next : undefined;
}

function scaleMineralsInfo(
  minerals: MineralsInfo | undefined,
  factor: number | undefined,
): MineralsInfo | undefined {
  if (!minerals || factor == null) return minerals;

  const next: MineralsInfo = {};
  if (minerals.calcium != null)
    next.calcium = roundTo(minerals.calcium * factor);
  if (minerals.magnesium != null)
    next.magnesium = roundTo(minerals.magnesium * factor);
  if (minerals.potassium != null)
    next.potassium = roundTo(minerals.potassium * factor);
  if (minerals.sodium != null) next.sodium = roundTo(minerals.sodium * factor);
  if (minerals.phosphorus != null)
    next.phosphorus = roundTo(minerals.phosphorus * factor);
  if (minerals.iron != null) next.iron = roundTo(minerals.iron * factor);
  if (minerals.zinc != null) next.zinc = roundTo(minerals.zinc * factor);
  if (minerals.manganese != null)
    next.manganese = roundTo(minerals.manganese * factor);
  if (minerals.copper != null) next.copper = roundTo(minerals.copper * factor);
  if (minerals.selenium != null)
    next.selenium = roundTo(minerals.selenium * factor);
  if (minerals.iodine != null) next.iodine = roundTo(minerals.iodine * factor);
  if (minerals.chromium != null)
    next.chromium = roundTo(minerals.chromium * factor);
  if (minerals.fluoride != null)
    next.fluoride = roundTo(minerals.fluoride * factor);

  return Object.keys(next).length > 0 ? next : undefined;
}

function mapBarcodeFoodResponse(
  barcode: string,
  response: BarcodeFoodResponse,
): BarcodeNutritionPreview {
  const useUnitNutrition = !!response.nutritionDataPer;
  const displayNutrition = compactNutrition(
    useUnitNutrition
      ? response.nutrition
      : (response.totalNutrition ?? response.nutrition),
  );
  const displayMinerals = compactMinerals(
    useUnitNutrition
      ? response.minerals
      : (response.totalMinerals ?? response.minerals),
  );
  const quantityFactor = resolveQuantityFactor(response);
  const entryNutrition =
    compactNutrition(response.totalNutrition) ??
    scaleNutritionInfo(compactNutrition(response.nutrition), quantityFactor);
  const entryMinerals =
    compactMinerals(response.totalMinerals) ??
    scaleMineralsInfo(compactMinerals(response.minerals), quantityFactor);
  const fallbackName = response.brand?.trim() || `条码 ${barcode}`;
  const displayCalories = response.calories ?? inferCalories(displayNutrition);
  const entryCalories =
    response.totalCalories ??
    (displayCalories != null && quantityFactor != null
      ? roundTo(displayCalories * quantityFactor)
      : displayCalories);
  const entryWater =
    response.totalWater ??
    (response.water != null && quantityFactor != null
      ? roundTo(response.water * quantityFactor)
      : (response.water ?? undefined));

  return {
    barcode,
    name: response.name?.trim() || fallbackName,
    brand: response.brand?.trim() || undefined,
    imageUrl: response.imageUrl || undefined,
    servingText: response.quantity?.trim() || undefined,
    nutritionDataPer: response.nutritionDataPer?.trim() || undefined,
    productQuantity: response.productQuantity ?? undefined,
    productQuantityUnit: normalizeQuantityUnit(response.productQuantityUnit),
    calories: useUnitNutrition ? displayCalories : entryCalories,
    water: response.totalWater ?? response.water ?? undefined,
    nutrition: displayNutrition,
    minerals: displayMinerals,
    entryCalories,
    entryWater,
    entryNutrition,
    entryMinerals,
  };
}

export async function lookupBarcodeNutrition(
  token: string,
  code: string,
): Promise<BarcodeNutritionPreview> {
  const barcode = normalizeBarcode(code);
  const response = await request<BarcodeFoodResponse>(
    `/food/barcode/${encodeURIComponent(barcode)}`,
    { token },
  );

  return mapBarcodeFoodResponse(barcode, response);
}
