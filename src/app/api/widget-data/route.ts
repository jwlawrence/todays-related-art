import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.widgetToken, token));

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(students)
    .where(eq(students.userId, user.id));

  return NextResponse.json(rows);
}
