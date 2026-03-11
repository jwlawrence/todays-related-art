export const COLORS = ["RED", "BLUE", "YELLOW", "GREEN", "ORANGE"] as const;
export type ScheduleColor = (typeof COLORS)[number];

export const RELATED_ARTS = [
  "Technology/PE",
  "Music",
  "Art",
  "PE",
  "Media",
] as const;
export type RelatedArt = (typeof RELATED_ARTS)[number] | string;

export interface Student {
  id: string;
  name: string;
  colorMap: Partial<Record<ScheduleColor, RelatedArt>>;
  notes?: Partial<Record<ScheduleColor, string>>;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  dayName: string;
  color: ScheduleColor | null;
  isToday: boolean;
}

export interface ScheduleResponse {
  today: DaySchedule;
  week: DaySchedule[];
  lastUpdated: string;
}
