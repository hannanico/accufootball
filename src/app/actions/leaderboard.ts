"use server";
import { db } from "@/db";
import { selections, users } from "@/db/schema";
import { eq, sql, gte, and, isNotNull } from "drizzle-orm";

const MIN_PICKS = 10;

export async function getLeaderboard(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      userId: selections.userId,
      name: users.name,
      total: sql<number>`count(*)`,
      correct: sql<number>`sum(case when ${selections.isCorrect} = true then 1 else 0 end)`,
      totalEdge: sql<number>`sum(case when ${selections.isCorrect} = true then ${selections.score}::numeric else 0 end)`,
    })
    .from(selections)
    .innerJoin(users, eq(selections.userId, users.id))
    .where(
      and(
        isNotNull(selections.isCorrect),
        gte(selections.updatedAt, since)
      )
    )
    .groupBy(selections.userId, users.name)
    .having(sql`count(*) >= ${MIN_PICKS}`);

  return rows
    .map((r) => {
      const total = Number(r.total);
      const correct = Number(r.correct);
      const totalEdge = Number(r.totalEdge);
      const accuracy = total > 0 ? correct / total : 0;
      const edge = correct > 0 ? totalEdge / correct : 1;
      const rankScore = accuracy * edge * Math.log10(total + 1);
      return {
        userId: r.userId,
        name: r.name,
        total,
        correct,
        accuracy: Math.round(accuracy * 100),
        edge: Math.round(edge * 10) / 10,
        rankScore: Math.round(rankScore * 100) / 100,
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, 10); // top 10
}
