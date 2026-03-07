"use server";
import { auth } from "@/auth";
import { db } from "@/db";
import { selections, matches } from "@/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleSelection(
  matchId: number,
  competitionId: number,
  prediction: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not logged in" };

  const userId = session.user.id;

  const existing = await db
    .select()
    .from(selections)
    .where(and(eq(selections.userId, userId), eq(selections.matchId, matchId)));

  if (existing.length > 0) {
    if (existing[0].prediction === prediction) {
      await db
        .delete(selections)
        .where(and(eq(selections.userId, userId), eq(selections.matchId, matchId)));
    } else {
      await db
        .update(selections)
        .set({ prediction, updatedAt: new Date() })
        .where(and(eq(selections.userId, userId), eq(selections.matchId, matchId)));
    }
  } else {
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

export async function checkMatchResults() {
  const pending = await db
    .select({
      selectionId: selections.id,
      matchId: selections.matchId,
      prediction: selections.prediction,
      winner: matches.winner,
      status: matches.status,
    })
    .from(selections)
    .innerJoin(matches, eq(selections.matchId, matches.id))
    .where(
      and(
        eq(matches.status, "FINISHED"),
        isNull(selections.isCorrect)
      )
    );

  if (pending.length === 0) return;

  // For each pending match, calculate popularity of each outcome
  const matchIds = [...new Set(pending.map(r => r.matchId))];

  for (const matchId of matchIds) {
    const rows = pending.filter(r => r.matchId === matchId);

    // Count how many users picked each outcome for this match
    const totalPickers = await db
      .select({ count: sql<number>`count(*)` })
      .from(selections)
      .where(eq(selections.matchId, matchId));

    const total = Number(totalPickers[0].count);

    for (const outcome of ["HOME_TEAM", "DRAW", "AWAY_TEAM"]) {
      const outcomePickers = await db
        .select({ count: sql<number>`count(*)` })
        .from(selections)
        .where(and(eq(selections.matchId, matchId), eq(selections.prediction, outcome)));

      const outcomeCount = Number(outcomePickers[0].count);
      // popularity = fraction of users who picked this outcome (min 0.01 to avoid division by zero)
      const popularity = total > 0 ? Math.max(outcomeCount / total, 0.01) : 1;
      // edge score = 1 / popularity (harder pick = higher score)
      const edgeScore = 1 / popularity;

      // Update all selections for this match+outcome
      const matchRows = rows.filter(r => r.prediction === outcome);
      for (const row of matchRows) {
        const winner = row.winner;
        if (!winner) continue;
        const correct = row.prediction === winner;
        await db
          .update(selections)
          .set({
            isCorrect: correct,
            score: correct ? edgeScore : 0,
            updatedAt: new Date(),
          })
          .where(eq(selections.id, row.selectionId));
      }
    }
  }
}
