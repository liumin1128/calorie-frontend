import { request } from "@/lib/api";

export type StorageBusinessType =
  | "ai-analysis"
  | "calorie-image"
  | "user-avatar";

interface PresignedUploadResponse {
  key: string;
  uploadUrl: string;
  method: "PUT";
  headers: {
    "Content-Type": string;
    "Cache-Control"?: string;
  };
  expiresIn: number;
  publicUrl: string | null;
}

interface CreatePresignedUploadDto {
  businessType: StorageBusinessType;
  fileName: string;
  contentType: string;
}

export async function createPresignedUpload(
  token: string,
  dto: CreatePresignedUploadDto,
): Promise<PresignedUploadResponse> {
  return request<PresignedUploadResponse>("/storage/presign-upload", {
    method: "POST",
    token,
    body: JSON.stringify(dto),
  });
}

export async function uploadFileToStorage(
  uploadUrl: string,
  file: File,
  headers: PresignedUploadResponse["headers"],
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: file,
  });

  if (!res.ok) {
    throw new Error(`图片上传失败 (${res.status})`);
  }
}

export async function uploadCalorieImage(
  token: string,
  file: File,
): Promise<string> {
  const presigned = await createPresignedUpload(token, {
    businessType: "calorie-image",
    fileName: file.name,
    contentType: file.type,
  });

  if (!presigned.publicUrl) {
    throw new Error("图片上传服务未返回可访问地址");
  }

  await uploadFileToStorage(presigned.uploadUrl, file, presigned.headers);
  return presigned.publicUrl;
}
