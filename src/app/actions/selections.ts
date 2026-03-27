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
  // 1. Get all pending selections with match result
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

  const matchIds = [...new Set(pending.map((r) => r.matchId))];

  // 2. Get all selection counts grouped by matchId + prediction in ONE query
  const counts = await db
    .select({
      matchId: selections.matchId,
      prediction: selections.prediction,
      count: sql<number>`count(*)`,
    })
    .from(selections)
    .where(sql`${selections.matchId} = ANY(ARRAY[${sql.join(matchIds.map(id => sql`${id}`), sql`, `)}]::int[])`)
    .groupBy(selections.matchId, selections.prediction);

  // Build lookup: { matchId: { total, HOME_TEAM: n, DRAW: n, AWAY_TEAM: n } }
  const countMap: Record<number, Record<string, number>> = {};
  for (const row of counts) {
    if (!countMap[row.matchId]) countMap[row.matchId] = { total: 0 };
    countMap[row.matchId][row.prediction] = Number(row.count);
    countMap[row.matchId].total += Number(row.count);
  }

  // 3. Compute scores and batch update in ONE query using CASE
  const updates = pending.map((row) => {
    if (!row.winner) return null;
    const matchCounts = countMap[row.matchId] ?? {};
    const total = matchCounts.total ?? 1;
    const outcomeCount = matchCounts[row.prediction] ?? 0;
    const popularity = total > 0 ? Math.max(outcomeCount / total, 0.01) : 1;
    const edgeScore = 1 / popularity;
    const correct = row.prediction === row.winner;

    return {
      id: row.selectionId,
      isCorrect: correct,
      score: correct ? String(edgeScore) : "0",
    };
  }).filter(Boolean) as { id: string; isCorrect: boolean; score: string }[];

  if (!updates.length) return;

  // Batch update with a single SQL CASE statement
  await db.execute(sql`
  UPDATE selections SET
    is_correct = CASE id
      ${sql.join(updates.map(u => sql`WHEN ${u.id}::uuid THEN ${u.isCorrect}::boolean`), sql` `)}
    END,
    score = CASE id
      ${sql.join(updates.map(u => sql`WHEN ${u.id}::uuid THEN ${u.score}::numeric`), sql` `)}
    END,
    updated_at = NOW()
  WHERE id IN (${sql.join(updates.map(u => sql`${u.id}::uuid`), sql`, `)})
`);
}