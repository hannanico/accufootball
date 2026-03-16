"use client";

// Client component: 3 toggle buttons to switch leaderboard period.
// Updates the URL search param so the server page re-fetches the right data.
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const PERIODS = [
  { value: "all",   labelKey: "periodAll"   },
  { value: "week",  labelKey: "periodWeek"  },
  { value: "month", labelKey: "periodMonth" },
] as const;

export default function RankingPeriodFilter() {
  const t = useTranslations("home");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Default to "all" when no param is present.
  const active = searchParams.get("period") ?? "all";

  function setPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("period"); // Keep URL clean for the default state.
    } else {
      params.set("period", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 mb-4">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => setPeriod(p.value)}
          className={`flex-1 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border transition-colors ${
            active === p.value
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-gray-400 border-[#3a3a3a]"
          }`}
        >
          {t(p.labelKey)}
        </button>
      ))}
    </div>
  );
}
