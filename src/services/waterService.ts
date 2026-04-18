import dayjs from "dayjs";
import { request } from "@/lib/api";
import type {
  SetWaterDto,
  WaterIntakeEntry,
  WaterRangeResponse,
} from "@/types/water";

export function getWaterRange(
  token: string,
  startDate: string,
  endDate: string,
) {
  return request<WaterRangeResponse>("/water", {
    token,
    params: { startDate, endDate },
  });
}

export function setWaterAmount(token: string, dto: SetWaterDto) {
  return request<WaterIntakeEntry>("/water", {
    method: "PUT",
    body: JSON.stringify(dto),
    token,
  });
}

export async function getWaterAmountByDate(
  token: string,
  date = dayjs().format("YYYY-MM-DD"),
) {
  const response = await getWaterRange(token, date, date);
  return response.data.find((entry) => entry.date === date)?.amount ?? 0;
}
