"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStudents } from "@/lib/students";
import { COLOR_CONFIG } from "@/lib/colors";
import { softBreakArt } from "@/lib/format";
import type { Student, ScheduleResponse } from "@/lib/types";

const BOARD_STOCK = "#F2EDDF";
const INK = "#17150F";

export default function WidgetPage() {
  return (
    <Suspense
      fallback={
        <div style={{ position: "fixed", inset: 0, backgroundColor: BOARD_STOCK, padding: 24 }}>
          <p style={{ color: "rgba(23,21,15,0.5)", fontSize: 14, fontFamily: "var(--font-fragment), monospace" }}>
            Loading…
          </p>
        </div>
      }
    >
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
  const config = color ? COLOR_CONFIG[color] : null;

  const board = config ? config.board : BOARD_STOCK;
  const onBoard = config ? config.onBoard : INK;
  const onBoardSoft = config
    ? config.onBoard === INK
      ? "rgba(23,21,15,0.88)"
      : "rgba(253,252,246,0.92)"
    : "rgba(23,21,15,0.7)";

  return (
    <>
      <style>{`
        .widget-root {
          position: fixed;
          inset: 0;
          padding: 22px;
          font-family: var(--font-archivo), 'Helvetica Neue', sans-serif;
          overflow: hidden;
        }
        .widget-legend {
          font-stretch: 75%;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 12px;
        }
        .widget-mono { font-family: var(--font-fragment), monospace; font-size: 12px; }
        .widget-student-name { font-size: 12px; }
        .widget-student-art { font-size: 27px; font-weight: 800; letter-spacing: -0.015em; line-height: 1.05; }
        .widget-no-school { font-size: 22px; font-weight: 800; letter-spacing: -0.015em; }
        .widget-empty { font-size: 14px; }
        @media (max-width: 200px) {
          .widget-root { padding: 18px; }
          .widget-legend { font-size: 13px; }
          .widget-mono { font-size: 13px; }
          .widget-student-name { font-size: 13px; }
          .widget-student-art { font-size: 31px; }
          .widget-no-school { font-size: 26px; }
          .widget-empty { font-size: 16px; }
        }
      `}</style>
      <div className="widget-root" style={{ backgroundColor: board }}>
        {loading ? (
          <p className="widget-mono" style={{ color: "rgba(23,21,15,0.5)" }}>Loading…</p>
        ) : (
          <>
            {/* Header: the day and its color, both named */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: `1px solid ${onBoardSoft}`,
              }}
            >
              <span className="widget-legend" style={{ color: onBoard }}>
                {config ? `${config.label} Day` : "Today"}
              </span>
              <span className="widget-mono" style={{ color: onBoardSoft }}>
                {today?.dayName?.slice(0, 3).toUpperCase()}
              </span>
            </div>

            {/* Students */}
            {config ? (
              <div>
                {students.map((student, i) => {
                  const art = student.colorMap[color!];
                  const note = student.notes?.[color!];
                  return (
                    <div key={student.id} style={{ marginTop: i > 0 ? 12 : 0 }}>
                      <p className="widget-legend widget-student-name" style={{ color: onBoardSoft, margin: 0 }}>
                        {student.name}
                      </p>
                      {art ? (
                        <p className="widget-student-art" style={{ color: onBoard, margin: 0, overflowWrap: "anywhere" }}>
                          {softBreakArt(art)}
                        </p>
                      ) : (
                        <p className="widget-mono" style={{ color: onBoard, margin: "2px 0 0" }}>
                          Not mapped — set it in the app
                        </p>
                      )}
                      {note && (
                        <p className="widget-mono" style={{ color: onBoardSoft, margin: "3px 0 0" }}>
                          Bring · {note}
                        </p>
                      )}
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <p className="widget-empty" style={{ color: onBoardSoft }}>
                    Set up students on the main page first
                  </p>
                )}
              </div>
            ) : (
              <p className="widget-no-school" style={{ color: INK }}>
                No school
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
