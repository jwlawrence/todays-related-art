"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SignInButton } from "@/components/SignInButton";
import { useSession } from "next-auth/react";
import { useStudents } from "@/hooks/useStudents";
import { COLOR_CONFIG, BOARD_HEX } from "@/lib/colors";
import { softBreakArt } from "@/lib/format";
import type { Student, ScheduleResponse, DaySchedule } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`.toUpperCase();
}

function weekRangeLabel(week: DaySchedule[]): string {
  if (week.length === 0) return "";
  const first = week[0];
  const last = week[week.length - 1];
  const [, fm, fd] = first.date.split("-").map(Number);
  const [, lm, ld] = last.date.split("-").map(Number);
  if (fm === lm) return `${MONTHS[fm - 1]} ${fd}–${ld}`.toUpperCase();
  return `${MONTHS[fm - 1]} ${fd} – ${MONTHS[lm - 1]} ${ld}`.toUpperCase();
}

function editionLabel(): string {
  const now = new Date();
  const y = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}–${String(y + 1).slice(2)} EDITION`;
}

function PunchHole({ color, size = 9 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  );
}

/* One milk-acetate leaf per student, hinged at the bound edge */
function StudentLeaf({ student, day }: { student: Student; day: DaySchedule }) {
  const config = day.color ? COLOR_CONFIG[day.color] : null;
  if (!config) return null;
  const art = student.colorMap[day.color!];
  const note = student.notes?.[day.color!];

  if (!art) {
    return (
      <article
        className="mt-3 border border-vermilion px-5 py-4 bg-milk"
        style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
      >
        <p className="type-legend text-[11px] text-vermilion-deep">Errata</p>
        <p className="mt-1.5 text-[15px] font-medium text-ink">
          {config.label} is not mapped for {student.name} yet.
        </p>
        <Link
          href="/setup"
          className="type-legend mt-2 inline-block text-[11px] text-ink underline underline-offset-4"
        >
          Add it in setup
        </Link>
      </article>
    );
  }

  return (
    <article
      className="relative mt-3 py-4 pl-9 pr-5"
      style={{
        backgroundColor: config.leaf,
        boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)",
      }}
    >
      {/* Punched holes at the bound edge reveal the bare board */}
      <span className="absolute left-3 top-4 flex flex-col gap-3">
        <PunchHole color={config.board} />
        <PunchHole color={config.board} />
      </span>
      <p className="type-legend text-[11px] text-ink-soft">{student.name}</p>
      <p
        className="type-display mt-1 text-[2.6rem] text-ink"
        style={{ overflowWrap: "anywhere" }}
      >
        {softBreakArt(art)}
      </p>
      {note && (
        <p className="type-mono mt-3 border-t rule-faint pt-2.5 text-[13px] text-ink-soft">
          <span className="type-legend text-[10px] text-ink">Bring</span>
          {" · "}
          {note}
        </p>
      )}
    </article>
  );
}

/* The section board: the day's divider at full strength, the current tab made page */
function DayBoard({
  day,
  students,
  todayIsOff,
}: {
  day: DaySchedule;
  students: Student[];
  todayIsOff: boolean;
}) {
  const config = day.color ? COLOR_CONFIG[day.color] : null;

  if (!config) {
    return (
      <section
        key={day.date}
        className="step-hinge min-h-[272px] bg-board-shade py-14 pl-5 pr-16 sm:pl-8"
        aria-label="No school"
      >
        <p className="type-legend text-[12px] text-ink-soft">
          {day.dayName} · No school
        </p>
        <p className="type-display mt-2 text-[2.4rem] text-ink">
          No school {day.isToday ? "today" : shortDate(day.date)}
        </p>
      </section>
    );
  }

  return (
    <section
      key={day.date}
      className="step-hinge min-h-[272px] pb-8 pl-5 pr-16 pt-6 sm:pl-8"
      style={{ backgroundColor: config.board }}
      aria-label={`${day.dayName}: ${config.label} day`}
    >
      {todayIsOff && (
        <div className="mb-4 -mx-1 bg-milk px-4 py-2.5" style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}>
          <p className="type-mono text-[12px] text-ink">
            <span className="type-legend text-[10px]">No school today</span>
            {" · "}next session {day.dayName.toUpperCase()} {shortDate(day.date)}
          </p>
        </div>
      )}

      <div className="flex items-baseline justify-between" style={{ color: config.onBoard }}>
        <h2 className="type-legend text-[13px]">
          {config.label} Day
        </h2>
        <p className="type-mono text-[11px]">
          {day.dayName.toUpperCase()} · {shortDate(day.date)}
        </p>
      </div>
      <div
        className="mt-2 border-t"
        style={{ borderColor: config.onBoard, opacity: 0.4 }}
        aria-hidden="true"
      />

      <div className="mt-1">
        {students.map((student) => (
          <StudentLeaf key={student.id} student={student} day={day} />
        ))}
      </div>
    </section>
  );
}

/* A pressed arrow button for turning the index's pages */
function PagerButton({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "back" | "forward";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`step-motion flex h-7 w-7 items-center justify-center rounded-[3px] border ${
        disabled
          ? "rule-faint text-ink-faint"
          : "border-ink bg-milk text-ink hover:bg-board"
      }`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="square"
        aria-hidden="true"
      >
        {direction === "back" ? (
          <path d="M20 12H5M11 6l-6 6 6 6" />
        ) : (
          <path d="M4 12h15M13 6l6 6-6 6" />
        )}
      </svg>
    </button>
  );
}

/* Contents table: the week as the manual's section index, paging forward */
function WeekIndex({
  week,
  students,
  selectedDate,
  onSelect,
  weekOffset,
  hasNext,
  weekLoading,
  weekError,
  onTurnWeek,
}: {
  week: DaySchedule[];
  students: Student[];
  selectedDate: string;
  onSelect: (date: string) => void;
  weekOffset: number;
  hasNext: boolean;
  weekLoading: boolean;
  weekError: number | null;
  onTurnWeek: (offset: number) => void;
}) {
  return (
    <section
      className="px-5 pb-8 pt-6 sm:px-8"
      aria-label={weekOffset === 0 ? "This week" : `Week of ${week[0]?.dayName ?? ""} ${week[0]?.date ?? ""}`}
      aria-busy={weekLoading}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-legend text-[12px] text-ink">
          {weekOffset === 0 ? "This week" : "Looking ahead"}
        </h2>
        <div className="flex items-center gap-2">
          <p className="type-mono mr-1 text-[11px] text-ink-soft" aria-live="polite">
            {weekRangeLabel(week)}
          </p>
          <PagerButton
            direction="back"
            onClick={() => onTurnWeek(weekOffset - 1)}
            disabled={weekOffset === 0 || weekLoading}
            label="Back one week"
          />
          <PagerButton
            direction="forward"
            onClick={() => onTurnWeek(weekOffset + 1)}
            disabled={!hasNext || weekLoading}
            label="Ahead one week"
          />
        </div>
      </div>

      {weekError !== null && (
        <div className="mt-3 border border-vermilion bg-milk px-4 py-3">
          <p className="type-legend text-[11px] text-vermilion-deep">Errata</p>
          <p className="mt-1 text-[14px] font-medium text-ink">
            That week could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => onTurnWeek(weekError)}
            className="type-legend step-motion mt-1.5 text-[11px] text-ink underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <div key={week[0]?.date} className="step-hinge mt-2 border-b rule-faint">
        {week.map((day) => {
          const config = day.color ? COLOR_CONFIG[day.color] : null;
          const isSelected = day.date === selectedDate;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(day.date)}
              aria-pressed={isSelected}
              aria-label={`${day.dayName}, ${config ? `${config.label} day` : "no school"}`}
              className="step-motion flex w-full items-center gap-3 border-t rule-faint py-2.5 text-left hover:bg-milk"
            >
              <span
                className="relative flex h-7 w-10 shrink-0 items-center justify-center rounded-r-[4px]"
                style={{ backgroundColor: config ? config.board : "var(--color-board-shade)" }}
                aria-hidden="true"
              >
                {isSelected && <PunchHole color="var(--color-board)" size={8} />}
              </span>
              <span className="w-16 shrink-0">
                <span className={`type-legend block text-[11px] ${day.isToday ? "text-ink" : "text-ink-soft"}`}>
                  {day.dayName.slice(0, 3)}
                  {day.isToday && (
                    <span
                      className="ml-1.5 inline-block bg-ink align-middle"
                      style={{ width: 6, height: 6 }}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span className="type-mono block text-[10px] text-ink-faint">
                  {config ? config.label : "—"}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                {config ? (
                  students.map((student) => (
                    <span key={student.id} className="type-mono block truncate text-[13px] text-ink">
                      {students.length > 1 && (
                        <span className="text-ink-soft">{student.name.split(" ")[0]} — </span>
                      )}
                      {student.colorMap[day.color!] ?? (
                        <span className="text-vermilion-deep">not mapped</span>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="type-mono text-[13px] text-ink-faint">No school</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* Stepped tab rail down the fore edge */
function TabRail({
  week,
  selectedDate,
  onSelect,
}: {
  week: DaySchedule[];
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  return (
    <nav
      className="absolute right-0 top-5 z-10 flex flex-col gap-[3px]"
      aria-label="Week tabs"
    >
      {week.map((day) => {
        const config = day.color ? COLOR_CONFIG[day.color] : null;
        const isSelected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelect(day.date)}
            aria-pressed={isSelected}
            aria-label={`${day.dayName}, ${config ? `${config.label} day` : "no school"}`}
            className={`step-motion flex h-11 items-center justify-start rounded-l-[5px] pl-2 ${
              isSelected ? "w-12" : "w-8"
            }`}
            style={{
              backgroundColor: config ? config.board : "var(--color-board-shade)",
              color: config ? config.onBoard : "var(--color-ink-faint)",
              boxShadow: "0 1px 3px rgba(23, 21, 15, 0.25)",
            }}
          >
            <span className="type-legend text-[11px]">{day.dayName[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-5">
      <div
        className="step-half-hinge w-full bg-milk px-6 py-8"
        style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
      >
        <p className="type-legend text-[11px] text-ink-soft">Please wait</p>
        <p className="type-mono mt-2 text-[14px] text-ink">Retrieving schedule…</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md items-center justify-center px-5">
      <div
        className="w-full border border-vermilion bg-milk px-6 py-6"
        style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
      >
        <p className="type-legend text-[11px] text-vermilion-deep">Errata</p>
        <p className="mt-2 text-[16px] font-semibold text-ink">
          The schedule could not be loaded.
        </p>
        <p className="type-mono mt-1.5 text-[13px] text-ink-soft">{message}</p>
        <p className="mt-3 text-[14px] text-ink-soft">Reload the page to try again.</p>
      </div>
    </div>
  );
}

/* Title page: the manual's cover, shown before any student exists */
function EmptyState() {
  return (
    <div className="mx-auto w-full max-w-md px-5 pb-16 pt-10 text-center">
      <div className="flex justify-center gap-[3px]" aria-hidden="true">
        {(Object.keys(BOARD_HEX) as (keyof typeof BOARD_HEX)[]).map((c) => (
          <span
            key={c}
            className="h-8 w-12 rounded-b-[4px]"
            style={{ backgroundColor: BOARD_HEX[c] }}
          />
        ))}
      </div>

      <h1 className="type-display mt-12 text-[3rem] text-ink">
        Today&apos;s Related Art
      </h1>
      <div className="mx-auto mt-4 w-24 border-t-2 border-ink" aria-hidden="true" />
      <p className="type-mono mt-4 text-[12px] text-ink-soft">
        The household reference manual
      </p>

      <p className="type-body mx-auto mt-6 max-w-xs text-ink-soft">
        Howard County elementary schools rotate Music, Art, PE, Media, and
        Technology on color days &mdash; Red, Blue, Yellow, Green, Orange. Map
        each color to your child&apos;s class once, and this page answers the
        morning question ever after.
      </p>

      <p className="type-mono mt-6 text-[12px] text-ink-faint">
        Have the teacher&apos;s schedule sheet handy.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4">
        <SignInButton variant="primary" />
        <p className="type-mono max-w-xs text-[12px] text-ink-faint">
          Already set up? Signing in restores your students.
        </p>
        <Link
          href="/setup"
          className="type-legend text-[12px] text-ink underline underline-offset-4"
        >
          Or add a student without signing in
        </Link>
      </div>

      <p className="type-mono mt-14 text-[10px] text-ink-faint">
        {editionLabel()} · reads the public HCPSS &ldquo;ES Related
        Arts&rdquo; calendar
      </p>
    </div>
  );
}

type WeekPage = { week: DaySchedule[]; hasNext: boolean };

export default function HomePage() {
  const { data: session } = useSession();
  const { students, loading: studentsLoading } = useStudents();
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekPages, setWeekPages] = useState<Record<number, WeekPage>>({});
  const [weekLoading, setWeekLoading] = useState(false);
  const [weekError, setWeekError] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then((data: ScheduleResponse) => {
        setSchedule(data);
        setWeekPages({ 0: { week: data.week, hasNext: data.hasNext ?? false } });
      })
      .catch((err) => setError(err.message))
      .finally(() => setScheduleLoading(false));
  }, []);

  // Turn the index to another week, fetching its page on first visit
  const turnWeek = useCallback(
    async (offset: number) => {
      if (offset < 0) return;
      setWeekError(null);
      if (weekPages[offset]) {
        setWeekOffset(offset);
        return;
      }
      setWeekLoading(true);
      try {
        const res = await fetch(`/api/schedule?offset=${offset}`);
        if (!res.ok) throw new Error("Failed to fetch week");
        const data: ScheduleResponse = await res.json();
        setWeekPages((prev) => ({
          ...prev,
          [offset]: { week: data.week, hasNext: data.hasNext ?? false },
        }));
        setWeekOffset(offset);
      } catch {
        setWeekError(offset);
      } finally {
        setWeekLoading(false);
      }
    },
    [weekPages]
  );

  const viewedPage: WeekPage | null =
    weekPages[weekOffset] ??
    (schedule ? { week: schedule.week, hasNext: schedule.hasNext ?? false } : null);

  // The section the manual lies open at: the chosen tab (from any loaded
  // week), else today, else the next school day in the week when today is off.
  const openDay: DaySchedule | null = useMemo(() => {
    if (!schedule) return null;
    if (selectedDate) {
      for (const page of Object.values(weekPages)) {
        const picked = page.week.find((d) => d.date === selectedDate);
        if (picked) return picked;
      }
    }
    if (schedule.today.color) return schedule.today;
    return schedule.week.find((d) => !d.isToday && d.color) ?? schedule.today;
  }, [schedule, selectedDate, weekPages]);

  if (scheduleLoading || studentsLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (students.length === 0) return <EmptyState />;
  if (!schedule || !openDay) return null;

  const todayIsOff = !schedule.today.color;
  const showingSubstitute = !selectedDate && todayIsOff && openDay.date !== schedule.today.date;

  return (
    <div className="relative mx-auto w-full max-w-md bg-board page:my-8 page:border page:rule-faint page:shadow-[0_18px_60px_rgba(23,21,15,0.22)] md:my-10">
      {/* Running header */}
      <header className="px-5 pt-5 sm:px-8">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="type-legend text-[13px] text-ink">
            Today&apos;s Related Art
          </h1>
          <nav className="flex items-center gap-3">
            {session?.user ? (
              <span
                className="type-mono flex h-6 w-6 items-center justify-center border rule bg-milk text-[10px] text-ink"
                title={session.user.name || session.user.email || undefined}
              >
                {(session.user.name || session.user.email || "?")[0].toUpperCase()}
              </span>
            ) : (
              <SignInButton variant="compact" />
            )}
            <Link
              href="/setup"
              className="type-legend text-[11px] text-ink underline underline-offset-4"
            >
              Edit students
            </Link>
          </nav>
        </div>
        <div className="mt-3 flex justify-between border-t-2 border-ink pt-1.5 pb-4">
          <p className="type-mono text-[11px] text-ink-soft">
            {schedule.today.dayName.toUpperCase()} · {shortDate(schedule.today.date)}
          </p>
          <p className="type-mono text-[11px] text-ink-soft">{editionLabel()}</p>
        </div>
      </header>

      {/* The open section carries its own fore-edge tabs */}
      <div className="relative">
        <TabRail
          week={viewedPage?.week ?? schedule.week}
          selectedDate={openDay.date}
          onSelect={setSelectedDate}
        />
        <DayBoard day={openDay} students={students} todayIsOff={showingSubstitute} />
      </div>

      {((selectedDate && selectedDate !== schedule.today.date) || weekOffset > 0) && (
        <div className="px-5 pt-3 sm:px-8">
          <button
            type="button"
            onClick={() => {
              setSelectedDate(null);
              setWeekOffset(0);
              setWeekError(null);
            }}
            className="type-legend step-motion text-[11px] text-ink underline underline-offset-4"
          >
            Return to today
          </button>
        </div>
      )}

      <WeekIndex
        week={viewedPage?.week ?? schedule.week}
        students={students}
        selectedDate={openDay.date}
        onSelect={setSelectedDate}
        weekOffset={weekOffset}
        hasNext={viewedPage?.hasNext ?? false}
        weekLoading={weekLoading}
        weekError={weekError}
        onTurnWeek={turnWeek}
      />

      {/* Colophon */}
      <footer className="border-t rule px-5 py-4 sm:px-8">
        <p className="type-mono text-[10px] leading-relaxed text-ink-faint">
          {editionLabel()} · reads the public HCPSS &ldquo;ES Related
          Arts&rdquo; calendar · not affiliated with the district
        </p>
      </footer>
    </div>
  );
}
