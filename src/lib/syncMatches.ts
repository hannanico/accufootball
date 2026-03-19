import { db } from "@/db";
import { matches } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function syncCompetitionMatches(competitionId: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${competitionId}/matches?status=SCHEDULED,TIMED`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! },
        cache: "no-store",
      }
    );

    const data = await res.json();
    if (!res.ok || !data.matches?.length) return null;

    const validMatches = data.matches.filter(
      (m: any) => m.homeTeam?.id && m.awayTeam?.id
    );
    if (!validMatches.length) return null;

    const currentMatchday = validMatches[0]?.matchday ?? null;

    const values = validMatches.map((m: any) => ({
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
        utcDate: sql`excluded.utc_date`,
        status: sql`excluded.status`,
        homeScore: sql`excluded.home_score`,
        awayScore: sql`excluded.away_score`,
        winner: sql`excluded.winner`,
        lastUpdated: sql`excluded.last_updated`,
      },
    });

    return currentMatchday;
  } catch (err) {
    console.error("syncCompetitionMatches error:", err);
    return null;
  }
}

export async function syncFinishedMatches(competitionId: number): Promise<void> {
  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${competitionId}/matches?status=LIVE,FINISHED`, // 👈 removed dateFrom/dateTo
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY! },
        cache: "no-store",
      }
    );

    const data = await res.json();
    if (!res.ok || !data.matches?.length) return;

    const values = data.matches
      .filter((m: any) => m.homeTeam?.id && m.awayTeam?.id)
      .map((m: any) => ({
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

    if (!values.length) return;

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
  } catch (err) {
    console.error("syncFinishedMatches error:", err);
  }
}
