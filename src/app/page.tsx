import { auth } from "@/auth";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import FeaturedSlider from "@/components/FeaturedSlider";
import HamburgerMenu from "@/components/HamburgerMenu";

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
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            Weekly Top
          </h2>
        </div>
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 text-center text-gray-500 text-sm">
          Rankings coming soon
        </div>
      </div>

      {/* Monthly Top */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            Monthly Top
          </h2>
        </div>
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 text-center text-gray-500 text-sm">
          Rankings coming soon
        </div>
      </div>
    </div>
  );
}
