import { NextResponse } from "next/server";
import ICAL from "ical.js";
import type { ScheduleColor, DaySchedule, ScheduleResponse } from "@/lib/types";

const VALID_COLORS = new Set(["RED", "BLUE", "YELLOW", "GREEN", "ORANGE"]);
const SCHOOL_TZ = "America/New_York";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedColorMap: Map<string, ScheduleColor> | null = null;
let cacheTimestamp = 0;

// Format ICAL.Time directly to YYYY-MM-DD without going through JS Date
// This avoids timezone shifting for DATE-only values
function icalTimeToDateStr(icalTime: { year: number; month: number; day: number }): string {
  const y = String(icalTime.year);
  const m = String(icalTime.month).padStart(2, "0");
  const d = String(icalTime.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSchoolTodayStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: SCHOOL_TZ });
}

function getDayName(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

function getWeekDates(todayStr: string): string[] {
  const [year, month, day] = todayStr.split("-").map(Number);
  const today = new Date(year, month - 1, day);
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));

  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = String(d.getFullYear());
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${dd}`);
  }
  return dates;
}

function parseICSData(icsText: string): Map<string, ScheduleColor> {
  const colorMap = new Map<string, ScheduleColor>();
  const jcalData = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const summary = (event.summary || "").trim().toUpperCase();
    if (!VALID_COLORS.has(summary)) continue;

    const color = summary as ScheduleColor;

    if (event.isRecurring()) {
      const iterator = event.iterator();
      let next = iterator.next();
      let count = 0;
      while (next && count < 500) {
        // Check if this occurrence is excluded via EXDATE
        const details = event.getOccurrenceDetails(next);
        if (details.item) {
          // Use ICAL.Time properties directly to avoid timezone shifting
          const dateStr = icalTimeToDateStr(next);
          colorMap.set(dateStr, color);
        }
        next = iterator.next();
        count++;
      }
    } else {
      const start = event.startDate;
      if (!start) continue;
      const dateStr = icalTimeToDateStr(start);
      colorMap.set(dateStr, color);
    }
  }

  return colorMap;
}

async function fetchAndParseICS(): Promise<Map<string, ScheduleColor>> {
  const now = Date.now();
  if (cachedColorMap && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedColorMap;
  }

  const feedUrl = process.env.ICS_FEED_URL;
  if (!feedUrl) {
    throw new Error("ICS_FEED_URL environment variable not set");
  }

  const res = await fetch(feedUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch ICS feed: ${res.status}`);
  }
  const icsText = await res.text();

  const colorMap = parseICSData(icsText);

  cachedColorMap = colorMap;
  cacheTimestamp = now;
  return colorMap;
}

export async function GET() {
  try {
    const colorMap = await fetchAndParseICS();
    const todayStr = getSchoolTodayStr();
    const weekDates = getWeekDates(todayStr);

    const todayColor = colorMap.get(todayStr) || null;

    const today: DaySchedule = {
      date: todayStr,
      dayName: getDayName(todayStr),
      color: todayColor,
      isToday: true,
    };

    const week: DaySchedule[] = weekDates.map((dateStr) => ({
      date: dateStr,
      dayName: getDayName(dateStr),
      color: colorMap.get(dateStr) || null,
      isToday: dateStr === todayStr,
    }));

    const response: ScheduleResponse = {
      today,
      week,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch schedule:", error);

    // If we have stale cache, serve it
    if (cachedColorMap) {
      const todayStr = getSchoolTodayStr();
      const weekDates = getWeekDates(todayStr);

      const response: ScheduleResponse = {
        today: {
          date: todayStr,
          dayName: getDayName(todayStr),
          color: cachedColorMap.get(todayStr) || null,
          isToday: true,
        },
        week: weekDates.map((dateStr) => ({
          date: dateStr,
          dayName: getDayName(dateStr),
          color: cachedColorMap!.get(dateStr) || null,
          isToday: dateStr === todayStr,
        })),
        lastUpdated: new Date(cacheTimestamp).toISOString(),
      };

      return NextResponse.json(response, {
        headers: { "X-Cache-Status": "stale" },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
