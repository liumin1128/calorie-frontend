import { request } from "@/lib/api";
import type {
  DynamicDataRecord,
  CreateDynamicDataDto,
  QueryLatestParams,
} from "@/types/user";

export function create(token: string, dto: CreateDynamicDataDto) {
  return request<DynamicDataRecord>("/dynamic-data", {
    method: "POST",
    body: JSON.stringify(dto),
    token,
  });
}

export function getLatest(token: string, params: QueryLatestParams) {
  return request<DynamicDataRecord | null>("/dynamic-data/latest", {
    token,
    params: params as unknown as Record<string, string>,
  });
}
