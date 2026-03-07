import { db } from "@/db";
import { competitions } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";

export default async function LeaguesPage() {
  const leagues = await db.select().from(competitions);

  return (
    <div className="px-5 py-6 pb-0">

      {/* Title */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        <h1 className="text-m font-black text-white uppercase tracking-widest">
          Pick a League
        </h1>
      </div>

      {/* League cards */}
      <div className="flex flex-col gap-3">
        {leagues.map((league) => (
          <Link
            key={league.id}
            href={`/leagues/${league.id}`}
            className="flex items-center gap-4 bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 active:scale-95 transition-all hover:border-yellow-400"
          >
      {/* Logo */}
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 p-2">
            <div className="w-full h-full relative">
              <Image
                src={league.emblemUrl}
                alt={league.name}
                fill
                className="object-contain"
              />
            </div>
          </div>      

            {/* Text */}
            <div className="flex-1">
              <p className="font-black text-white uppercase tracking-wide text-sm">
                {league.name}
              </p>
              <p className="text-s text-gray-500 mt-0.5">{league.country}</p>
            </div>

            {/* Arrow */}
            <span className="text-yellow-400 font-black text-xl">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
