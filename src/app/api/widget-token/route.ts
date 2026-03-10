import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({ widgetToken: users.widgetToken })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user?.widgetToken) {
    // Generate token if missing (for users created before this feature)
    const token = crypto.randomUUID();
    await db
      .update(users)
      .set({ widgetToken: token })
      .where(eq(users.id, session.user.id));
    return NextResponse.json({ token });
  }

  return NextResponse.json({ token: user.widgetToken });
}
