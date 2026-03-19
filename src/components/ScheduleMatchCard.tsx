// Read-only match card for the schedule page.
// No prediction buttons — just teams, time, and result if available.
import Image from "next/image";

type ScheduleMatch = {
  id: number;
  homeTeamShort: string;
  homeTeamCrest: string;
  awayTeamShort: string;
  awayTeamCrest: string;
  utcDate: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
};

export default function ScheduleMatchCard({ match }: { match: ScheduleMatch }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";

  const timeStr = new Date(match.utcDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-4 py-3 flex items-center justify-between gap-3">

      {/* Home team */}
      <div className="flex flex-col items-center gap-1 w-16">
        <div className="w-8 h-8 relative">
          <Image src={match.homeTeamCrest} alt={match.homeTeamShort} fill className="object-contain" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-wide text-center leading-tight">
          {match.homeTeamShort}
        </p>
      </div>

      {/* Center: score or time or live badge */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {isFinished && (
          <>
            <span className="text-lg font-black text-white">
              {match.homeScore} - {match.awayScore}
            </span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">FT</span>
          </>
        )}
        {isLive && (
          <>
            <span className="text-lg font-black text-white">
              {match.homeScore} - {match.awayScore}
            </span>
            {/* Red dot pulse to indicate live */}
            <span className="flex items-center gap-1 text-[9px] text-red-400 font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Live
            </span>
          </>
        )}
        {!isFinished && !isLive && (
          <span className="text-sm font-black text-yellow-400">{timeStr}</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex flex-col items-center gap-1 w-16">
        <div className="w-8 h-8 relative">
          <Image src={match.awayTeamCrest} alt={match.awayTeamShort} fill className="object-contain" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-wide text-center leading-tight">
          {match.awayTeamShort}
        </p>
      </div>

    </div>
  );
}
