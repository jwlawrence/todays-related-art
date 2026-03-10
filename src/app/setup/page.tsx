"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useStudents } from "@/hooks/useStudents";
import { COLOR_CONFIG } from "@/lib/colors";
import {
  COLORS,
  RELATED_ARTS,
  type Student,
  type ScheduleColor,
  type RelatedArt,
} from "@/lib/types";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      name: name.trim(),
      colorMap,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark animate-slide-up"
    >
      <div className="mb-5">
        <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
          Student Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-cream rounded-xl font-display font-medium text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-ink/10 focus:bg-white outline-none transition-all"
          placeholder="e.g., Emma"
          required
          autoFocus={!initial}
        />
      </div>

      <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
        What does each color day mean?
      </p>
      <div className="space-y-2 mb-6">
        {COLORS.map((color, i) => {
          const config = COLOR_CONFIG[color];
          return (
            <div
              key={color}
              className="flex items-center gap-3 animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`flex items-center gap-2 w-28 shrink-0`}
              >
                <span className={`w-4 h-4 rounded-full ${config.solid} shrink-0`} />
                <span className={`font-display font-bold text-sm ${config.text}`}>
                  {config.label}
                </span>
              </div>
              <select
                value={colorMap[color] ?? ""}
                onChange={(e) =>
                  setColorMap((prev) => ({
                    ...prev,
                    [color]: e.target.value || undefined,
                  }))
                }
                className="flex-1 px-3 py-2.5 bg-cream rounded-xl text-sm font-medium text-ink focus:ring-2 focus:ring-ink/10 focus:bg-white outline-none transition-all"
              >
                <option value="">Select...</option>
                {RELATED_ARTS.map((art) => (
                  <option key={art} value={art}>
                    {art}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-ink text-cream py-3 rounded-xl font-display font-bold hover:bg-ink/90 transition-all active:scale-[0.98]"
        >
          {initial ? "Save Changes" : "Add Student"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 text-ink-muted hover:text-ink font-display font-bold transition-colors rounded-xl hover:bg-cream-dark"
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
  index,
}: {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-lg font-bold text-ink">
          {student.name}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1 rounded-lg hover:bg-cream-dark transition-all"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-xs font-semibold text-ink-muted hover:text-day-red px-2.5 py-1 rounded-lg hover:bg-day-red-soft transition-all"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLORS.map((color) => {
          const config = COLOR_CONFIG[color];
          const art = student.colorMap[color];
          if (!art) return null;
          return (
            <span
              key={color}
              className={`inline-flex items-center gap-1.5 ${config.soft} px-2.5 py-1 rounded-full`}
            >
              <span className={`w-2 h-2 rounded-full ${config.solid}`} />
              <span className={`text-xs font-semibold ${config.text}`}>
                {art}
              </span>
            </span>
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
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark animate-slide-up">
        <p className="font-display font-bold text-ink text-sm mb-1">
          Sync across devices
        </p>
        <p className="text-ink-muted text-xs mb-4">
          Sign in to access your students on any device.
        </p>
        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-2 bg-white border border-cream-dark hover:bg-cream-dark py-3 rounded-xl font-display font-bold text-sm text-ink transition-all active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-display font-bold text-ink text-sm">
            {session.user?.name || session.user?.email}
          </p>
          <p className="text-ink-muted text-xs">Synced across devices</p>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1 rounded-lg hover:bg-cream-dark transition-all"
        >
          Sign out
        </button>
      </div>

      {confirmDelete ? (
        <div className="bg-day-red-soft rounded-xl p-4">
          <p className="text-sm font-display font-bold text-ink mb-1">
            Delete your account?
          </p>
          <p className="text-xs text-ink-muted mb-3">
            This permanently removes your account and all student data from
            our servers. Local data on this device will be kept.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteAccount}
              className="flex-1 bg-day-red text-white py-2 rounded-lg font-display font-bold text-xs hover:bg-day-red/90 transition-all"
            >
              Permanently delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 text-ink-muted font-display font-bold text-xs hover:bg-cream-dark rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="text-xs text-ink-muted hover:text-day-red transition-colors"
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
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-ink-muted font-display text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h1 className="font-display text-lg font-bold text-ink">
          Students
        </h1>
        <button
          onClick={() => router.push("/")}
          className="text-xs font-semibold text-ink-muted hover:text-ink transition-colors bg-cream-dark hover:bg-white px-3 py-1.5 rounded-full flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Schedule
        </button>
      </div>

      {/* Student list */}
      <div className="space-y-3">
        {students.map((student, i) =>
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
              index={i}
            />
          )
        )}
      </div>

      {/* Add form or button */}
      {showAddForm ? (
        <StudentForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 border-2 border-dashed border-ink-muted/20 rounded-2xl text-ink-muted hover:border-ink/30 hover:text-ink hover:bg-white transition-all font-display font-bold text-sm active:scale-[0.99]"
        >
          + Add Student
        </button>
      )}

      {/* Account */}
      <AccountSection />
    </div>
  );
}
