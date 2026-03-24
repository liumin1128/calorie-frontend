import { request } from "@/lib/api";
import type { UserFullProfile, UpdateProfileDto } from "@/types/user";

export function getFullProfile(token: string) {
  return request<UserFullProfile>("/user/full-profile", { token });
}

export function updateProfile(token: string, dto: UpdateProfileDto) {
  return request<UserFullProfile>("/user/profile", {
    method: "PUT",
    body: JSON.stringify(dto),
    token,
  });
}
