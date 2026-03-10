"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import type { Student } from "@/lib/types";
import {
  getStudents as getLocalStudents,
  saveStudents as saveLocalStudents,
} from "@/lib/students";

export function useStudents() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const isLoading = status === "loading";

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthed) {
        const res = await fetch("/api/students");
        if (res.ok) {
          const dbStudents = await res.json();

          // First sign-in migration: if DB is empty but localStorage has data, upload it
          if (dbStudents.length === 0) {
            const localStudents = getLocalStudents();
            if (localStudents.length > 0) {
              await Promise.all(
                localStudents.map((s) =>
                  fetch("/api/students", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(s),
                  })
                )
              );
              // Re-fetch to get server-assigned data
              const res2 = await fetch("/api/students");
              if (res2.ok) {
                const migrated = await res2.json();
                setStudents(migrated);
                saveLocalStudents(migrated);
                return;
              }
            }
          }

          setStudents(dbStudents);
          saveLocalStudents(dbStudents);
        }
      } else if (!isLoading) {
        setStudents(getLocalStudents());
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthed, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      fetchStudents();
    }
  }, [isLoading, fetchStudents]);

  const addStudent = useCallback(
    async (student: Student) => {
      if (isAuthed) {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student),
        });
        if (res.ok) {
          await fetchStudents();
        }
      } else {
        const updated = [...students, student];
        saveLocalStudents(updated);
        setStudents(updated);
      }
    },
    [isAuthed, students, fetchStudents]
  );

  const updateStudent = useCallback(
    async (student: Student) => {
      if (isAuthed) {
        await fetch("/api/students", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(student),
        });
        await fetchStudents();
      } else {
        const updated = students.map((s) =>
          s.id === student.id ? student : s
        );
        saveLocalStudents(updated);
        setStudents(updated);
      }
    },
    [isAuthed, students, fetchStudents]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      if (isAuthed) {
        await fetch(`/api/students?id=${id}`, { method: "DELETE" });
        await fetchStudents();
      } else {
        const updated = students.filter((s) => s.id !== id);
        saveLocalStudents(updated);
        setStudents(updated);
      }
    },
    [isAuthed, students, fetchStudents]
  );

  return { students, loading, addStudent, updateStudent, deleteStudent };
}
