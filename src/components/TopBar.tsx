import { auth } from "@/auth";
import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";

export default async function TopBar() {
  const session = await auth();

  return (
    <div className="flex items-center justify-between px-6 py-5 bg-[#111111] border-b border-[#222222]">
      <div className="ml-1">
        <HamburgerMenu />
      </div>

      <h1 className="text-2xl font-black text-yellow-400 tracking-widest">
        ACCUFOOTBALL
      </h1>

      {session ? (
        <div className="mr-1">
          <Link
            href="/account"
            className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black text-xl"
          >
            {session.user?.name?.charAt(0).toUpperCase()}
          </Link>
        </div>
      ) : (
        <div className="flex gap-2 mr-1">
          <Link
            href="/auth/signin"
            className="text-xs font-bold text-black bg-yellow-400 px-4 py-2 rounded-lg"
          >
            LOGIN
          </Link>
          <Link
            href="/auth/signup"
            className="text-xs font-bold text-yellow-400 border border-yellow-400 px-4 py-2 rounded-lg"
          >
            SIGN UP
          </Link>
        </div>
      )}
    </div>
  );
}
