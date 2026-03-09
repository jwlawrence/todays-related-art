import type { ScheduleColor } from "./types";

export const COLOR_CONFIG: Record<
  ScheduleColor,
  {
    gradient: string;
    soft: string;
    solid: string;
    glow: string;
    text: string;
    label: string;
    emoji: string;
  }
> = {
  RED: {
    gradient: "from-day-red to-red-400",
    soft: "bg-day-red-soft",
    solid: "bg-day-red",
    glow: "shadow-[0_8px_40px_var(--color-day-red-glow)]",
    text: "text-day-red",
    label: "Red",
    emoji: "🔴",
  },
  BLUE: {
    gradient: "from-day-blue to-blue-400",
    soft: "bg-day-blue-soft",
    solid: "bg-day-blue",
    glow: "shadow-[0_8px_40px_var(--color-day-blue-glow)]",
    text: "text-day-blue",
    label: "Blue",
    emoji: "🔵",
  },
  YELLOW: {
    gradient: "from-day-yellow to-amber-400",
    soft: "bg-day-yellow-soft",
    solid: "bg-day-yellow",
    glow: "shadow-[0_8px_40px_var(--color-day-yellow-glow)]",
    text: "text-day-yellow",
    label: "Yellow",
    emoji: "🟡",
  },
  GREEN: {
    gradient: "from-day-green to-emerald-400",
    soft: "bg-day-green-soft",
    solid: "bg-day-green",
    glow: "shadow-[0_8px_40px_var(--color-day-green-glow)]",
    text: "text-day-green",
    label: "Green",
    emoji: "🟢",
  },
  ORANGE: {
    gradient: "from-day-orange to-orange-400",
    soft: "bg-day-orange-soft",
    solid: "bg-day-orange",
    glow: "shadow-[0_8px_40px_var(--color-day-orange-glow)]",
    text: "text-day-orange",
    label: "Orange",
    emoji: "🟠",
  },
};

// Keep backward compat export for any other imports
export const COLOR_STYLES = Object.fromEntries(
  Object.entries(COLOR_CONFIG).map(([k, v]) => [
    k,
    { bg: v.soft, text: v.text, border: "", dot: v.solid },
  ])
) as Record<ScheduleColor, { bg: string; text: string; border: string; dot: string }>;

export function getColorStyle(color: ScheduleColor | null) {
  if (!color) return null;
  return COLOR_CONFIG[color] ?? null;
}
