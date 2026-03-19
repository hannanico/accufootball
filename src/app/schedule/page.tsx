import { db } from "@/db";
import { matches, competitions } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import Image from "next/image";
import { Suspense } from "react";
import DayStrip from "@/components/DayStrip";
import ScheduleMatchCard from "@/components/ScheduleMatchCard";
import { getTranslations } from "next-intl/server";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const { date, status } = await searchParams;
  const t = await getTranslations("schedule");

  const todayStr = new Date().toISOString().slice(0, 10);

  // Default to today if no date param.
  const targetDateStr = date ?? todayStr;
  const targetDate = new Date(targetDateStr);
  const isToday = targetDateStr === todayStr;

  // Build UTC day boundaries for the query.
  const dayStart = new Date(targetDate);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setUTCHours(23, 59, 59, 999);

  // Fetch all matches for the selected day, joined with competition info.
  let dayMatches = await db
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

  // Apply status filter only when viewing today.
  if (isToday && status && status !== "all") {
    dayMatches = dayMatches.filter((m) => {
      if (status === "live") {
        return m.status === "IN_PLAY" || m.status === "PAUSED";
      }
      if (status === "finished") {
        return m.status === "FINISHED";
      }
      if (status === "upcoming") {
        return m.status === "SCHEDULED" || m.status === "TIMED";
      }
      return true;
    });
  }

  // Group matches by competition for display.
  const grouped = dayMatches.reduce((acc, m) => {
    const key = m.competitionName;
    if (!acc[key]) {
      acc[key] = {
        emblem: m.competitionEmblem,
        matches: [],
      };
    }
    acc[key].matches.push(m);
    return acc;
  }, {} as Record<string, { emblem: string; matches: typeof dayMatches }>);

  const competitions_list = Object.entries(grouped);

  return (
    <div className="px-5 py-6 pb-28">
      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        <h1 className="text-m font-black text-white uppercase tracking-widest">
          {t("title")}
        </h1>
      </div>

      {/* Day selector + (when today) status filters */}
      <div className="mb-6">
        <Suspense>
          <DayStrip />
        </Suspense>
      </div>

      {/* Matches grouped by competition */}
      {competitions_list.length === 0 ? (
        <p className="text-gray-500 text-center mt-16 text-sm">
          {t("noMatches")}
        </p>
      ) : (
        competitions_list.map(([name, { emblem, matches: compMatches }]) => (
          <div key={name} className="mb-8">
            {/* Competition header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center p-1 shrink-0">
                <div className="w-full h-full relative">
                  <Image src={emblem} alt={name} fill className="object-contain" />
                </div>
              </div>
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest">
                {name}
              </h2>
            </div>

            {/* Match cards for this competition */}
            <div className="flex flex-col gap-2">
              {compMatches.map((m) => (
                <ScheduleMatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
