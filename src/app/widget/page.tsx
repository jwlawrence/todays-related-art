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
    <Suspense fallback={<div style={{ position: "fixed", inset: 0, backgroundColor: "#1a1a1a", padding: 24 }}><p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16 }}>Loading...</p></div>}>
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
    <>
      <style>{`
        .widget-root {
          position: fixed;
          inset: 0;
          background-color: #1a1a1a;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }
        .widget-header-label { font-size: 14px; }
        .widget-color-dot { width: 10px; height: 10px; }
        .widget-color-label { font-size: 14px; }
        .widget-student-name { font-size: 14px; }
        .widget-student-art { font-size: 28px; }
        .widget-no-school { font-size: 22px; }
        .widget-empty { font-size: 16px; }
        .widget-loading { font-size: 16px; }
        @media (max-width: 200px) {
          .widget-root { padding: 20px; }
          .widget-header-label { font-size: 16px; }
          .widget-color-label { font-size: 16px; }
          .widget-student-name { font-size: 16px; }
          .widget-student-art { font-size: 32px; }
          .widget-no-school { font-size: 26px; }
          .widget-empty { font-size: 18px; }
          .widget-loading { font-size: 18px; }
        }
      `}</style>
      <div className="widget-root">
        {loading ? (
          <p className="widget-loading" style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="widget-header-label" style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {today?.dayName?.slice(0, 3)}
              </span>
              {color && (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="widget-color-dot" style={{ borderRadius: "50%", backgroundColor: dotColor ?? undefined }} />
                  <span className="widget-color-label" style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
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
                  const note = student.notes?.[color];
                  return (
                    <div key={student.id} style={{ marginTop: i > 0 ? 10 : 0 }}>
                      <p className="widget-student-name" style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1, margin: 0 }}>
                        {student.name}
                      </p>
                      <p className="widget-student-art" style={{ color: "white", fontFamily: "'Fredoka', sans-serif", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
                        {art || "—"}
                      </p>
                      {note && (
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "2px 0 0", lineHeight: 1.2 }}>
                          {note}
                        </p>
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <p className="widget-empty" style={{ color: "rgba(255,255,255,0.3)" }}>
                    Set up students on the main page first
                  </p>
                )}
              </div>
            ) : (
              <p className="widget-no-school" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}>
                No school
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
