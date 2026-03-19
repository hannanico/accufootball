"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { toDateParam, fromDateParam, addDays } from "@/lib/dateUtil";
import { useTranslations } from "next-intl";
import CalendarModal from "@/components/schedule/CalendarModal";
import StatusFilter from "@/components/schedule/StatusFilter";

export default function DayStrip() {
   const t = useTranslations("schedule");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const dateLocale = locale === "es" ? "es-ES" : "en-GB";

  const todayParam   = toDateParam(new Date());
  const activeParam  = searchParams.get("date") ?? todayParam;
  const activeDate   = fromDateParam(activeParam);
  const activeStatus = searchParams.get("status") ?? "all";
  const isToday      = activeParam === todayParam;

  const [showCalendar, setShowCalendar] = useState(false);

  function navigate(dateParam: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (dateParam === todayParam) params.delete("date");
    else params.set("date", dateParam);
    if (dateParam !== todayParam) params.delete("status");
    router.replace(`${pathname}?${params.toString()}`);
    setShowCalendar(false);
  }

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("status");
    else params.set("status", value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  const formatActive = activeDate.toLocaleDateString(dateLocale, {
    weekday: "short", day: "numeric", month: "short",
  }).toUpperCase();

  return (
    <>
      {/* Date nav row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          onClick={() => navigate(toDateParam(addDays(activeDate, -1)))}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3a3a3a] text-yellow-400 font-black text-lg"
        >
          ‹
        </button>

        <button
          onClick={() => setShowCalendar(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-black text-[11px] uppercase tracking-widest transition-colors ${
            isToday
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-yellow-400 border-yellow-400/60 bg-yellow-400/5"
          }`}
        >
          {isToday ? t("today") : formatActive}
          <span>📅</span>
        </button>

        <button
          onClick={() => navigate(toDateParam(addDays(activeDate, +1)))}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#3a3a3a] text-yellow-400 font-black text-lg"
        >
          ›
        </button>
      </div>

      {/* Back to today — only when not on today */}
      {!isToday && (
        <button
          onClick={() => navigate(todayParam)}
          className="w-full mb-3 py-2 rounded-xl border border-yellow-400/40 text-yellow-400 font-black text-[10px] uppercase tracking-widest"
        >
         {t("backToToday")} 
        </button>
      )}

      {/* Status filter — only on today */}
      {isToday && (
        <StatusFilter active={activeStatus} onChange={setStatus} t={t} />
      )}

      {/* Calendar modal */}
      {showCalendar && (
        <CalendarModal
          activeParam={activeParam}
          todayParam={todayParam}
          dateLocale={dateLocale}
          onNavigate={navigate}
          onClose={() => setShowCalendar(false)}
          todayLabel={t("today")}
        />
      )}
    </>
  );
}
