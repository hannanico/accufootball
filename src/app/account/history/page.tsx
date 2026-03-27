import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { selections, matches, competitions } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import LeagueFilter from "@/components/LeagueFilter";
import { getTranslations } from "next-intl/server";

function getDateFrom(range: string | null): Date | null {
  const now = new Date();
  switch (range) {
    case "7":
      now.setDate(now.getDate() - 7);
      return now;
    case "30":
      now.setDate(now.getDate() - 30);
      return now;
    case "90":
      now.setDate(now.getDate() - 90);
      return now;
    case "all":
    default:
      return null; // no date filter
  }
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ league?: string; range?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const t = await getTranslations("history");
  const { league, range } = await searchParams;
  const activeLeague = league ?? null;
  const activeRange = range ?? "30"; // default to 30 days

  const dateFrom = getDateFrom(activeRange);

  const history = await db
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
    .where(
      and(
        eq(selections.userId, session.user.id),
        eq(matches.status, "FINISHED"),
        dateFrom ? gte(matches.utcDate, dateFrom) : undefined
      )
    )
    .orderBy(matches.utcDate);

  const leagues = Object.values(
    history.reduce((acc, s) => {
      if (!acc[s.competitionId])
        acc[s.competitionId] = { id: s.competitionId, name: s.competitionName, emblem: s.competitionEmblem };
      return acc;
    }, {} as Record<number, { id: number; name: string; emblem: string }>)
  );

  const grouped = history
    .filter((s) => !activeLeague || s.competitionName === activeLeague)
    .reduce((acc, s) => {
      const key = s.competitionName;
      if (!acc[key]) acc[key] = { emblem: s.competitionEmblem, competitionId: s.competitionId, items: [] };
      acc[key].items.push(s);
      return acc;
    }, {} as Record<string, { emblem: string; competitionId: number; items: typeof history }>);

  const correct = history.filter(s => s.isCorrect === true).length;
  const total = history.length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;

  const ranges = [
    { label: "7d", value: "7" },
    { label: "30d", value: "30" },
    { label: "90d", value: "90" },
    { label: t("allTime"), value: "all" },
  ];

  return (
    <div className="px-5 py-6 pb-28">

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        <h1 className="text-s font-black text-white uppercase tracking-widest">
          {t("title")}
        </h1>
        <Link
          href="/selections"
          className="ml-auto text-[13px] font-black uppercase tracking-widest text-yellow-400 border border-yellow-400 rounded-lg px-3 py-1.5"
        >
          {t("mySelections")}
        </Link>
      </div>

      {/* Date range filter */}
      <div className="flex gap-2 mb-6">
        {ranges.map(({ label, value }) => {
          const params = new URLSearchParams();
          params.set("range", value);
          if (activeLeague) params.set("league", activeLeague);
          return (
            <Link
              key={value}
              href={`?${params.toString()}`}
              className={`flex-1 text-center text-[11px] font-black uppercase tracking-widest py-2 rounded-lg border transition-colors ${
                activeRange === value
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "bg-[#1c1c1c] text-gray-400 border-[#3a3a3a]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Stats bar */}
      {total > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-yellow-400">{total}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{t("resolved")}</p>
          </div>
          <div className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-green-400">{correct}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{t("correct")}</p>
          </div>
          <div className="flex-1 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-yellow-400">
              {accuracy !== null ? `${accuracy}%` : "—"}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{t("accuracy")}</p>
          </div>
        </div>
      )}

      {/* League filter */}
      {leagues.length > 1 && <LeagueFilter leagues={leagues} />}

      {/* Empty state */}
      {total === 0 ? (
        <div className="text-center mt-24">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-white font-black uppercase tracking-wide mb-2">{t("noFinished")}</p>
          <p className="text-gray-500 text-sm">{t("noFinishedHint")}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([competitionName, { emblem, competitionId, items }]) => (
          <div key={competitionName} className="mb-8">
            <Link href={`/leagues/${competitionId}`} className="flex items-center gap-3 mb-3">
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
