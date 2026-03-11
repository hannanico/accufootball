import { auth } from "@/auth";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import FeaturedSlider from "@/components/FeaturedSlider";
import { getLeaderboard } from "@/app/actions/leaderboard";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const session = await auth();
  const t = await getTranslations("home");

  const upcoming = await db
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
    .limit(6);

  const [weekly, monthly] = await Promise.all([
    getLeaderboard(7),
    getLeaderboard(30),
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

      {/* Weekly Top */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">{t("weeklyTop")}</h2>
        </div>
        <LeaderboardTable rows={weekly} t={t} />
      </div>

      {/* Monthly Top */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">{t("monthlyTop")}</h2>
        </div>
        <LeaderboardTable rows={monthly} t={t} />
      </div>
    </div>
  );
}

function LeaderboardTable({
  rows,
  t,
}: {
  rows: Awaited<ReturnType<typeof getLeaderboard>>;
  t: Awaited<ReturnType<typeof getTranslations<"home">>>;
}) {
  if (rows.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 text-center text-gray-500 text-sm">
        {t("rankingSoon")}
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[28px_1fr_48px_48px_56px] gap-2 px-4 py-2 border-b border-[#2a2a2a]">
        <span className="text-[10px] text-gray-600 uppercase">#</span>
        <span className="text-[10px] text-gray-600 uppercase">{t("player")}</span>
        <span className="text-[10px] text-gray-600 uppercase text-center">{t("acc")}</span>
        <span className="text-[10px] text-gray-600 uppercase text-center">{t("edge")}</span>
        <span className="text-[10px] text-gray-600 uppercase text-center">{t("score")}</span>
      </div>

      {rows.map((row, i) => (
        <div
          key={row.userId}
          className="grid grid-cols-[28px_1fr_48px_48px_56px] gap-2 px-4 py-3 border-b border-[#1a1a1a] last:border-0 items-center"
        >
          <span className={`text-xs font-black ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-400" : "text-gray-600"}`}>
            {i + 1}
          </span>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-wide truncate">{row.name}</p>
            <p className="text-[10px] text-gray-400">{row.total} {t("selections")}</p>
          </div>
          <span className="text-xs font-black text-green-400 text-center">{row.accuracy}%</span>
          <span className="text-xs font-black text-yellow-400 text-center">{row.edge}x</span>
          <span className="text-xs font-black text-white text-center">{row.rankScore}</span>
        </div>
      ))}
    </div>
  );
}
