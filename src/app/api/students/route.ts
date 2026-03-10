import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.userId, session.user.id));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, colorMap } = body;

  const [row] = await db
    .insert(students)
    .values({
      id: id || undefined,
      userId: session.user.id,
      name,
      colorMap: colorMap || {},
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, colorMap } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  const [row] = await db
    .update(students)
    .set({ name, colorMap })
    .where(and(eq(students.id, id), eq(students.userId, session.user.id)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  await db
    .delete(students)
    .where(and(eq(students.id, id), eq(students.userId, session.user.id)));

  return NextResponse.json({ ok: true });
}
