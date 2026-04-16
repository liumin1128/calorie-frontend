export interface WaterIntakeEntry {
  date: string;
  amount: number;
}

export interface WaterRangeResponse {
  data: WaterIntakeEntry[];
}

export interface SetWaterDto {
  date: string;
  amount: number;
}
