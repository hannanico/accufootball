import { auth } from "@/auth";
import { db } from "@/db";
import { selections, matches, competitions } from "@/db/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import MatchCard from "@/components/MatchCard";
import { checkMatchResults } from "@/app/actions/selections";
import LeagueFilter from "@/components/LeagueFilter";

export default async function SelectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  await checkMatchResults();

  const userSelections = await db
    .select({
      selectionId: selections.id,
      prediction: selections.prediction,
      isCorrect: selections.isCorrect,
      match: matches,
      competitionId: competitions.id,
      competitionName: competitions.name,
      competitionEmblem: competitions.emblemUrl,
    })
    .from(selections)
    .innerJoin(matches, eq(selections.matchId, matches.id))
    .innerJoin(competitions, eq(selections.competitionId, competitions.id))
    .where(eq(selections.userId, session.user.id))
    .orderBy(matches.utcDate);

  const now = new Date();

  const visibleSelections = userSelections.filter((s) => {
    const minutesUntilKickoff = (new Date(s.match.utcDate).getTime() - now.getTime()) / 1000 / 60;
    const isFinished = s.match.status === "FINISHED";
    const isScheduledOrTimed = s.match.status === "SCHEDULED" || s.match.status === "TIMED";
    const isLocked = minutesUntilKickoff <= 5 && !isFinished;
    return isScheduledOrTimed || isLocked;
  });

  // Extract unique leagues from visible selections
  const leagues = Object.values(
    visibleSelections.reduce((acc, s) => {
      if (!acc[s.competitionId])
        acc[s.competitionId] = { id: s.competitionId, name: s.competitionName, emblem: s.competitionEmblem };
      return acc;
    }, {} as Record<number, { id: number; name: string; emblem: string }>)
  );

  const { league } = await searchParams;
  const activeLeague = league ?? null;

  const grouped = visibleSelections
    .filter((s) => !activeLeague || s.competitionName === activeLeague)
    .reduce((acc, s) => {
      const key = s.competitionName;
      if (!acc[key]) acc[key] = { emblem: s.competitionEmblem, competitionId: s.competitionId, items: [] };
      acc[key].items.push(s);
      return acc;
    }, {} as Record<string, { emblem: string; competitionId: number; items: typeof userSelections }>);

  return (
    <div className="px-5 py-6 pb-28">

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        <h1 className="text-s font-black text-white uppercase tracking-widest">
          My Selections
        </h1>
        <Link
          href="/account/history"
          className="ml-auto text-[13px] font-black uppercase tracking-widest text-yellow-400 border border-yellow-400 rounded-lg px-3 py-1.5"
        >
          Past Predictions
        </Link>
      </div>

      {/* Stats bar */}
      {userSelections.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-yellow-400">{visibleSelections.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Active</p>
          </div>
          <div className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-green-400">
              {userSelections.filter(s => s.isCorrect === true).length}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Correct</p>
          </div>
          <div className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-red-400">
              {userSelections.filter(s => s.isCorrect === false).length}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Wrong</p>
          </div>
        </div>
      )}

      {/* League filter — only if more than 1 league */}
      {leagues.length > 1 && <LeagueFilter leagues={leagues} />}

      {/* Empty state */}
      {userSelections.length === 0 ? (
        <div className="text-center mt-24">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-white font-black uppercase tracking-wide mb-2">No selections yet</p>
          <p className="text-gray-500 text-sm mb-6">Start predicting match results!</p>
          <Link
            href="/leagues"
            className="bg-yellow-400 text-black font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest"
          >
            Pick Matches
          </Link>
        </div>
      ) : (
        Object.entries(grouped).map(([competitionName, { emblem, competitionId, items }]) => (
          <div key={competitionName} className="mb-8">
            <Link
              href={`/leagues/${competitionId}`}
              className="flex items-center gap-3 mb-3"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0">
                <div className="w-full h-full relative">
                  <Image src={emblem} alt={competitionName} fill className="object-contain" />
                </div>
              </div>
              <h2 className="text-s font-black text-white uppercase tracking-widest">
                {competitionName}
              </h2>
              <span className="text-yellow-400 text-3xl ml-auto">›</span>
            </Link>

            <div className="flex flex-col gap-3">
              {items.map((s) => (
                <MatchCard
                  key={s.selectionId}
                  match={s.match}
                  userPrediction={s.prediction}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
