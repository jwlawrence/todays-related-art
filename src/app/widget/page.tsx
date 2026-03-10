"use client";

import { useEffect, useState } from "react";
import { getStudents } from "@/lib/students";
import type { Student, ScheduleResponse, ScheduleColor } from "@/lib/types";

const DOT_COLORS: Record<ScheduleColor, string> = {
  RED: "#E54D4D",
  BLUE: "#4D8BE5",
  YELLOW: "#E5B84D",
  GREEN: "#4DBE6E",
  ORANGE: "#E5854D",
};

const COLOR_LABELS: Record<ScheduleColor, string> = {
  RED: "Red",
  BLUE: "Blue",
  YELLOW: "Yellow",
  GREEN: "Green",
  ORANGE: "Orange",
};

export default function WidgetPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStudents(getStudents());
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data: ScheduleResponse) => setSchedule(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = schedule?.today;
  const color = today?.color;
  const dotColor = color ? DOT_COLORS[color] : null;
  const label = color ? COLOR_LABELS[color] : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#1a1a1a",
        padding: 12,
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Loading...</p>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {today?.dayName?.slice(0, 3)}
            </span>
            {color && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor ?? undefined }} />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600 }}>
                  {label}
                </span>
              </span>
            )}
          </div>

          {/* Students */}
          {color ? (
            <div>
              {students.map((student, i) => {
                const art = student.colorMap[color];
                return (
                  <div key={student.id} style={{ marginTop: i > 0 ? 6 : 0 }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, lineHeight: 1, margin: 0 }}>
                      {student.name}
                    </p>
                    <p style={{ color: "white", fontFamily: "'Fredoka', sans-serif", fontSize: 18, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                      {art || "—"}
                    </p>
                  </div>
                );
              })}
              {students.length === 0 && (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  Set up students on the main page first
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}>
              No school
            </p>
          )}
        </>
      )}
    </div>
  );
}
