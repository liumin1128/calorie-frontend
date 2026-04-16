import type { ImageNutritionResponse } from "@/types/calorie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function analyzeImageNutrition(
  token: string,
  file: File,
): Promise<ImageNutritionResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/gateway/ai/image-nutrition`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `分析失败 (${res.status})`);
  }

  return res.json();
}
