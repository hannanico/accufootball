import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { selections } from "@/db/schema";
import { eq } from "drizzle-orm";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const userSelections = await db
    .select()
    .from(selections)
    .where(eq(selections.userId, session.user.id));

  const total = userSelections.length;
  const correct = userSelections.filter((s) => s.isCorrect === true).length;
  const pending = userSelections.filter((s) => s.isCorrect === null).length;
  const resolved = total - pending;
  const accuracy = resolved > 0 ? Math.round((correct / resolved) * 100) : null;


  return (
    <div className="px-5 py-6 pb-28">

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-yellow-400 rounded-full" />
        <h1 className="text-s font-black text-white uppercase tracking-widest">
          My Account
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
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Total Picks</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-green-400">{correct}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Correct</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-gray-400">{pending}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Pending</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-yellow-400">{accuracy !== null ? `${accuracy}%` : "—"}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mt-1">Accuracy</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2 mb-6">
        <Link
          href="/selections"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">My Selections</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
        <Link
          href="/leagues"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">Browse Leagues</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
        <Link
          href="/auth/forgot-password"
          className="flex items-center justify-between bg-[#1c1c1c] border border-[#3a3a3a] rounded-xl px-5 py-4"
        >
          <span className="text-s font-black text-white uppercase tracking-wide">Change Password</span>
          <span className="text-yellow-400 text-2xl">›</span>
        </Link>
      </div>

      {/* Sign out */}
      <SignOutButton />
    </div>
  );
}
