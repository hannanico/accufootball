"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const t = useTranslations("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email, password, mode: "signin", redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError(t("invalidCredentials"));
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-gray-400 mb-8">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">{t("emailLabel")}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")} required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">{t("passwordLabel")}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")} required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <a href="/auth/forgot-password" className="text-right text-xs text-yellow-400 -mt-2">
          {t("forgotPassword")}
        </a>

        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl mt-2 active:scale-95 transition-transform disabled:opacity-50">
          {loading ? t("signingIn") : t("signInButton")}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        {t("noAccount")}{" "}
        <a href="/auth/signup" className="text-yellow-400 font-medium">{t("signUp")}</a>
      </p>
    </div>
  );
}
