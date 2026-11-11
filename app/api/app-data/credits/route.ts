import { and, eq, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appUserData } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to use studio credits." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount =
    body && typeof body === "object" ? (body as { amount?: unknown }).amount : undefined;
  if (!Number.isSafeInteger(amount) || (amount as number) <= 0 || (amount as number) > 100_000) {
    return NextResponse.json({ error: "Invalid credit amount." }, { status: 400 });
  }

  const userId = session.user.id;
  await db.insert(appUserData).values({ userId }).onConflictDoNothing();
  const [updated] = await db
    .update(appUserData)
    .set({ credits: sql`${appUserData.credits} - ${amount as number}`, updatedAt: new Date() })
    .where(and(eq(appUserData.userId, userId), gte(appUserData.credits, amount as number)))
    .returning({ credits: appUserData.credits });

  if (!updated) {
    return NextResponse.json({ error: "Not enough credits for this action." }, { status: 409 });
  }

  return NextResponse.json({ credits: updated.credits });
}
