import { db } from "@/db";
import { matches, competitions } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "No date" }, { status: 400 });

  const [year, month, day] = date.split("-").map(Number);
  const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const dayEnd   = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  const dayMatches = await db
    .select({
      id: matches.id,
      homeTeamShort: matches.homeTeamShort,
      homeTeamCrest: matches.homeTeamCrest,
      awayTeamShort: matches.awayTeamShort,
      awayTeamCrest: matches.awayTeamCrest,
      utcDate: matches.utcDate,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      competitionId: matches.competitionId,
      competitionName: competitions.name,
      competitionEmblem: competitions.emblemUrl,
    })
    .from(matches)
    .innerJoin(competitions, eq(matches.competitionId, competitions.id))
    .where(and(gte(matches.utcDate, dayStart), lt(matches.utcDate, dayEnd)))
    .orderBy(matches.utcDate);

  return NextResponse.json(dayMatches);
}
