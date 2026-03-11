"use client";
import { useTranslations } from "next-intl";
import { setLanguage } from "@/app/actions/language";
import { useTransition } from "react";

export default function LanguageToggle({ current }: { current: string }) {
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();

  function toggle(lang: string) {
    startTransition(() => { setLanguage(lang); });
  }

  return (
    <div className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4 mb-2">
      <span className="text-s font-black text-white uppercase tracking-wide">{t("language")}</span>
      <div className="flex gap-2">
        <button
          onClick={() => toggle("en")}
          disabled={isPending}
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
            current === "en"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-gray-400 border-[#3a3a3a]"
          }`}
        >
          {t("english")}
        </button>
        <button
          onClick={() => toggle("es")}
          disabled={isPending}
          className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
            current === "es"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "text-gray-400 border-[#3a3a3a]"
          }`}
        >
          {t("spanish")}
        </button>
      </div>
    </div>
  );
}
