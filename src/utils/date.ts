import dayjs from "dayjs";

export function getLocalDayRange(date: string) {
  const start = dayjs(`${date}T00:00:00`);
  return {
    startDate: start.toISOString(),
    endDate: start.add(1, "day").toISOString(),
  };
}

export function getLocalMonthRange(month: string) {
  const start = dayjs(`${month}-01`).startOf("month");
  return {
    startDate: start.toISOString(),
    endDate: start.add(1, "month").toISOString(),
  };
}
