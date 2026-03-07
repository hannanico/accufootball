import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const [user] = await db.select().from(users).where(eq(users.resetToken, token));

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.update(users)
    .set({ password: hashed, resetToken: null, resetTokenExpiry: null })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
