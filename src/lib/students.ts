"use client";

import { Student } from "./types";

const STORAGE_KEY = "todays-related-art-students";

export function getStudents(): Student[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
}

export function updateStudent(updated: Student): void {
  const students = getStudents().map((s) =>
    s.id === updated.id ? updated : s
  );
  saveStudents(students);
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter((s) => s.id !== id);
  saveStudents(students);
}
