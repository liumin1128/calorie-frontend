export type Gender = "male" | "female" | "other";

export interface DynamicDataValue {
  value: number;
  recordedAt: string;
}

export interface UserFullProfile {
  id: string;
  email: string;
  nickname: string;
  gender?: Gender;
  birthday?: string;
  signature?: string;
  targetWeight?: number | null;
  healthConditions?: string[] | null;
  latestHeight?: DynamicDataValue | null;
  latestWeight?: DynamicDataValue | null;
}

export interface UpdateProfileDto {
  nickname?: string;
  gender?: Gender;
  birthday?: string;
  signature?: string;
  targetWeight?: number;
  healthConditions?: string[];
}

export interface CreateDynamicDataDto {
  category: string;
  value: number;
  recordedAt?: string;
}

export interface DynamicDataRecord {
  _id: string;
  userId: string;
  category: string;
  value: number;
  recordedAt: string;
}

export interface QueryLatestParams {
  category: string;
  date?: string;
}

/** 从 birthday 计算年龄 */
export function calculateAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
