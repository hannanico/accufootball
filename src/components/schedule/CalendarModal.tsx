"use client";

// Calendar bottom sheet modal for picking any date.
import { getDaysInMonth, toDateParam } from "@/lib/dateUtil";
import { useLocale } from "next-intl";
import { useState } from "react";

type Props = {
  activeParam: string;
  todayParam: string;
  dateLocale: string;
  todayLabel: string;
  onNavigate: (param: string) => void;
  onClose: () => void;
};

export default function CalendarModal({
  activeParam, todayParam, dateLocale, onNavigate, onClose, todayLabel,
}: Props) {
  const locale = useLocale();
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2017, 0, 1 + i);
    return new Intl.DateTimeFormat(locale, { weekday: "short" })
      .format(date)
      .toUpperCase();
  });

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  const calDays = getDaysInMonth(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString(dateLocale, {
    month: "long", year: "numeric",
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2a2a2a] rounded-t-2xl p-5 pb-20">

        {/* Month nav */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center text-yellow-400 font-black text-lg rounded-xl border border-[#3a3a3a]">
            ‹
          </button>
          <p className="flex-1 text-center text-sm font-black text-white uppercase tracking-widest">
            {monthLabel}
          </p>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center text-yellow-400 font-black text-lg rounded-xl border border-[#3a3a3a]">
            ›
          </button>
          <button onClick={onClose} className="ml-1 w-9 h-9 flex items-center justify-center text-gray-500 font-black text-base rounded-xl border border-[#3a3a3a]">
            ✕
          </button>
        </div>

        {/* Weekday headers */}
       <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <p key={d} className="text-[10px] text-gray-600 text-center font-black uppercase">{d}</p>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {calDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const param       = toDateParam(day);
            const isActive    = activeParam === param;
            const isTodayCell = todayParam  === param;

            return (
              <button
                key={param}
                onClick={() => onNavigate(param)}
                className={`mx-auto w-9 h-9 rounded-full text-xs font-black transition-colors flex items-center justify-center ${
                  isActive    ? "bg-yellow-400 text-black" :
                  isTodayCell ? "border border-yellow-400 text-yellow-400" :
                                "text-gray-300"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>

        {/* Jump to today */}
        <button
          onClick={() => onNavigate(todayParam)}
          className="mt-4 w-full py-2.5 bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl"
        >
         {todayLabel}
        </button>
      </div>
    </>
  );
}
