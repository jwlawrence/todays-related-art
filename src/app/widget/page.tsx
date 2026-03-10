"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  return (
    <Suspense fallback={<div style={{ position: "fixed", inset: 0, backgroundColor: "#1a1a1a", padding: 16 }}><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Loading...</p></div>}>
      <WidgetContent />
    </Suspense>
  );
}

function WidgetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [students, setStudents] = useState<Student[]>([]);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch students: from API if token provided, otherwise localStorage
        if (token) {
          const res = await fetch(`/api/widget-data?token=${token}`);
          if (res.ok) {
            setStudents(await res.json());
          }
        } else {
          setStudents(getStudents());
        }

        // Fetch schedule
        const scheduleRes = await fetch("/api/schedule");
        if (scheduleRes.ok) {
          setSchedule(await scheduleRes.json());
        }
      } catch {
        // silently fail for widget
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

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
        padding: 16,
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Loading...</p>
      ) : (
        <>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {today?.dayName?.slice(0, 3)}
            </span>
            {color && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dotColor ?? undefined }} />
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600 }}>
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
                  <div key={student.id} style={{ marginTop: i > 0 ? 10 : 0 }}>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1, margin: 0 }}>
                      {student.name}
                    </p>
                    <p style={{ color: "white", fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                      {art || "—"}
                    </p>
                  </div>
                );
              })}
              {students.length === 0 && (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>
                  Set up students on the main page first
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 22, fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}>
              No school
            </p>
          )}
        </>
      )}
    </div>
  );
}
