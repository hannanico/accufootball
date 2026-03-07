import { db } from "@/db";
import { matches, competitions, selections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Image from "next/image";
import MatchCard from "@/components/MatchCard";
import { syncCompetitionMatches } from "@/lib/syncMatches";
import { auth } from "@/auth";

export default async function LeagueMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const competitionId = parseInt(id);

  const currentMatchday = await syncCompetitionMatches(competitionId);

  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId));

  const leagueMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.competitionId, competitionId))
    .orderBy(matches.utcDate);

  const filtered = currentMatchday
    ? leagueMatches.filter(
        (m) => m.matchday === currentMatchday || m.matchday === currentMatchday + 1
      )
    : leagueMatches;

    // Get user's existing selections for this league
const session = await auth();
const userSelections = session?.user?.id
  ? await db
      .select()
      .from(selections)
      .where(
        and(
          eq(selections.userId, session.user.id),
          eq(selections.competitionId, competitionId)
        )
      )
  : [];

  const selectionMap = Object.fromEntries(
    userSelections.map((s) => [s.matchId, s.prediction])
  );

  const grouped = filtered.reduce((acc, match) => {
    const key = match.matchday;
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<number, typeof leagueMatches>);

  const matchdays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    return (
    <div className="px-5 py-6 pb-28">

      {/* League header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center p-2 shrink-0">
          <div className="w-full h-full relative">
            <Image src={competition.emblemUrl} alt={competition.name} fill className="object-contain" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-black text-white uppercase tracking-wide">
            {competition.name}
          </h1>
          <p className="text-s text-gray-500 mt-0.5">{competition.country}</p>
        </div>
      </div>

      {matchdays.length === 0 ? (
        <p className="text-gray-500 text-center mt-10 text-m">No upcoming matches found.</p>
      ) : (
        matchdays.map((matchday) => (
          <div key={matchday} className="mb-8">
            {/* Matchday header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 bg-yellow-400 rounded-full" />
              <h2 className="text-s font-black text-white uppercase tracking-widest">
                Matchday {matchday}
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {grouped[matchday].map((match) => (
                <MatchCard key={match.id} match={match} userPrediction={selectionMap[match.id] ?? null} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
