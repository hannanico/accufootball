import { db } from "@/db";
import { matches, competitions, selections } from "@/db/schema";
import { eq, and, ne, gt } from "drizzle-orm";
import Image from "next/image";
import MatchCard from "@/components/MatchCard";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache"; 

const getLeagueMatches = (competitionId: number) =>
  unstable_cache(
    async () => {
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      return db
        .select()
        .from(matches)
        .where(
          and(
            eq(matches.competitionId, competitionId),
            ne(matches.status, "FINISHED"),
            gt(matches.utcDate, fiveMinutesFromNow)
          )
        )
        .orderBy(matches.utcDate, matches.id);
    },
    [`league-matches-${competitionId}`],
    { revalidate: 3600, tags: [`league-${competitionId}`] }
  )();

const getCompetition = (competitionId: number) =>
  unstable_cache(
    async () =>
      db
        .select()
        .from(competitions)
        .where(eq(competitions.id, competitionId)),
    [`competition-${competitionId}`],
    { revalidate: 86400 } 
  )();

export default async function LeagueMatchesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const competitionId = parseInt(id);
  const t = await getTranslations("leagues");

  const [[competition], leagueMatches, session] = await Promise.all([
    getCompetition(competitionId),
    getLeagueMatches(competitionId),
    auth(),
  ]);

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

  const visibleMatchdays = [...new Set(leagueMatches.map((m) => m.matchday))].sort((a, b) => a - b);
  const shownMatchdays = visibleMatchdays.slice(0, 2);
  const finalVisible = leagueMatches.filter((m) => shownMatchdays.includes(m.matchday));

  const grouped = finalVisible.reduce((acc, match) => {
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
        <p className="text-gray-500 text-center mt-10 text-m">{t("noMatches")}</p>
      ) : (
        matchdays.map((matchday) => (
          <div key={matchday} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 bg-yellow-400 rounded-full" />
              <h2 className="text-s font-black text-white uppercase tracking-widest">
                {t("matchday")} {matchday}
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
