"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  async function handleSignOut() {
    await signOut({ redirect: false });
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full py-4 border border-red-500 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-colors"
    >
      Sign Out
    </button>
  );
}
