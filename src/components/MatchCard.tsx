"use client";
import Image from "next/image";
import { useState } from "react";
import { toggleSelection } from "@/app/actions/selections";

type Match = {
  id: number;
  competitionId: number;
  homeTeamName: string;
  homeTeamShort: string;
  homeTeamCrest: string;
  awayTeamName: string;
  awayTeamShort: string;
  awayTeamCrest: string;
  utcDate: Date;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
};

export default function MatchCard({
  match,
  userPrediction,
}: {
  match: Match;
  userPrediction?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(userPrediction ?? null);
  const [loading, setLoading] = useState(false);

  const date = new Date(match.utcDate);
  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  });
  const timeStr = date.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  });

  async function handlePrediction(option: string) {
    if (loading || (match.status !== "SCHEDULED" && match.status !== "TIMED")) return;
    setLoading(true);
    const newSelected = selected === option ? null : option;
    setSelected(newSelected);
    await toggleSelection(match.id, match.competitionId, option);
    setLoading(false);
  }

  const options = [
    { value: "HOME_TEAM", label: match.homeTeamShort },
    { value: "DRAW", label: "Draw" },
    { value: "AWAY_TEAM", label: match.awayTeamShort },
  ];

  const isFinished = match.status === "FINISHED";
  const canPredict = match.status === "SCHEDULED" || match.status === "TIMED";

  return (
    <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl overflow-hidden">

      {/* Date bar */}
      <div className="px-4 py-2 border-b border-[#2a2a2a]">
        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
          {dateStr} · {timeStr}
        </p>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between px-4 py-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 w-24">
          <div className="w-12 h-12 relative">
            <Image src={match.homeTeamCrest} alt={match.homeTeamShort} fill className="object-contain" />
          </div>
          <p className="text-xs text-center font-black text-white uppercase tracking-wide leading-tight">
            {match.homeTeamShort}
          </p>
        </div>

        {/* Score or time */}
        <div className="flex flex-col items-center gap-1">
          {isFinished ? (
            <span className="text-2xl font-black text-white">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-lg font-black text-yellow-400">{timeStr}</span>
          )}
          {isFinished && match.winner && (
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              {match.winner === "HOME_TEAM"
                ? match.homeTeamShort
                : match.winner === "AWAY_TEAM"
                ? match.awayTeamShort
                : "Draw"} won
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 w-24">
          <div className="w-12 h-12 relative">
            <Image src={match.awayTeamCrest} alt={match.awayTeamShort} fill className="object-contain" />
          </div>
          <p className="text-xs text-center font-black text-white uppercase tracking-wide leading-tight">
            {match.awayTeamShort}
          </p>
        </div>
      </div>

      {/* Prediction buttons */}
      <div className="flex gap-2 px-4 pb-4">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handlePrediction(opt.value)}
              disabled={loading || !canPredict}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95 ${
                isSelected
                  ? "bg-yellow-400 text-black"
                  : "bg-[#2a2a2a] text-gray-400 border border-[#3a3a3a]"
              } disabled:opacity-50`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
