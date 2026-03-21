"use client";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toDateParam } from "@/lib/dateUtil";
import Image from "next/image";
import Link from "next/link";
import DayStrip from "@/components/DayStrip";
import ScheduleMatchCard from "@/components/ScheduleMatchCard";

type Match = {
  id: number;
  homeTeamShort: string;
  homeTeamCrest: string;
  awayTeamShort: string;
  awayTeamCrest: string;
  utcDate: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  competitionId: number;
  competitionName: string;
  competitionEmblem: string;
};

export default function SchedulePage() {
  const t = useTranslations("schedule");
  const searchParams = useSearchParams();
  const todayParam = toDateParam(new Date()); // ✅ local date, runs in browser
  const date = searchParams.get("date") ?? todayParam;
  const status = searchParams.get("status") ?? "all";

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/schedule?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setMatches(data);
        setLoading(false);
      });
  }, [date]);

  // Apply status filter client-side
  const filtered = matches.filter((m) => {
    if (status === "all") return true;
    if (status === "live")     return m.status === "IN_PLAY" || m.status === "PAUSED";
    if (status === "finished") return m.status === "FINISHED";
    if (status === "upcoming") return m.status === "SCHEDULED" || m.status === "TIMED";
    return true;
  });

  const grouped = filtered.reduce((acc, m) => {
    const key = m.competitionName;
    if (!acc[key]) acc[key] = { emblem: m.competitionEmblem, competitionId: m.competitionId, matches: [] };
    acc[key].matches.push(m);
    return acc;
  }, {} as Record<string, { emblem: string; competitionId: number; matches: Match[] }>);

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

      {/* Day selector */}
      <div className="mb-6">
        <DayStrip />
      </div>

      {/* Matches */}
      {loading ? (
        <p className="text-gray-500 text-center mt-16 text-sm">...</p>
      ) : competitions_list.length === 0 ? (
        <p className="text-gray-500 text-center mt-16 text-sm">{t("noMatches")}</p>
      ) : (
        competitions_list.map(([name, { emblem, competitionId, matches: compMatches }]) => (
          <div key={name} className="mb-8">
            <Link href={`/leagues/${competitionId}`} className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 shrink-0">
                <div className="w-full h-full relative">
                  <Image src={emblem} alt={name} fill className="object-contain" />
                </div>
              </div>
              <h2 className="text-s font-black text-white uppercase tracking-widest">{name}</h2>
              <span className="text-yellow-400 text-3xl ml-auto">›</span>
            </Link>

            <div className="flex flex-col gap-2">
              {compMatches.map((m) => (
                <ScheduleMatchCard key={m.id} match={{ ...m, utcDate: new Date(m.utcDate) }} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
