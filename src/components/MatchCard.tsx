"use client";
import Image from "next/image";
import { useState } from "react";
import { toggleSelection } from "@/app/actions/selections";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const t = useTranslations("match");
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(userPrediction ?? null);
  const [loading, setLoading] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const date = new Date(match.utcDate);
  const dateLocale = locale === "es" ? "es-ES" : "en-GB";

  const dateStr = date.toLocaleDateString(dateLocale, {
    weekday: "short", month: "short", day: "numeric",
  });
  const timeStr = date.toLocaleTimeString(dateLocale, {
    hour: "2-digit", minute: "2-digit",
  });

  const now = new Date();
  const kickoff = new Date(match.utcDate);
  const minutesUntilKickoff = (kickoff.getTime() - now.getTime()) / 1000 / 60;
  const isLocked = minutesUntilKickoff <= 5;

  const isFinished = match.status === "FINISHED";
  const canPredict = !isLocked && !isFinished &&
    (match.status === "SCHEDULED" || match.status === "TIMED");

  async function handlePrediction(option: string) {
    // Not logged in — show hint briefly
    if (!session) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 3000);
      return;
    }
    if (loading || !canPredict) return;
    setLoading(true);
    const newSelected = selected === option ? null : option;
    setSelected(newSelected);
    await toggleSelection(match.id, match.competitionId, option);
    setLoading(false);
  }

  const options = [
    { value: "HOME_TEAM", label: match.homeTeamShort },
    { value: "DRAW",      label: t("draw") },
    { value: "AWAY_TEAM", label: match.awayTeamShort },
  ];

  function getButtonStyle(value: string) {
    if (!isFinished) {
      return selected === value
        ? "bg-yellow-400 text-black"
        : "bg-[#2a2a2a] text-gray-400 border border-[#3a3a3a]";
    }
    const userPicked = selected === value;
    const isWinner = match.winner === value;
    if (userPicked && isWinner)  return "bg-green-500 text-white";
    if (userPicked && !isWinner) return "bg-red-500 text-white";
    if (!userPicked && isWinner) return "bg-[#2a2a2a] text-green-400 border border-green-600";
    return "bg-[#2a2a2a] text-gray-600 border border-[#3a3a3a]";
  }

  return (
    <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl overflow-hidden">

      {/* Date bar */}
      <div className="px-4 py-2 border-b border-[#2a2a2a] flex items-center justify-between">
        <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">
          {dateStr} · {timeStr}
        </p>
        {isLocked && !isFinished && (
          <span className="text-[10px] text-yellow-400 font-black uppercase tracking-widest">
            {t("locked")}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex flex-col items-center gap-2 w-24">
          <div className="w-12 h-12 relative">
            <Image src={match.homeTeamCrest} alt={match.homeTeamShort} fill className="object-contain" />
          </div>
          <p className="text-xs text-center font-black text-white uppercase tracking-wide leading-tight">
            {match.homeTeamShort}
          </p>
        </div>

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
                ? `${match.homeTeamShort} ${t("won")}`
                : match.winner === "AWAY_TEAM"
                ? `${match.awayTeamShort} ${t("won")}`
                : t("draw")}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 w-24">
          <div className="w-12 h-12 relative">
            <Image src={match.awayTeamCrest} alt={match.awayTeamShort} fill className="object-contain" />
          </div>
          <p className="text-xs text-center font-black text-white uppercase tracking-wide leading-tight">
            {match.awayTeamShort}
          </p>
        </div>
      </div>

      {/* Prediction buttons or login hint */}
      <div className="px-4 pb-4">
        {showLoginHint ? (
          // Login hint — slides in when guest taps a button
          <div
            className="flex items-center justify-between bg-[#2a2a2a] border border-yellow-400/40 rounded-xl px-4 py-2.5 cursor-pointer"
            onClick={() => router.push("/auth/signin")}
          >
            <p className="text-xs text-yellow-400 font-black uppercase tracking-wide">
              {t("loginToPredict")}
            </p>
            <span className="text-yellow-400 text-lg">→</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePrediction(opt.value)}
                disabled={loading || (!session && false) || (!canPredict && !!session)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all active:scale-95 ${getButtonStyle(opt.value)} disabled:cursor-not-allowed`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
