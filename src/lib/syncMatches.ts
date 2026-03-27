import { db } from "@/db";
import { matches } from "@/db/schema";
import { sql } from "drizzle-orm";

const FOOTBALL_API = "https://api.football-data.org/v4";

function mapMatch(m: any) {
  return {
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
  };
}

async function fetchAndUpsertMatches(competitionId: number, status: string): Promise<any[]> {
  const res = await fetch(
    `${FOOTBALL_API}/competitions/${competitionId}/matches?status=${status}`,
    {
      headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! },
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (!res.ok || !data.matches?.length) return [];

  const values = data.matches
    .filter((m: any) => m.homeTeam?.id && m.awayTeam?.id)
    .map(mapMatch);

  if (!values.length) return [];

  await db.insert(matches).values(values).onConflictDoUpdate({
    target: matches.id,
    set: {
      utcDate: sql`excluded.utc_date`,
      status: sql`excluded.status`,
      homeScore: sql`excluded.home_score`,
      awayScore: sql`excluded.away_score`,
      winner: sql`excluded.winner`,
      lastUpdated: sql`excluded.last_updated`,
    },
  });

  return values;
}

export async function syncCompetition(competitionId: number): Promise<number | null> {
  try {
    const [scheduled] = await Promise.all([
      fetchAndUpsertMatches(competitionId, "SCHEDULED,TIMED"),
      fetchAndUpsertMatches(competitionId, "IN_PLAY,PAUSED,FINISHED"),
    ]);

    return scheduled[0]?.matchday ?? null;
  } catch (err) {
    console.error(`syncCompetition error [${competitionId}]:`, err);
    return null;
  }
}
