import { getLeaderboard } from "@/app/actions/leaderboard";
import { getTranslations } from "next-intl/server";

export default function LeaderboardTable({
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
      {/* Column headers */}
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
          {/* Rank number — gold/silver/bronze for top 3 */}
          <span className={`text-xs font-black ${
            i === 0 ? "text-yellow-400" :
            i === 1 ? "text-gray-300"   :
            i === 2 ? "text-orange-400" :
                      "text-gray-600"
          }`}>
            {i + 1}
          </span>

          <div>
            <p className="text-xs font-black text-white uppercase tracking-wide truncate">
              {row.name}
            </p>
            <p className="text-[10px] text-gray-400">
              {row.total} {t("selections")}
            </p>
          </div>

          <span className="text-xs font-black text-green-400 text-center">{row.accuracy}%</span>
          <span className="text-xs font-black text-yellow-400 text-center">{row.edge}x</span>
          <span className="text-xs font-black text-white text-center">{row.rankScore}</span>
        </div>
      ))}
    </div>
  );
}
