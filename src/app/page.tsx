import { auth } from "@/auth";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import FeaturedSlider from "@/components/FeaturedSlider";
import { getLeaderboard } from "@/app/actions/leaderboard";

export default async function HomePage() {
  const session = await auth();

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
            Featured Matches
          </h2>
          <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        </div>
        {upcoming.length > 0 ? (
          <FeaturedSlider matches={upcoming} />
        ) : (
          <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl p-6 text-center text-gray-500 text-sm">
            No upcoming matches right now
          </div>
        )}
      </div>

      {/* Weekly Top */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Weekly Top</h2>
        </div>
        <LeaderboardTable rows={weekly} />
      </div>

      {/* Monthly Top */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">Monthly Top</h2>
        </div>
        <LeaderboardTable rows={monthly} />
      </div>
    </div>
  );
}

function LeaderboardTable({ rows }: { rows: Awaited<ReturnType<typeof getLeaderboard>> }) {
  if (rows.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 text-center text-gray-500 text-sm">
        Rankings coming soon — need 10+ resolved picks to appear
      </div>
    );
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[28px_1fr_48px_48px_56px] gap-2 px-4 py-2 border-b border-[#2a2a2a]">
        <span className="text-[10px] text-gray-600 uppercase">#</span>
        <span className="text-[10px] text-gray-600 uppercase">Player</span>
        <span className="text-[10px] text-gray-600 uppercase text-center">Acc</span>
        <span className="text-[10px] text-gray-600 uppercase text-center">Edge</span>
        <span className="text-[10px] text-gray-600 uppercase text-right">Score</span>
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
            <p className="text-[10px] text-gray-600">{row.total} picks</p>
          </div>
          <span className="text-xs font-black text-green-400 text-center">{row.accuracy}%</span>
          <span className="text-xs font-black text-yellow-400 text-center">{row.edge}x</span>
          <span className="text-xs font-black text-white text-right">{row.rankScore}</span>
        </div>
      ))}
    </div>
  );
}
