"use server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function setLanguage(language: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await db.update(users).set({ language }).where(eq(users.id, session.user.id));
  revalidatePath("/", "layout");
}
