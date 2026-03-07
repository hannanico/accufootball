import { auth } from "@/auth";
import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";

export default async function TopBar() {
  const session = await auth();

  return (
    <div className="flex items-center justify-between px-6 py-5 bg-[#111111] border-b border-[#222222]">

  {/* Left */}
  <div className="w-10">
    <HamburgerMenu />
  </div>

  {/* Center */}
  <h1 className="text-xl font-black text-yellow-400 tracking-widest">
    ACCUFOOTBALL
  </h1>

  {/* Right */}
  <div className="w-10 flex justify-end">
    {session ? (
      <Link
        href="/account"
        className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-sm"
      >
        {session.user?.name?.charAt(0).toUpperCase()}
      </Link>
    ) : (
      <Link
        href="/auth/signin"
        className="text-xs font-black text-black bg-yellow-400 px-3 py-2 rounded-lg"
      >
        LOGIN
      </Link>
    )}
  </div>
</div>
  );
}
