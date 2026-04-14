import type { ImageNutritionResponse } from "@/types/calorie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "仅支持 JPEG、PNG、WebP、GIF 格式";
  }
  if (file.size > MAX_SIZE) {
    return "图片大小不能超过 5MB";
  }
  return null;
}

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
