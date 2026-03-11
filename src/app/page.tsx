"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStudents } from "@/hooks/useStudents";
import { getColorStyle, COLOR_CONFIG } from "@/lib/colors";
import type { Student, ScheduleResponse, ScheduleColor, DaySchedule } from "@/lib/types";

function HeroColor({ schedule, students }: { schedule: ScheduleResponse; students: Student[] }) {
  const { today } = schedule;
  const config = today.color ? COLOR_CONFIG[today.color] : null;

  return (
    <section className="animate-fade-in">
      {/* Color wash hero */}
      <div
        className={`relative rounded-3xl overflow-hidden px-6 py-8 mb-6 ${
          config
            ? `bg-gradient-to-br ${config.gradient} ${config.glow}`
            : "bg-cream-dark"
        }`}
      >
        {/* Subtle radial overlay for depth */}
        {config && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-white/70 font-body text-sm font-medium tracking-wide uppercase">
              {today.color ? today.dayName : "Today"}
            </p>
            {today.color && config && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white/80 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-white/90" />
                {config.label} Day
              </span>
            )}
          </div>

          {today.color ? (
            <>
              <div className="mt-5 space-y-3">
                {students.map((student, i) => {
                  const art = student.colorMap[today.color!];
                  return (
                    <div
                      key={student.id}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 animate-slide-up"
                      style={{ animationDelay: `${i * 80 + 200}ms` }}
                    >
                      <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                        {student.name}
                      </p>
                      <p className="text-white font-display text-4xl font-bold mt-0.5 leading-tight">
                        {art || "Not set"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <h2 className="font-display text-3xl font-bold text-ink mt-1">
                No School Today
              </h2>
              <p className="text-ink-light mt-2 text-sm">
                Enjoy the day off!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next school day teaser when no school today */}
      {!today.color && <NextDayTeaser schedule={schedule} students={students} />}
    </section>
  );
}

function NextDayTeaser({ schedule, students }: { schedule: ScheduleResponse; students: Student[] }) {
  const nextDay = schedule.week.find((d) => !d.isToday && d.color);
  if (!nextDay) return null;
  const config = nextDay.color ? COLOR_CONFIG[nextDay.color] : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-ink-muted text-xs font-semibold uppercase tracking-wider">
          Coming up {nextDay.dayName}
        </p>
        {config && (
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${config.solid}`} />
            <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
          </span>
        )}
      </div>
      {students.map((student) => {
        const art = nextDay.color ? student.colorMap[nextDay.color] : null;
        return (
          <div key={student.id} className="flex items-center justify-between py-1.5">
            <span className="text-ink-light text-sm">{student.name}</span>
            <span className="font-display font-bold text-ink">{art || "—"}</span>
          </div>
        );
      })}
    </div>
  );
}

function WeekStrip({ schedule, students }: { schedule: ScheduleResponse; students: Student[] }) {
  return (
    <section className="animate-slide-up" style={{ animationDelay: "300ms" }}>
      <h2 className="font-display text-sm font-bold text-ink-muted uppercase tracking-wider mb-3">
        This Week
      </h2>
      <div className="grid grid-cols-5 gap-1.5">
        {schedule.week.map((day, i) => (
          <WeekDay key={day.date} day={day} students={students} index={i} />
        ))}
      </div>
    </section>
  );
}

function WeekDay({ day, students, index }: { day: DaySchedule; students: Student[]; index: number }) {
  const config = day.color ? COLOR_CONFIG[day.color] : null;

  return (
    <div
      className={`rounded-2xl p-2.5 text-center transition-all duration-300 animate-slide-up ${
        day.isToday
          ? `${config ? config.soft : "bg-cream-dark"} ring-2 ${config ? `ring-current ${config.text}` : "ring-ink-muted"}`
          : "bg-white border border-cream-dark"
      }`}
      style={{ animationDelay: `${index * 60 + 400}ms` }}
    >
      <p className={`text-[11px] font-bold uppercase tracking-wide ${
        day.isToday ? "text-ink" : "text-ink-muted"
      }`}>
        {day.dayName.slice(0, 3)}
      </p>

      {day.color && config ? (
        <>
          <div className="mt-2 space-y-1.5">
            {students.map((student) => {
              const art = student.colorMap[day.color!];
              return (
                <div key={student.id} className="truncate">
                  <p className="text-[10px] text-ink-muted leading-tight truncate">
                    {student.name.split(" ")[0]}
                  </p>
                  <p className="text-xs font-display font-bold text-ink leading-tight truncate">
                    {art || "—"}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config.solid} ${
              day.isToday ? "animate-[colorPulse_3s_ease-in-out_infinite]" : ""
            }`} aria-label={`${config.label} day`} />
            <p className={`text-[9px] font-semibold ${config.text}`}>
              {config.label}
            </p>
          </div>
        </>
      ) : (
        <p className="text-[10px] text-ink-muted mt-3 italic">Off</p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="flex gap-1.5">
        {["bg-day-red", "bg-day-blue", "bg-day-yellow", "bg-day-green", "bg-day-orange"].map((c, i) => (
          <div
            key={c}
            className={`w-3 h-3 rounded-full ${c} animate-[colorPulse_1s_ease-in-out_infinite]`}
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
      <p className="text-ink-muted font-display text-sm">Loading schedule...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
      <div className="flex gap-2 mb-6">
        {["bg-day-red", "bg-day-blue", "bg-day-yellow", "bg-day-green", "bg-day-orange"].map((c) => (
          <div key={c} className={`w-6 h-6 rounded-full ${c}`} />
        ))}
      </div>
      <h1 className="font-display text-3xl font-bold text-ink mb-2">
        Today&apos;s Related Art
      </h1>
      <p className="text-ink-light mb-4 max-w-xs text-sm leading-relaxed">
        Your school uses color days to rotate specials like Music, Art, and PE.
        Add your child and map each color to their class.
      </p>
      <p className="text-ink-muted mb-8 max-w-xs text-xs leading-relaxed">
        Check the schedule sheet from your child&apos;s teacher to find
        which color matches which class.
      </p>
      <Link
        href="/setup"
        className="inline-block bg-ink text-cream px-8 py-3.5 rounded-2xl font-display font-bold text-base hover:bg-ink/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Add a Student
      </Link>
    </div>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const { students, loading: studentsLoading } = useStudents();
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then((data: ScheduleResponse) => setSchedule(data))
      .catch((err) => setError(err.message))
      .finally(() => setScheduleLoading(false));
  }, []);

  if (scheduleLoading || studentsLoading) return <LoadingState />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-day-red-soft flex items-center justify-center mb-4">
          <span className="text-day-red text-xl">!</span>
        </div>
        <p className="font-display font-bold text-ink mb-1">Couldn&apos;t load schedule</p>
        <p className="text-sm text-ink-muted">{error}</p>
      </div>
    );
  }

  if (students.length === 0) return <EmptyState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h1 className="font-display text-lg font-bold text-ink">
          Today&apos;s Related Art
        </h1>
        <div className="flex items-center gap-2">
          {session?.user && (
            <span className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center text-[10px] font-bold text-ink-muted">
              {(session.user.name || session.user.email || "?")[0].toUpperCase()}
            </span>
          )}
          <Link
            href="/setup"
            className="text-xs font-semibold text-ink-muted hover:text-ink transition-colors bg-cream-dark hover:bg-white px-3 py-1.5 rounded-full"
          >
            Edit Students
          </Link>
        </div>
      </div>

      {schedule && (
        <>
          <HeroColor schedule={schedule} students={students} />
          <WeekStrip schedule={schedule} students={students} />
        </>
      )}
    </div>
  );
}
