import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    // Don't reveal if email exists
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.update(users)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(users.email, email));

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "AccuFootball <onboarding@resend.dev>",
    to: email,
    subject: "Reset your AccuFootball password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #facc15; color: black; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
