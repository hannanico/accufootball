"use server";
import { db } from "@/db";
import { selections, users } from "@/db/schema";
import { eq, sql, gte, and, isNotNull } from "drizzle-orm";

// Minimum picks required to appear on the leaderboard.
// Prevents users with 1–2 lucky guesses from ranking #1.
const MIN_PICKS = 10;

export async function getLeaderboard(days: number | null) {
  // Build date filter only when a period is given.
  // null = all-time (no date restriction).
  const since = days
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d;
      })()
    : null;

  const rows = await db
    .select({
      userId: selections.userId,
      name: users.name,
      total:     sql<number>`count(*)`,
      correct:   sql<number>`sum(case when ${selections.isCorrect} = true then 1 else 0 end)`,
      totalEdge: sql<number>`sum(case when ${selections.isCorrect} = true then ${selections.score}::numeric else 0 end)`,
    })
    .from(selections)
    .innerJoin(users, eq(selections.userId, users.id))
    .where(
      and(
        // Only count selections that have already been graded.
        isNotNull(selections.isCorrect),
        // Apply date filter only when a period is selected.
        since ? gte(selections.updatedAt, since) : undefined,
      )
    )
    .groupBy(selections.userId, users.name)
    // Require a minimum number of picks to qualify.
    .having(sql`count(*) >= ${MIN_PICKS}`)

  return rows
    .map((r) => {
      const total     = Number(r.total);
      const correct   = Number(r.correct);
      const totalEdge = Number(r.totalEdge);

      const accuracy = total > 0   ? correct / total       : 0;
      const edge     = correct > 0 ? totalEdge / correct   : 1;

      // RankScore rewards accuracy AND edge AND volume (log10 prevents
      // users with thousands of picks from dominating purely by volume).
      const rankScore = accuracy * edge * Math.log10(total + 1);

      return {
        userId: r.userId,
        name: r.name,
        total,
        correct,
        accuracy:  Math.round(accuracy * 100),
        edge:      Math.round(edge * 10) / 10,
        rankScore: Math.round(rankScore * 100) / 100,
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 10); // Top 10 only
}
