import { request } from "@/lib/api";

export interface AdviceSuggestion {
  suggestion: string;
  model: string;
}

const FIXED_QUESTION = "请根据我的个人数据给出健康建议";

export function getSuggestion(token: string): Promise<AdviceSuggestion> {
  return request<AdviceSuggestion>("/gateway/ai/suggest", {
    method: "POST",
    body: JSON.stringify({ question: FIXED_QUESTION }),
    token,
  });
}
