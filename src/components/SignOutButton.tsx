"use client";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function SignOutButton() {
  const t = useTranslations("account");

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="w-full py-4 border border-red-500 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-colors"
    >
      {t("signOut")}
    </button>
  );
}
