"use server";
import { auth } from "@/auth";
import { db } from "@/db";
import { selections } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleSelection(
  matchId: number,
  competitionId: number,
  prediction: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not logged in" };

  const userId = session.user.id;

  // Check if selection already exists
  const existing = await db
    .select()
    .from(selections)
    .where(and(eq(selections.userId, userId), eq(selections.matchId, matchId)));

  if (existing.length > 0) {
    if (existing[0].prediction === prediction) {
      // Same button pressed — remove selection
      await db
        .delete(selections)
        .where(and(eq(selections.userId, userId), eq(selections.matchId, matchId)));
    } else {
      // Different option — update prediction
      await db
        .update(selections)
        .set({ prediction, updatedAt: new Date() })
        .where(and(eq(selections.userId, userId), eq(selections.matchId, matchId)));
    }
  } else {
    // New selection
    await db.insert(selections).values({
      userId,
      matchId,
      competitionId,
      prediction,
    });
  }

  revalidatePath("/leagues/[id]", "page");
  revalidatePath("/selections");
}
