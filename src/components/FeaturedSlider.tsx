"use client";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Match = {
  id: number;
  homeTeamShort: string;
  homeTeamCrest: string;
  awayTeamShort: string;
  awayTeamCrest: string;
  utcDate: Date;
  status: string;
  leagueId: number;
};

export default function FeaturedSlider({ matches }: { matches: Match[] }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();
  const featured = matches.slice(0, 4);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swiped left → next
        setCurrent((prev) => (prev + 1) % featured.length);
      } else {
        // swiped right → prev
        setCurrent((prev) => (prev - 1 + featured.length) % featured.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="relative">
      {/* Card */}
      <div
        className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top content with padding */}
        <div className="px-8 pt-6 pb-6">

          {/* Date bar */}
          <div className="text-center mb-5">
            <span className="text-s font-bold text-yellow-400 tracking-widest uppercase">
              {new Date(featured[current].utcDate).toLocaleDateString("en-GB", {
                weekday: "long", month: "short", day: "numeric", timeZone: "UTC",
              })}
            </span>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between">
            {/* Home */}
            <div className="flex flex-col items-center gap-4 w-24">
              <div className="w-20 h-20 relative">
                <Image
                  src={featured[current].homeTeamCrest}
                  alt={featured[current].homeTeamShort}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-sm font-black text-center text-white uppercase tracking-wide leading-tight">
                {featured[current].homeTeamShort}
              </p>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl font-black text-yellow-400">VS</span>
              <span className="text-[15px] text-gray-400 uppercase tracking-widest">
                Match Day
              </span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-4 w-24">
              <div className="w-20 h-20 relative">
                <Image
                  src={featured[current].awayTeamCrest}
                  alt={featured[current].awayTeamShort}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-sm font-black text-center text-white uppercase tracking-wide leading-tight">
                {featured[current].awayTeamShort}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#3a3a3a]" />

        {/* Button area */}
        <div className="flex justify-center px-3 py-3">
          <button
            onClick={() => router.push(`/leagues/${featured[current].leagueId}`)}
            className="w-2/3 py-2 bg-yellow-400 text-black text-[18px] font-black uppercase tracking-widest rounded-xl hover:bg-yellow-300 transition-colors"
          >
            Make Prediction
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-3 mt-5">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "bg-yellow-400 w-6" : "bg-[#3a3a3a] w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
