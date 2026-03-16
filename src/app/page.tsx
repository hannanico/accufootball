import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import FeaturedSlider from "@/components/FeaturedSlider";
import LeaderboardTable from "@/components/LeaderboardTable";
import RankingPeriodFilter from "@/components/RankingPeriodFilter";
import { getLeaderboard } from "@/app/actions/leaderboard";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const t = await getTranslations("home");

  // Resolve period to a day count; null means all time.
  const days =
    period === "week"  ? 7  :
    period === "month" ? 30 :
    null; // "all" or no param → no date filter

  const [upcoming, leaderboard] = await Promise.all([
    db
      .select({
        id: matches.id,
        homeTeamShort: matches.homeTeamShort,
        homeTeamCrest: matches.homeTeamCrest,
        awayTeamShort: matches.awayTeamShort,
        awayTeamCrest: matches.awayTeamCrest,
        utcDate: matches.utcDate,
        status: matches.status,
        leagueId: matches.competitionId,
      })
      .from(matches)
      .where(eq(matches.status, "TIMED"))
      .orderBy(matches.utcDate)
      .limit(6),

    // Pass days (or null) to getLeaderboard — see note below.
    getLeaderboard(days),
  ]);

  return (
    <div className="min-h-screen pb-28">

      {/* Featured Matches */}
      <div className="mt-5 px-5">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-1 h-6 bg-yellow-400 rounded-full" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">
            {t("featuredMatches")}
          </h2>
          <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        </div>

        {upcoming.length > 0 ? (
          <FeaturedSlider matches={upcoming} />
        ) : (
          <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl p-6 text-center text-gray-500 text-sm">
            {t("noUpcoming")}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            {t("leaderboard")}
          </h2>
        </div>

        {/* Period filter — needs Suspense because it uses useSearchParams */}
        <Suspense>
          <RankingPeriodFilter />
        </Suspense>

        <LeaderboardTable rows={leaderboard} t={t} />
      </div>

      {/* How it works */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            {t("howItWorks")}
          </h2>
        </div>
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-base">🎯</span>
            <p className="text-[12px] text-gray-400">{t("how1")}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">🔒</span>
            <p className="text-[12px] text-gray-400">
              {t("how2prefix")} <span className="text-white font-bold">{t("how2lock")}</span> {t("how2suffix")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">📊</span>
            <p className="text-[12px] text-gray-400">
              <span className="text-green-400 font-bold">{t("how3label")}</span> {t("how3")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">⚡</span>
            <p className="text-[12px] text-gray-400">
              {t("how4prefix")} <span className="text-yellow-400 font-bold">{t("how4label")}</span> {t("how4suffix")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">🏆</span>
            <p className="text-[12px] text-gray-400">
              {t("how5prefix")} <span className="text-white font-bold">{t("how5label")}</span> {t("how5suffix")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
