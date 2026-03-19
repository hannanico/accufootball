"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

// ─── Helpers ────────────────────────────────────────────────────────────────

// Local date string to avoid UTC timezone shift (e.g. April 4 showing as April 3)
function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse "YYYY-MM-DD" back to local Date (no UTC conversion)
function fromDateParam(param: string): Date {
  const [y, m, d] = param.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Build calendar grid cells for a given month — nulls pad the start to align Sun-Sat
function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

const STATUS_FILTERS = [
  { value: "all",      label: "All"      },
  { value: "live",     label: "Live 🔴"  },
  { value: "finished", label: "Finished" },
  { value: "upcoming", label: "Upcoming" },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────

export default function DayStrip() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const dateLocale = locale === "es" ? "es-ES" : "en-GB";

  const todayParam   = toDateParam(new Date());
  const activeParam  = searchParams.get("date") ?? todayParam;
  const activeDate   = fromDateParam(activeParam);  // Date object for arithmetic
  const activeStatus = searchParams.get("status") ?? "all";
  const isToday      = activeParam === todayParam;

  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());

  // ── Navigation ─────────────────────────────────────────────────────────

  function navigate(dateParam: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (dateParam === todayParam) {
      params.delete("date");
    } else {
      params.set("date", dateParam);
    }

    // Status filter only applies to today — clear it when switching days
    if (dateParam !== todayParam) params.delete("status");

    router.replace(`${pathname}?${params.toString()}`);
    setShowCalendar(false);
  }

  function shiftDay(delta: number) {
    navigate(toDateParam(addDays(activeDate, delta)));
  }

  function setStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  // ── Calendar month nav ─────────────────────────────────────────────────

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  // ── Date labels ────────────────────────────────────────────────────────

  const yesterday = addDays(activeDate, -1);
  const tomorrow  = addDays(activeDate, +1);

  function formatShort(date: Date) {
    return date.toLocaleDateString(dateLocale, {
      weekday: "short", day: "numeric", month: "short",
    }).toUpperCase();
  }

  const calDays = getDaysInMonth(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString(dateLocale, {
    month: "long", year: "numeric",
  });

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Date nav row */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => shiftDay(-1)}
          className="text-yellow-400 font-black text-xl px-2 py-2"
        >
          ‹
        </button>

        <button
          onClick={() => navigate(toDateParam(yesterday))}
          className="flex-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-wider truncate"
        >
          {formatShort(yesterday)}
        </button>

        {/* Center chip — always opens calendar */}
        <button
          onClick={() => setShowCalendar(true)}
          className={`flex items-center gap-1 px-3 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-colors ${
            isToday
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-yellow-400 border-yellow-400/50"
          }`}
        >
          {isToday ? "TODAY" : formatShort(activeDate)}
          <span>📅</span>
        </button>

        <button
          onClick={() => navigate(toDateParam(tomorrow))}
          className="flex-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-wider truncate"
        >
          {formatShort(tomorrow)}
        </button>

        <button
          onClick={() => shiftDay(+1)}
          className="text-yellow-400 font-black text-xl px-2 py-2"
        >
          ›
        </button>
      </div>

      {/* Status filter — only visible when viewing today */}
      {isToday && (
        <div className="flex gap-2 mb-5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`flex-1 text-[10px] font-black uppercase tracking-widest py-1.5 rounded-lg border transition-colors ${
                activeStatus === f.value
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "text-gray-400 border-[#3a3a3a]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Calendar modal */}
      {showCalendar && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setShowCalendar(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2a2a2a] rounded-t-2xl p-5 pb-8">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="text-yellow-400 font-black text-xl px-2">‹</button>
              <p className="text-sm font-black text-white uppercase tracking-widest">
                {monthLabel}
              </p>
              <button onClick={nextMonth} className="text-yellow-400 font-black text-xl px-2">›</button>
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute top-4 right-4 text-gray-500 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <p key={d} className="text-[10px] text-gray-600 text-center font-black uppercase">
                  {d}
                </p>
              ))}
            </div>

            {/* Day grid — uses activeParam (string) for comparison, not activeDate (Date) */}
            <div className="grid grid-cols-7 gap-y-1">
              {calDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;

                const param       = toDateParam(day);
                const isActive    = activeParam === param;    // ✅ string vs string
                const isTodayCell = todayParam  === param;

                return (
                  <button
                    key={param}
                    onClick={() => navigate(param)}
                    className={`mx-auto w-9 h-9 rounded-full text-xs font-black transition-colors flex items-center justify-center ${
                      isActive
                        ? "bg-yellow-400 text-black"
                        : isTodayCell
                        ? "border border-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Jump to today button */}
            <button
              onClick={() => navigate(todayParam)}
              className="mt-5 w-full py-2.5 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl"
            >
              Today
            </button>
          </div>
        </>
      )}
    </>
  );
}
