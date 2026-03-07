import { db } from "@/db";
import { matches } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> }
) {
  const { competitionId } = await params;

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${competitionId}/matches?status=SCHEDULED`,
    { headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! } }
  );

  const text = await res.text();
  console.log("API response:", text.slice(0, 300));

  if (!res.ok) return NextResponse.json({ error: text }, { status: 500 });

  const data = JSON.parse(text);
  const apiMatches = data.matches;

  if (!apiMatches?.length) return NextResponse.json({ synced: 0 });

  const values = apiMatches.map((m: any) => ({
    id: m.id,
    competitionId: m.competition.id,
    matchday: m.matchday,
    season: m.season.startDate.slice(0, 4),
    homeTeamId: m.homeTeam.id,
    homeTeamName: m.homeTeam.name,
    homeTeamShort: m.homeTeam.shortName,
    homeTeamCrest: m.homeTeam.crest,
    awayTeamId: m.awayTeam.id,
    awayTeamName: m.awayTeam.name,
    awayTeamShort: m.awayTeam.shortName,
    awayTeamCrest: m.awayTeam.crest,
    utcDate: new Date(m.utcDate),
    status: m.status,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    winner: m.score?.winner ?? null,
    lastUpdated: new Date(m.lastUpdated),
  }));

  await db.insert(matches).values(values).onConflictDoUpdate({
    target: matches.id,
    set: {
      status: sql`excluded.status`,
      homeScore: sql`excluded.home_score`,
      awayScore: sql`excluded.away_score`,
      winner: sql`excluded.winner`,
      lastUpdated: sql`excluded.last_updated`,
    },
  });

  return NextResponse.json({ synced: values.length });
}
