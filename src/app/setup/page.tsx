"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useStudents } from "@/hooks/useStudents";
import { SignInButton } from "@/components/SignInButton";
import { COLOR_CONFIG } from "@/lib/colors";
import {
  COLORS,
  RELATED_ARTS,
  type Student,
  type ScheduleColor,
  type RelatedArt,
} from "@/lib/types";

function TabSwatch({ color, size = "h-6 w-9" }: { color: ScheduleColor; size?: string }) {
  const config = COLOR_CONFIG[color];
  return (
    <span
      className={`inline-block shrink-0 rounded-r-[4px] ${size}`}
      style={{ backgroundColor: config.board }}
      aria-hidden="true"
    />
  );
}

function StudentForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Student;
  onSave: (student: Student) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [colorMap, setColorMap] = useState<
    Partial<Record<ScheduleColor, RelatedArt>>
  >(initial?.colorMap ?? {});
  const [notes, setNotes] = useState<Partial<Record<ScheduleColor, string>>>(
    initial?.notes ?? {}
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      colorMap,
      notes,
    });
  };

  const inputClass =
    "step-motion w-full rounded-[3px] border border-ink/30 bg-milk px-3 py-2.5 type-mono text-[14px] text-ink placeholder:text-ink-faint focus:border-ink outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      className="step-hinge bg-milk p-5"
      style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
    >
      <p className="type-legend text-[11px] text-ink-soft">
        {initial ? "Revise entry" : "New entry"}
      </p>

      <div className="mt-4">
        <label
          htmlFor="student-name"
          className="type-legend block text-[11px] text-ink"
        >
          Student name
        </label>
        <input
          id="student-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`mt-2 ${inputClass}`}
          placeholder="e.g., Emma"
          required
          autoFocus={!initial}
        />
      </div>

      <p className="type-legend mt-6 border-t rule-faint pt-4 text-[11px] text-ink">
        What does each color day mean?
      </p>
      <p className="type-mono mt-1 text-[12px] text-ink-faint">
        From the teacher&apos;s schedule sheet.
      </p>

      <div className="mt-4 space-y-4">
        {COLORS.map((color) => {
          const config = COLOR_CONFIG[color];
          return (
            <div key={color} className="flex items-start gap-3">
              <div className="flex w-24 shrink-0 items-center gap-2 pt-2.5">
                <TabSwatch color={color} size="h-5 w-8" />
                <label
                  htmlFor={`map-${color}`}
                  className="type-legend text-[11px] text-ink"
                >
                  {config.label}
                </label>
              </div>
              <div className="flex-1">
                <input
                  id={`map-${color}`}
                  list={`arts-${color}`}
                  value={colorMap[color] ?? ""}
                  onChange={(e) =>
                    setColorMap((prev) => ({
                      ...prev,
                      [color]: e.target.value || undefined,
                    }))
                  }
                  placeholder="Select or type…"
                  className={inputClass}
                />
                <datalist id={`arts-${color}`}>
                  {RELATED_ARTS.map((art) => (
                    <option key={art} value={art} />
                  ))}
                </datalist>
                {colorMap[color] && (
                  <input
                    type="text"
                    value={notes[color] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [color]: e.target.value || undefined,
                      }))
                    }
                    placeholder="What to bring…"
                    aria-label={`What to bring on ${config.label} days`}
                    className={`mt-2 ${inputClass} text-[13px]`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4 border-t rule-faint pt-4">
        <button
          type="submit"
          className="type-legend step-motion flex-1 rounded-[3px] border border-ink bg-day-yellow py-3 text-[12px] text-ink hover:bg-milk"
          style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
        >
          {initial ? "Save changes" : "Add student"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="type-legend step-motion px-2 py-3 text-[12px] text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function StudentCard({
  student,
  onEdit,
  onDelete,
}: {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="bg-milk p-5"
      style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="type-display text-[1.35rem] text-ink">{student.name}</h3>
        <div className="flex gap-4">
          <button
            onClick={onEdit}
            className="type-legend step-motion text-[11px] text-ink underline underline-offset-4 hover:text-ink-soft"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="type-legend step-motion text-[11px] text-ink-soft underline underline-offset-4 hover:text-vermilion-deep"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="mt-3 border-b rule-faint">
        {COLORS.map((color) => {
          const config = COLOR_CONFIG[color];
          const art = student.colorMap[color];
          return (
            <div
              key={color}
              className="flex items-center gap-3 border-t rule-faint py-1.5"
            >
              <TabSwatch color={color} size="h-4 w-7" />
              <span className="type-legend w-14 text-[10px] text-ink-soft">
                {config.label}
              </span>
              {art ? (
                <span className="type-mono text-[13px] text-ink">{art}</span>
              ) : (
                <span className="type-mono text-[13px] text-vermilion-deep">
                  not mapped
                </span>
              )}
              {art && student.notes?.[color] && (
                <span className="type-mono min-w-0 flex-1 truncate text-right text-[11px] text-ink-faint">
                  {student.notes[color]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccountSection() {
  const { data: session } = useSession();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ callbackUrl: "/" });
  };

  if (!session) {
    return (
      <div
        className="bg-milk p-5"
        style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
      >
        <p className="type-legend text-[11px] text-ink">Sync across devices</p>
        <p className="type-mono mt-1.5 mb-4 text-[12px] text-ink-soft">
          Sign in to access your students on any device.
        </p>
        <SignInButton variant="secondary" />
      </div>
    );
  }

  return (
    <div
      className="bg-milk p-5"
      style={{ boxShadow: "0 2px 6px rgba(23, 21, 15, 0.28)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="type-legend truncate text-[11px] text-ink">
            {session.user?.name || session.user?.email}
          </p>
          <p className="type-mono mt-1 text-[12px] text-ink-soft">
            Synced across devices
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="type-legend step-motion shrink-0 text-[11px] text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          Sign out
        </button>
      </div>

      {confirmDelete ? (
        <div className="mt-4 border border-vermilion bg-milk p-4">
          <p className="type-legend text-[11px] text-vermilion-deep">
            Delete your account?
          </p>
          <p className="type-mono mt-2 mb-3 text-[12px] leading-relaxed text-ink-soft">
            This permanently removes your account and all student data from our
            servers. Local data on this device will be kept.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDeleteAccount}
              className="type-legend step-motion flex-1 rounded-[3px] border border-vermilion-deep bg-vermilion-deep py-2.5 text-[11px] text-milk hover:bg-milk hover:text-vermilion-deep"
            >
              Permanently delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="type-legend step-motion text-[11px] text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="type-mono step-motion mt-4 text-[11px] text-ink-faint hover:text-vermilion-deep"
        >
          Delete account and data
        </button>
      )}
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const { students, loading, addStudent, updateStudent, deleteStudent } =
    useStudents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!loading && students.length === 0) setShowAddForm(true);
  }, [loading, students.length]);

  const handleAdd = async (student: Student) => {
    await addStudent(student);
    setShowAddForm(false);
  };

  const handleUpdate = async (student: Student) => {
    await updateStudent(student);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this student?")) return;
    await deleteStudent(id);
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[40vh] w-full max-w-md items-center justify-center px-5">
        <p className="type-mono text-[13px] text-ink-soft">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md bg-board px-5 pb-12 sm:px-8 page:my-8 page:border page:rule-faint page:shadow-[0_18px_60px_rgba(23,21,15,0.22)] md:my-10">
      {/* Running header */}
      <header className="pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="type-legend text-[13px] text-ink">Students</h1>
          <button
            onClick={() => router.push("/")}
            className="type-legend step-motion text-[11px] text-ink underline underline-offset-4 hover:text-ink-soft"
          >
            Back to schedule
          </button>
        </div>
        <div className="mt-3 border-t-2 border-ink pt-1.5 pb-2">
          <p className="type-mono text-[11px] text-ink-soft">
            Color-day mappings · one entry per student
          </p>
        </div>
      </header>

      <div className="mt-4 space-y-5">
        {students.map((student) =>
          editingId === student.id ? (
            <StudentForm
              key={student.id}
              initial={student}
              onSave={handleUpdate}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={() => setEditingId(student.id)}
              onDelete={() => handleDelete(student.id)}
            />
          )
        )}

        {showAddForm ? (
          <StudentForm
            onSave={handleAdd}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="type-legend step-motion w-full py-4 text-[12px] text-ink-soft hover:text-ink"
            style={{ outline: "1.5px dotted var(--color-ink-faint)", outlineOffset: "-1.5px" }}
          >
            + Add student
          </button>
        )}

        <AccountSection />
      </div>
    </div>
  );
}
