import { request } from "@/lib/api";
import type {
  CalorieEntry,
  CreateCalorieEntryDto,
  UpdateCalorieEntryDto,
  QueryCalorieEntryParams,
  PaginatedResponse,
  DailySummaryMap,
} from "@/types/calorie";

export function createCalorieEntry(token: string, dto: CreateCalorieEntryDto) {
  return request<CalorieEntry>("/calorie", {
    method: "POST",
    body: JSON.stringify(dto),
    token,
  });
}

export function getCalorieEntries(
  token: string,
  params?: QueryCalorieEntryParams,
) {
  return request<PaginatedResponse<CalorieEntry>>("/calorie", {
    token,
    params: params as Record<string, string | number | undefined>,
  });
}

export function updateCalorieEntry(
  token: string,
  id: string,
  dto: UpdateCalorieEntryDto,
) {
  return request<CalorieEntry>(`/calorie/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
    token,
  });
}

export function deleteCalorieEntry(token: string, id: string) {
  return request<CalorieEntry>(`/calorie/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export function getDailySummary(
  token: string,
  startDate: string,
  endDate: string,
) {
  return request<DailySummaryMap>("/calorie/daily-summary", {
    token,
    params: { startDate, endDate },
  });
}
