import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { selections, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import LanguageToggle from "@/components/LanguageToggle";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const t = await getTranslations("account");

  const [userSelections, userRow] = await Promise.all([
    db.select().from(selections).where(eq(selections.userId, session.user.id)),
    db.select({ language: users.language }).from(users).where(eq(users.id, session.user.id)).then(r => r[0]),
  ]);

  const total = userSelections.length;
  const resolved = userSelections.filter(s => s.isCorrect !== null);
  const correct = resolved.filter(s => s.isCorrect === true).length;
  const accuracy = resolved.length > 0 ? Math.round((correct / resolved.length) * 100) : null;

  const totalEdge = resolved
    .filter(s => s.isCorrect === true)
    .reduce((sum, s) => sum + Number(s.score ?? 0), 0);
  const edge = correct > 0 ? Math.round((totalEdge / correct) * 10) / 10 : null;

  return (
    <div className="px-5 py-6 pb-28">

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        <h1 className="text-s font-black text-white uppercase tracking-widest">
          {t("title")}
        </h1>
      </div>

      {/* Profile card */}
      <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-5 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-black text-2xl font-black shrink-0">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-black text-white text-lg uppercase tracking-wide">
              {session.user.name}
            </p>
            <p className="text-s text-gray-400 mt-0.5">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-yellow-400">{total}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">{t("predictions")}</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-green-400">{correct}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">{t("correct")}</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-yellow-400">{accuracy !== null ? `${accuracy}%` : "—"}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">{t("accuracy")}</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-yellow-400">{edge !== null ? `${edge}x` : "—"}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">{t("edge")}</p>
          <p className="text-[11px] text-gray-400 mt-0">{t("vsCrowdAvg")}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2 mb-6">
        <Link
          href="/account/history"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">{t("history")}</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
        <Link
          href="/selections"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">{t("predictions")}</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
        <Link
          href="/leagues"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">{t("leagues")}</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
        <Link
          href="/account/change-password"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">{t("changePassword")}</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
      </div>

      {/* Language toggle */}
      <LanguageToggle current={userRow?.language ?? "en"} />

      {/* Sign out */}
      <SignOutButton />
    </div>
  );
}
