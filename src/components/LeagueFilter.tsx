"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface Props {
  leagues: { id: number; name: string; emblem: string }[];
}

export default function LeagueFilter({ leagues }: Props) {
  const t = useTranslations("selections");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("league");

  function select(name: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (name) params.set("league", name);
    else params.delete("league");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <button
        onClick={() => select(null)}
        className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
          !active
            ? "bg-yellow-400 text-black border-yellow-400"
            : "text-gray-400 border-[#3a3a3a]"
        }`}
      >
        {t("all")}
      </button>
      {leagues.map((l) => (
        <button
          key={l.id}
          onClick={() => select(l.name)}
          className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
            active === l.name
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-gray-400 border-[#3a3a3a]"
          }`}
        >
          {l.name}
        </button>
      ))}
    </div>
  );
}
